import {
	AuthorizationError,
	GraphQLContext,
	PaymentCard,
} from "../../../types";
import getMessage from "../../../utils/getMessage";
import { MESSAGES } from "../../i18n/i18n-server";
import {
	User,
	Product,
	Cart,
	Order,
	ProductDocument,
	IProduct,
	OrderDocument,
} from "@laptopoutlet-packages/models";
import {
	sendEmailVerificationCode,
	sendOrderInvoiceEmail,
} from "../../../utils/sendgrid";
import mongoose, { ClientSession, Model } from "mongoose";
import {
	CardType,
	Currency,
	Locale,
	OrderItemStatus,
	PaymentMethod,
	ShipmentStatus,
} from "@laptopoutlet-packages/types";
import {
	createInstrumentIdentifier,
	createPaymentInstrument,
	getPaymentInstrument,
	processAuthorization,
	processAuthorizationReversal,
	updatePaymentInstrument,
	deletePaymentInstrument,
} from "apps/client/src/utils/paymentFunctions";
import cardValidator from "card-validator";
import { isCardBrand } from "@laptopoutlet-packages/utils";
import { argon2id, hash, verify } from "argon2";
import getCybersourceProductCode from "apps/client/src/utils/getCybersourceProductCode";
import { MutationResolvers } from "graphql-let/__generated__/__types__";
function randomString(length: number) {
	const chars =
		"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var result = "";
	for (var i = length; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}
const abortSessionAndReturnErrorMsg = async (
	message: string,
	session: ClientSession
) => {
	await session.abortTransaction();
	session.endSession();
	return { message };
};
const getAuthorizationErrorMsg = (
	error: AuthorizationError,
	locale: Locale
) => {
	switch (error) {
		case AuthorizationError.EXCEEDS_CREDIT_LIMIT:
			return getMessage(
				MESSAGES[locale]["placeOrder.authorizationError.exeedsCreditLimit"]
			);
		case AuthorizationError.EXPIRED_CARD:
			return getMessage(
				MESSAGES[locale]["placeOrder.authorizationError.expiredCard"]
			);
		case AuthorizationError.UNAUTHORIZED_CARD:
			return getMessage(
				MESSAGES[locale]["placeOrder.authorizationError.unauthorizedCard"]
			);
		case AuthorizationError.INSUFFICIENT_FUND:
			return getMessage(
				MESSAGES[locale]["placeOrder.authorizationError.insufficientFund"]
			);
		case AuthorizationError.AVS_FAILED:
			return getMessage(
				MESSAGES[locale]["placeOrder.authorizationError.avsFailed"]
			);
		default:
			return getMessage(
				MESSAGES[locale]["placeOrder.authorizationError.general"]
			);
	}
};

const Mutation: Required<MutationResolvers> = {
	//User related
	updateUserEmailRequest: async (
		_node,
		{ input: { pendingEmail }, locale },
		{ token }: GraphQLContext
	) => {
		const exists = await User.exists({ email: pendingEmail });
		if (exists) return { message: getMessage(MESSAGES[locale]["emailInUse"]) };
		const code = randomString(5).toUpperCase();
		const hashedCode = await hash(code, {
			type: argon2id,
		});
		const updatedUser = await User.findByIdAndUpdate(
			token?.id,
			{ emailChangeRequest: { pendingEmail, code: hashedCode } },
			{ new: true }
		);
		if (!updatedUser)
			return {
				message: getMessage(MESSAGES[locale]["somethingWentWrong"]),
			};
		try {
			await sendEmailVerificationCode({
				recipient: pendingEmail,
				code,
				locale: locale,
				name: updatedUser.name,
			});
		} catch {
			updatedUser.emailChangeRequest = undefined;
			await updatedUser.save(); //if email wasn't sent then we rollback the changes
			return {
				message: getMessage(MESSAGES[locale]["email.error.couldntSend"]),
			};
		}
		return updatedUser;
	},
	updateUserEmail: async (
		_node,
		{ input, locale },
		{ token }: GraphQLContext
	) => {
		const user = await User.findById(token?.id);
		if (!user) {
			return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		}
		if (user.emailChangeRequest) {
			const valid = await verify(user.emailChangeRequest.code, input.code, {
				type: argon2id,
			});
			if (valid) {
				const pendingEmail = user.emailChangeRequest.pendingEmail;
				const exists = await User.exists({ email: pendingEmail });
				if (exists) {
					return { message: getMessage(MESSAGES[locale]["emailInUse"]) };
				}
				user.emailChangeRequest = undefined;
				user.email = pendingEmail;
				/* actualizar el registro de customer en cybersource. Si el customer de cybersource no ha sido creado, ignorar este paso. */
				const updatedUser = await user.save();
				return updatedUser;
			}
			return {
				message: getMessage(MESSAGES[locale]["updateUserEmail.codeDidntMatch"]),
			};
		}
		return {
			message: getMessage(
				MESSAGES[locale]["updateUserEmail.requestNotAvailable"]
			),
		};
	},
	cancelEmailChangeRequest: async (
		_node,
		{ locale },
		{ token }: GraphQLContext
	) => {
		const user = await User.findByIdAndUpdate(
			token?.id,
			{ emailChangeRequest: undefined },
			{ new: true }
		);
		if (!user) {
			return { message: getMessage(MESSAGES[locale].userNotFound) };
		}
		return user;
	},
	updateUserName: async (
		_node,
		{ input: { name, surname }, locale },
		{ token }: GraphQLContext
	) => {
		const updatedUser = await User.findByIdAndUpdate(
			token?.id,
			{ name, surname },
			{ new: true }
		);
		if (!updatedUser)
			return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		return updatedUser;
	},
	updateUserPhone: async (
		_node,
		{ input: { phone }, locale },
		{ token }: GraphQLContext
	) => {
		const updatedUser = await User.findByIdAndUpdate(
			token?.id,
			{ phone },
			{ new: true }
		);
		if (!updatedUser)
			return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		return updatedUser;
	},

	updateUserLocale: async (
		_node,
		{ input: { locale } },
		{ token }: GraphQLContext
	) => {
		const updatedUser = await User.findByIdAndUpdate(
			token?.id,
			{ locale: locale },
			{ new: true }
		);
		if (!updatedUser)
			return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		return updatedUser;
	},
	updateUserCurrency: async (
		_node,
		{ input: { currency }, locale },
		{ token }: GraphQLContext
	) => {
		const updatedUser = await User.findByIdAndUpdate(
			token?.id,
			{ currency },
			{ new: true }
		);
		if (!updatedUser)
			return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		return updatedUser;
	},
	updateUserNotificationSettings: async (
		_node,
		{ input, locale },
		{ token }: GraphQLContext
	) => {
		const updatedUser = await User.findByIdAndUpdate(
			token?.id,
			{ notificationSettings: { ...input } },
			{ new: true }
		);
		if (!updatedUser)
			return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		return updatedUser;
	},
	//Cart Mutations
	modifyCartItem: async (
		_node,
		{ input: { productid, quantity }, locale },
		{ token }: GraphQLContext
	) => {
		try {
			mongoose.setDefaultLanguage(locale);
			const product = await Product.findById(productid);
			if (
				!product ||
				(quantity > 0 && product.quantity <= 0) ||
				(quantity > 0 && !product.list)
			)
				return {
					message: getMessage(MESSAGES[locale]["productNotAvailable"]),
					reason: "outOfStock",
				};

			if (product.quantity < quantity)
				return {
					message: getMessage(MESSAGES[locale]["cart.invalidQuantity"]),
					reason: "maxQuantityError",
				};

			if (quantity <= 0) {
				const cart = await Cart.findOneAndUpdate(
					{ _id: token?.id },
					{
						$pull: {
							cartItems: { product: productid as any },
						},
						$unset: { instaCheckout: 1 },
					},
					{ new: true }
				)
					.populate("cartItems.product instaCheckout.product")
					.exec();
				if (cart) {
					return cart.toJSON({ virtuals: true }) as any;
				} else {
					return {
						message: getMessage(MESSAGES[locale]["cart.productNotAdded"]),
					};
				}
			}
			const cart = await Cart.findOneAndUpdate(
				{ _id: token?.id, "cartItems.product": productid as any },
				{
					$unset: { instaCheckout: 1 },
					$set: {
						"cartItems.$": { product: productid as any, quantity: quantity },
					},
				},
				{ new: true }
			)
				.populate("cartItems.product instaCheckout.product")
				.exec();
			if (!cart)
				return {
					message: getMessage(MESSAGES[locale]["cart.productNotAdded"]),
				};
			return cart;
		} catch (error) {
			return {
				message: getMessage(MESSAGES[locale]["cart.modifyError"]),
			};
		}
	},
	modifyInstaCheckout: async (
		_node,
		{ input: { quantity, productid }, locale },
		{ token }: GraphQLContext
	) => {
		try {
			mongoose.setDefaultLanguage(locale);
			const product = await Product.findById(productid);
			if (
				!product ||
				(quantity > 0 && product.quantity <= 0) ||
				(quantity > 0 && !product.list)
			)
				return {
					message: getMessage(MESSAGES[locale]["productNotAvailable"]),
					reason: "outOfStock",
				};

			if (product.quantity < quantity)
				return {
					message: getMessage(MESSAGES[locale]["cart.invalidQuantity"]),
					reason: "maxQuantityError",
				};

			if (quantity <= 0) {
				const cart = await Cart.findOneAndUpdate(
					{ _id: token?.id },
					{ $unset: { instaCheckout: 1 } },
					{ new: true }
				)
					.populate("cartItems.product instaCheckout.product")
					.exec();
				if (!cart)
					return {
						message: getMessage(MESSAGES[locale]["cart.productNotAdded"]),
					};
				return cart.toJSON({ virtuals: true });
			}
			const cart = await Cart.findOneAndUpdate(
				{ _id: token?.id, "instaCheckout.product": productid as any },
				{
					instaCheckout: { product: productid, quantity } as any,
				},
				{ new: true }
			)
				.populate("cartItems.product instaCheckout.product")
				.exec();
			if (!cart)
				return {
					message: getMessage(MESSAGES[locale]["cart.productNotAdded"]),
				};
			return cart.toJSON({ virtuals: true });
		} catch (error) {
			return {
				message: getMessage(MESSAGES[locale]["cart.modifyError"]),
			};
		}
	},
	addCartItem: async (
		_node,
		{ productid, locale },
		{ token }: GraphQLContext
	) => {
		mongoose.setDefaultLanguage(locale);
		const cart = await Cart.findById(token?.id);
		const product = await Product.findById(productid);
		if (!cart) {
			const newCart = new Cart({
				_id: token?.id,
				cartItems: [],
			});
			if (!product?.list || product.quantity <= 0)
				return {
					message: getMessage(MESSAGES[locale]["productNotAvailable"]),
					reason: "outOfStock",
				};
			newCart.cartItems = [{ product: productid, quantity: 1 } as any];
			const updatedCart = await (await newCart.save())
				.populate("cartItems.product instaCheckout.product")
				.execPopulate();
			return updatedCart.toJSON({ virtuals: true }) as any;
		}
		cart.instaCheckout = undefined;
		if (!product?.list || product.quantity <= 0)
			return {
				message: getMessage(MESSAGES[locale]["productNotAvailable"]),
				reason: "outOfStock",
			};
		if (
			!cart.cartItems.some(
				(cartItem) => cartItem.product === (productid as any)
			)
		) {
			cart.cartItems = [
				...cart.cartItems,
				{ product: productid, quantity: 1 },
			] as any;
			const updatedCart = await (await cart.save())
				.populate("cartItems.product instaCheckout.product")
				.execPopulate();
			return updatedCart.toJSON({ virtuals: true }) as any;
		}
		let added = false;
		cart.cartItems = cart.cartItems.map((cartItem) => {
			if (
				cartItem.product === (productid as any) &&
				cartItem.quantity + 1 <= product.quantity
			) {
				added = true;
				return {
					product: cartItem.product,
					quantity: cartItem.quantity + 1,
				};
			} else {
				return cartItem;
			}
		}) as any;
		if (!added)
			return {
				message: getMessage(MESSAGES[locale]["cart.maxQuantityError"]),
				reason: "maxQuantityError",
			};
		const updatedCart = await (await cart.save())
			.populate("cartItems.product instaCheckout.product")
			.execPopulate();

		return updatedCart.toJSON({ virtuals: true }) as any;
	},
	setInstaCheckout: async (
		_node,
		{ productid, locale },
		{ token }: GraphQLContext
	) => {
		try {
			mongoose.setDefaultLanguage(locale);
			const cart = await Cart.findById(token?.id);
			const product = await (Product as Model<ProductDocument>).findById(
				productid
			);
			if (!cart) {
				const newCart = new Cart({
					_id: token?.id,
					cartItems: [],
				});
				if (!product?.list || product.quantity <= 0)
					return {
						message: getMessage(MESSAGES[locale]["productNotAvailable"]),
						reason: "outOfStock",
					};

				newCart.instaCheckout = {
					product: productid,
					quantity: 1,
				} as any;
				const updatedCart = await (await newCart.save())
					.populate("cartItems.product instaCheckout.product")
					.execPopulate();

				return updatedCart.toJSON({ virtuals: true }) as any;
			}
			if (!product?.list || product.quantity <= 0)
				return {
					message: getMessage(MESSAGES[locale]["productNotAvailable"]),
					reason: "outOfStock",
				};
			cart.instaCheckout = {
				product: productid as any,
				quantity: 1,
			} as any;
			const updatedCart = await (await cart.save())
				.populate("cartItems.product instaCheckout.product")
				.execPopulate();

			return updatedCart.toJSON({ virtuals: true });
		} catch (error) {
			return {
				message: getMessage(MESSAGES[locale]["cart.modifyError"]),
			};
		}
	},
	removeInstaCheckout: async (_node, { locale }, { token }: GraphQLContext) => {
		const cart = await Cart.findByIdAndUpdate(
			token?.id,
			{
				$unset: { instaCheckout: 1 },
			},
			{ new: true }
		)
			.populate("cartItems.product instaCheckout.product")
			.exec();
		if (!cart)
			return {
				message: getMessage(MESSAGES[locale]["cart.notExist"]),
			};
		return cart.toJSON({ virtuals: true });
	},
	//Address Mutations
	createUserAddress: async (
		_node,
		{ input, locale },
		{ token }: GraphQLContext
	) => {
		const user = await User.findByIdAndUpdate(
			token?.id,
			{ $push: { addresses: input as any } },
			{ new: true }
		);
		if (!user?.addresses)
			return { message: getMessage(MESSAGES[locale]["generalError"]) };
		user.shippingAddress = user.addresses[user.addresses.length - 1].id;
		const savedUser = await user.save();
		return savedUser;
	},
	updateUserAddress: async (
		_node,
		{ input, locale },
		{ token }: GraphQLContext
	) => {
		if (input.selectAddress) {
			const user = await User.findOneAndUpdate(
				{ _id: token?.id, "addresses._id": input.id },
				{
					$set: {
						"addresses.$": {
							...input,
							_id: input.id,
						},
					},
					shippingAddress: input.id,
				},
				{ new: true }
			);
			if (user) return user;
		}
		const user = await User.findOneAndUpdate(
			{ _id: token?.id, "addresses._id": input.id },
			{
				$set: {
					"addresses.$": {
						...input,
						_id: input.id,
					},
				},
			},
			{ new: true }
		);
		if (!user) return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		return user;
	},
	selectUserAddress: async (
		_node,
		{ addressID, locale },
		{ token }: GraphQLContext
	) => {
		const user = await User.findByIdAndUpdate(
			token?.id,
			{ shippingAddress: addressID },
			{ new: true }
		);
		if (!user) return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		return user;
	},
	deleteUserAddress: async (
		_node,
		{ addressID, locale },
		{ token }: GraphQLContext
	) => {
		const user = await User.findOneAndUpdate(
			{ _id: token?.id, "addresses._id": addressID },
			{ $pull: { addresses: { _id: addressID } as any } },
			{ new: true }
		);
		if (!user) return { message: getMessage(MESSAGES[locale]["userNotFound"]) };
		if (user.addresses && user.addresses.length > 0) {
			user.shippingAddress = user.addresses[user.addresses.length - 1].id;
			await user.save();
		}
		return user;
	},
	changeDefaultPaymentCard: async (
		_node,
		{ locale, paymentCardID },
		{ token }: GraphQLContext
	) => {
		const user = await User.findByIdAndUpdate(
			token?.id,
			{ paymentInstrument: paymentCardID },
			{ new: true }
		);
		if (!user)
			return {
				message: getMessage(MESSAGES[locale].somethingWentWrong),
			};
		const exists = user.paymentInstruments?.some((id) => id === paymentCardID);
		if (
			!exists ||
			!user.paymentInstruments?.length ||
			user.paymentInstruments.length < 1
		)
			return {
				message: getMessage(MESSAGES[locale].somethingWentWrong),
			};
		const paymentInstrumentsFunctions = user.paymentInstruments.map((id) =>
			getPaymentInstrument(id)
		);
		const paymentInstruments = await Promise.all(paymentInstrumentsFunctions);
		return {
			paymentCards: paymentInstruments
				.filter((item) => !!item)
				.map((item) => item?.paymentCard) as PaymentCard[],
			defaultCard: user.paymentInstrument,
		};
	},
	deletePaymentCard: async (
		_node,
		{ locale, paymentCardID },
		{ token }: GraphQLContext
	) => {
		const result = await deletePaymentInstrument(paymentCardID);
		if (!result)
			return {
				message: getMessage(MESSAGES[locale].somethingWentWrong),
			};
		const user = await User.findByIdAndUpdate(
			token?.id,
			{
				$pull: { paymentInstruments: paymentCardID },
			},
			{ new: true }
		);
		if (!user)
			return {
				message: getMessage(MESSAGES[locale].somethingWentWrong),
			};
		if (!user.paymentInstruments || user.paymentInstruments.length === 0)
			return { paymentCards: [] };
		const paymentInstrumentsFunctions = user.paymentInstruments.map((id) =>
			getPaymentInstrument(id)
		);
		const paymentInstruments = await Promise.all(paymentInstrumentsFunctions);
		return {
			paymentCards: paymentInstruments
				.filter((item) => !!item)
				.map((item) => item?.paymentCard) as PaymentCard[],
			defaultCard: user.paymentInstrument,
		};
	},
	addPaymentCard: async (
		_node,
		{ locale, input },
		{ token }: GraphQLContext
	) => {
		const user = await User.findById(token?.id);
		if (!user)
			return { message: getMessage(MESSAGES[locale].somethingWentWrong) };
		if (user.paymentInstruments?.length && user.paymentInstruments.length >= 5)
			return {
				message: getMessage(MESSAGES[locale]["paymentCards.maxQuantity"]),
			};
		const cardType = cardValidator.number(input.cardNumber).card?.type || "";
		if (!isCardBrand(cardType))
			return { message: getMessage(MESSAGES[locale].invalidCardNumber) };
		const instrumentIdentifier = await createInstrumentIdentifier(
			input.cardNumber
		);
		if (!instrumentIdentifier)
			return { message: MESSAGES[locale]["somethingWentWrong"] };
		if (typeof instrumentIdentifier === "string")
			return { message: instrumentIdentifier };
		if (!user.paymentInstruments) user.paymentInstruments = [];
		const paymentInstrumentsFunctionsBefore = user.paymentInstruments.map(
			(id) => getPaymentInstrument(id)
		);
		const paymentInstrumentsBefore = (
			await Promise.all(paymentInstrumentsFunctionsBefore)
		).filter((item) => !!item);
		const exists = paymentInstrumentsBefore.some(
			(item) => item?.instrumentIdentifier === instrumentIdentifier.id
		);
		if (exists)
			return {
				message: getMessage(MESSAGES[locale]["paymentCards.existsError"]),
			};
		const nameOnCardArray = input.nameOnCard.split(" ");

		const paymentCard = await createPaymentInstrument(
			{
				instrumentIdentifier: {
					id: instrumentIdentifier.id,
				},
				card: {
					expirationMonth: input.expiryMonth,
					expirationYear: "20" + input.expiryYear,
					type: cardType,
				},
				billTo: {
					firstName: nameOnCardArray.shift() || "",
					lastName: nameOnCardArray.join(" "),
					address1: input.billingAddress.addressLine1,
					address2: input.billingAddress.addressLine2,
					administrativeArea: input.billingAddress.province,
					locality: input.billingAddress.city,
					postalCode: input.billingAddress.zipcode,
					country: input.billingAddress.country,
				},
			},
			locale
		);
		if (!paymentCard)
			return { message: getMessage(MESSAGES[locale]["somethingWentWrong"]) };
		if (typeof paymentCard === "string") return { message: paymentCard };
		user.paymentInstruments.push(paymentCard.id);
		if (input.makeDefault) user.paymentInstrument = paymentCard.id;
		await user.save();
		const paymentInstrumentsAfter = [
			...paymentInstrumentsBefore,
			{ instrumentIdentifier: "", paymentCard },
		];
		return {
			paymentCards: paymentInstrumentsAfter
				.filter((item) => !!item)
				.map((item) => item?.paymentCard) as PaymentCard[],
			defaultCard: user.paymentInstrument,
		};
	},
	updatePaymentCard: async (
		_node,
		{ locale, input },
		{ token }: GraphQLContext
	) => {
		const user = await User.findById(token?.id);
		if (!user)
			return {
				message: getMessage(MESSAGES[locale].somethingWentWrong),
			};
		if (!user.paymentInstruments)
			return {
				message: getMessage(MESSAGES[locale].somethingWentWrong),
			};
		const nameOnCardArray = input.nameOnCard.split(" ");
		const paymentCard = await updatePaymentInstrument(
			input.id,
			{
				card: {
					expirationMonth: input.expiryMonth,
					expirationYear: "20" + input.expiryYear,
				},
				billTo: {
					firstName: nameOnCardArray.shift() || "",
					lastName: nameOnCardArray.join(" "),
					address1: input.billingAddress.addressLine1,
					address2: input.billingAddress.addressLine2,
					country: input.billingAddress.country,
					administrativeArea: input.billingAddress.province,
					locality: input.billingAddress.city,
					postalCode: input.billingAddress.zipcode,
				},
			},
			locale
		);
		if (!paymentCard)
			return {
				message: getMessage(MESSAGES[locale].somethingWentWrong),
			};
		if (typeof paymentCard === "string") return { message: paymentCard };
		if (input.makeDefault) {
			user.paymentInstrument = paymentCard.id;
			await user.save();
		}
		const paymentInstrumentsFunctions = user.paymentInstruments.map((id) =>
			getPaymentInstrument(id)
		);
		const paymentInstruments = await Promise.all(paymentInstrumentsFunctions);
		return {
			paymentCards: paymentInstruments
				.filter((item) => !!item)
				.map((item) => item?.paymentCard) as PaymentCard[],
			defaultCard: user.paymentInstrument,
		};
	},
	placeOrder: async (
		_node,
		{ locale, ipAddress, fingerprintSessionId },
		{ token }: GraphQLContext
	) => {
		mongoose.setDefaultLanguage(locale);
		const session = await mongoose.startSession();
		session.startTransaction();
		const user = await User.findById(token?.id).session(session);
		const cart = await Cart.findOne({ _id: token?.id })
			.session(session)
			.populate("cartItems.product instaCheckout.product")
			.exec();
		const cartFullTranslations = cart?.toJSON();
		if (!user)
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale].somethingWentWrong),
				session
			);
		if (!cart)
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale]["placeOrder.cartEmpty"]),
				session
			);
		const shippingAddress = user?.addresses?.find(
			(userAddress) => userAddress?.id === user?.shippingAddress
		);
		if (!shippingAddress)
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale]["placeOrder.missingShippingAddress"]),
				session
			);
		if (
			!user.paymentInstrument ||
			!user.paymentInstruments ||
			!user.paymentInstruments.some(
				(paymentInstrument) => paymentInstrument === user.paymentInstrument
			)
		)
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale]["placeOrder.missingPaymentCard"]),
				session
			);
		const paymentInstrument = await getPaymentInstrument(
			user.paymentInstrument
		);
		if (!paymentInstrument)
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale]["placeOrder.paymentCardGetError"]),
				session
			);
		const orderid = `${Date.now()}${Math.floor(
			Math.pow(10, 3) + Math.random() * (Math.pow(10, 4) - Math.pow(10, 3) - 1)
		)}`;
		if (
			cart.instaCheckout?.product &&
			cartFullTranslations?.instaCheckout?.product //Si el objeto instaCheckout existe usar este objeto para realizar el pedido. Sino usar cart.cartItems
		) {
			try {
				const product = await (
					Product as Model<ProductDocument>
				).findByIdAndUpdate(
					cart.instaCheckout.product?.id,
					{ $inc: { quantity: Math.abs(cart.instaCheckout.quantity) * -1 } },
					{ new: true, session }
				); //reducimos la cantidad del producto
				if (!product || !product.list || product.quantity < 0)
					return await abortSessionAndReturnErrorMsg(
						getMessage(MESSAGES[locale]["placeOrder.productUnavailable"]),
						session
					);
				if (
					cart.cartItems.some((cartItem) => cartItem.product?.id === product.id)
				) {
					const index = cart.cartItems.findIndex(
						(cartItem) => cartItem.product?.id === product.id
					);
					if (cart.cartItems[index].product !== null)
						(cart.cartItems[index].product as IProduct).quantity =
							product.quantity; //actualizamos la cantidad en el carrito si el producto está dentro del carrito
				}
			} catch (error) {
				//si ocurre un error lo mas probable es que tratamos de asignar una cantidad negativa al campo "quantity" del producto. Lo cual quiere decir que no hay suficiente en el inventario
				return await abortSessionAndReturnErrorMsg(
					getMessage(MESSAGES[locale].somethingWentWrong),
					session
				);
			}
			const authorizationResponse = await processAuthorization({
				paymentInstrumentId: user.paymentInstrument,
				userId: user.id,
				email: user.email,
				fingerprintSessionId,
				ipAddress,
				items: [
					{
						productCode: getCybersourceProductCode(
							cart.instaCheckout.product.type
						),
						productName: cart.instaCheckout.product.listing.longTitle,
						productSku: cart.instaCheckout.product.id,
						quantity: cart.instaCheckout.quantity,
						unitPrice: `${cart.instaCheckout.totalPrice}`,
					},
				],
			}); //Hacer autorización del pedido aqui con los datos de cart.instaCheckout, paymentInstrument y shippingAddress
			if (!authorizationResponse)
				return await abortSessionAndReturnErrorMsg(
					getMessage(MESSAGES[locale]["placeOrder.processAuthorizationError"]),
					session
				);
			if (authorizationResponse.error) {
				await processAuthorizationReversal({
					authorizationId: authorizationResponse.id,
					reason: "Error de autorización",
					totalAmount: authorizationResponse.totalAmount,
					userId: user.id,
				});
				return await abortSessionAndReturnErrorMsg(
					getAuthorizationErrorMsg(authorizationResponse.error, locale),
					session
				);
			}
			const orderDoc = new (Order as Model<OrderDocument>)({
				_id: orderid,
				user: user.id,
				paymentMethod: {
					name: PaymentMethod.PaymentCard,
					card: {
						type: paymentInstrument.paymentCard.type,
						snippet: paymentInstrument.paymentCard.snippet,
						brand: paymentInstrument.paymentCard.brand,
					},
				},
				shippingAddress,
				shipments: [
					{
						_id: authorizationResponse.id,
						orderItems: [
							{
								product: cart.instaCheckout.product.id,
								title:
									cartFullTranslations.instaCheckout.product.listing.longTitle,
								applyDiscount: cart.instaCheckout.product.applyDiscount,
								freeShipping: cart.instaCheckout.product.freeShipping,
								pricing: cart.instaCheckout.product.pricing,
								slug: cart.instaCheckout.product.slug,
								status: OrderItemStatus.Normal,
								condition: cart.instaCheckout.product.condition,
								imageUrl: cart.instaCheckout.product.images?.[0]?.url,
								imagePlaceholder:
									cart.instaCheckout.product.images?.[0]?.placeholder,
								invoice: {
									shippingTotalPrice: cart.instaCheckout.shippingTotalPrice,
									totalQuantity: cart.instaCheckout.totalQuantity,
									itemsTotalPrice: cart.instaCheckout.itemsTotalPrice,
								},
							},
						],
						status: ShipmentStatus.Pending,
					},
				],
				invoice: {
					shippingTotalPrice: cart.instaCheckout.shippingTotalPrice,
					totalQuantity: cart.instaCheckout.totalQuantity,
					itemsTotalPrice: cart.instaCheckout.itemsTotalPrice,
				},
			});
			try {
				cart.instaCheckout = undefined; //vaciamos el objeto de instacheckout
				const [newOrderDoc] = await Promise.all([
					orderDoc.save({ session }),
					cart.save({ session }),
				]);
				const order = newOrderDoc.toJSON({ virtuals: true });
				await session.commitTransaction();
				await sendOrderInvoiceEmail({
					locale,
					recipient: user.email,
					addressLine1: order.shippingAddress.address.addressLine1,
					city: order.shippingAddress.address.city,
					country: order.shippingAddress.address.country,
					currency: Currency.Hnl,
					dateAndTime: order.createdAt,
					itemsTotal: order.invoice.itemsTotalPrice,
					orderItems: order.shipments[0].orderItems,
					orderTotal: order.invoice.totalPrice,
					orderid: order.id,
					province: order.shippingAddress.address.province,
					shippingName: `${order.shippingAddress.firstname} ${order.shippingAddress.lastname}`,
					shippingTotal: order.invoice.shippingTotalPrice,
					zipcode: order.shippingAddress.address.zipcode,
					addressLine2: order.shippingAddress.address.addressLine2 || undefined,
				});
				session.endSession();
				return { order, cart };
			} catch (error) {
				console.error("placeOrder error", error); //si ocurre un error probablemente falló alguna validación al crear la orden. No debería de pasar nunca
				await processAuthorizationReversal({
					authorizationId: authorizationResponse.id,
					reason: "Error al guardar orden en BDD",
					totalAmount: authorizationResponse.totalAmount,
					userId: user.id,
				});
				return await abortSessionAndReturnErrorMsg(
					getMessage(MESSAGES[locale].somethingWentWrong),
					session
				);
			}
		}
		if (
			!cart.cartItems ||
			cart.cartItems.length <= 0 ||
			!cartFullTranslations?.cartItems ||
			cartFullTranslations.cartItems.length <= 0
		)
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale]["placeOrder.cartEmpty"]),
				session
			);
		try {
			await Promise.all(
				cart.cartItems.map((cartItem) => {
					return (Product as Model<ProductDocument>).findByIdAndUpdate(
						cartItem.product?.id,
						{ $inc: { quantity: Math.abs(cartItem.quantity) * -1 } },
						{ session, new: true }
					);
				})
			);
		} catch (error) {
			console.error("placeOrder error", error); //si ocurre un error lo mas probable es que tratamos de asignar una cantidad negativa al campo "quantity" de algún producto. Lo cual quiere decir que no hay suficiente en el inventario
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale].somethingWentWrong),
				session
			);
		}
		const authorizationResponse = await processAuthorization({
			paymentInstrumentId: user.paymentInstrument,
			userId: user.id,
			fingerprintSessionId,
			ipAddress,
			email: user.email,
			items: cart.cartItems
				.filter((cartItem) => !!cartItem.product)
				.map((cartItem) => {
					const product = cartItem.product as IProduct;
					return {
						productCode: getCybersourceProductCode(product.type),
						productName: product.listing.longTitle,
						productSku: product.id,
						quantity: cartItem.quantity,
						unitPrice: `${cartItem.unitPriceWithShipping}`,
					};
				}),
		}); //Hacer autorización del pedido aqui con los datos de cart.cartItems, paymentMethod y shippingAddress
		if (!authorizationResponse)
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale]["placeOrder.processAuthorizationError"]),
				session
			);
		if (authorizationResponse.error) {
			await processAuthorizationReversal({
				authorizationId: authorizationResponse.id,
				reason: "Error de autorización",
				totalAmount: authorizationResponse.totalAmount,
				userId: user.id,
			});
			return await abortSessionAndReturnErrorMsg(
				getAuthorizationErrorMsg(authorizationResponse.error, locale),
				session
			);
		}
		const orderDoc = new (Order as Model<OrderDocument>)({
			_id: orderid,
			user: user.id,
			paymentMethod: {
				name: PaymentMethod.PaymentCard,
				card: {
					type: CardType.Credit,
					snippet: paymentInstrument.paymentCard?.snippet,
					brand: paymentInstrument.paymentCard.brand,
				},
			},
			shippingAddress,
			shipments: [
				{
					_id: authorizationResponse.id,
					orderItems: cart.cartItems
						.filter((cartItem) => !!cartItem.product)
						.map((cartItem) => {
							if (!cartItem.product) return undefined;
							const title = cartFullTranslations.cartItems.find(
								(cartItemFullTranslations) =>
									cartItemFullTranslations.id === cartItem.id
							)?.product?.listing.longTitle;
							return {
								product: cartItem.product.id,
								title: title || cartItem.product.listing.longTitle,
								applyDiscount: cartItem.product.applyDiscount,
								freeShipping: cartItem.product.freeShipping,
								pricing: cartItem.product.pricing,
								condition: cartItem.product.condition,
								imageUrl: cartItem.product.images?.[0]?.url,
								imagePlaceholder: cartItem.product.images?.[0]?.placeholder,
								slug: cartItem.product.slug,
								status: OrderItemStatus.Normal,
								invoice: {
									shippingTotalPrice: cartItem.shippingTotalPrice,
									totalQuantity: cartItem.totalQuantity,
									itemsTotalPrice: cartItem.itemsTotalPrice,
								},
							};
						}),
					status: ShipmentStatus.Pending,
				},
			],
			invoice: {
				shippingTotalPrice: cart.shippingTotalPrice,
				totalQuantity: cart.totalQuantity,
				itemsTotalPrice: cart.itemsTotalPrice,
			},
		});
		try {
			cart.cartItems = [];
			const [newOrderDoc] = await Promise.all([
				orderDoc.save({ session }),
				cart.save({ session }),
			]);
			await session.commitTransaction();
			const order = newOrderDoc.toJSON({ virtuals: true });
			await sendOrderInvoiceEmail({
				locale,
				recipient: user.email,
				addressLine1: order.shippingAddress.address.addressLine1,
				city: order.shippingAddress.address.city,
				country: order.shippingAddress.address.country,
				currency: Currency.Hnl,
				dateAndTime: order.createdAt,
				itemsTotal: order.invoice.itemsTotalPrice,
				orderItems: order.shipments[0].orderItems,
				orderTotal: order.invoice.totalPrice,
				orderid: order.id,
				province: order.shippingAddress.address.province,
				shippingName: `${order.shippingAddress.firstname} ${order.shippingAddress.lastname}`,
				shippingTotal: order.invoice.shippingTotalPrice,
				zipcode: order.shippingAddress.address.zipcode,
				addressLine2: order.shippingAddress.address.addressLine2 || undefined,
			});
			session.endSession();
			return { order, cart };
		} catch (error) {
			console.error("placeOrder error", error); //si ocurre un error probablemente falló alguna validación al crear la orden. No debería de pasar nunca
			await processAuthorizationReversal({
				authorizationId: authorizationResponse.id,
				reason: "Error al guardar orden en BDD",
				totalAmount: authorizationResponse.totalAmount,
				userId: user.id,
			});
			return await abortSessionAndReturnErrorMsg(
				getMessage(MESSAGES[locale].somethingWentWrong),
				session
			);
		}
	},
};
export default Mutation;
