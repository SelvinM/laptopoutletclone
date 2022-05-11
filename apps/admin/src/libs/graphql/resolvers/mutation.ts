import {
	createCookies,
	createTokens,
	expireCookies,
} from "../../../utils/auth";
import { argon2id, hash, verify } from "argon2";
import mongoose, { LeanDocument } from "mongoose";
import {
	Admin,
	Category,
	Product,
	ComputerProduct,
	Config,
	CategoryFullTranslationsDocument,
	ProductFullTranslationsDocument,
	ComputerProductFullTranslationsDocument,
	ConfigFullTranslationsDocument,
	Warehouse,
	Order,
	OrderFullTranslationsDocument,
	CancellationFullTranslationsDocument,
	Cancellation,
} from "@laptopoutlet-packages/models";
import { GraphQLContext } from "../../../types";
import { ApolloError } from "apollo-server-micro";
import { MutationResolvers } from "graphql-let/__generated__/__types__";
import {
	deleteCategoryImageFromBucket,
	deleteHomeBannerImageFromBucket,
	deleteProductImageFromBucket,
	uploadCategoryImage,
	uploadHomeBannerImage,
	uploadProductImages,
} from "apps/admin/src/utils/imageFunctions";
import { Model } from "mongoose";
import {
	processAuthorizationReversal,
	processCapture,
} from "apps/admin/src/utils/paymentFunctions";
import { Currency, Locale, ShipmentStatus } from "@laptopoutlet-packages/types";
import { sendShipmentConfirmationEmail } from "apps/admin/src/utils/sendgrid";
const Mutation: Required<MutationResolvers> = {
	createAdmin: async (_node, { input }) => {
		const exists = await Admin.exists({
			email: input.email,
		});
		if (exists) return { message: "Correo electrónico ya está en uso" };
		try {
			const hashedPass = await hash(input.password, { type: argon2id });
			const newAdmin = new Admin({ ...input, password: hashedPass });
			await newAdmin.save();
			return newAdmin.toJSON({ virtuals: true });
		} catch {
			return { message: "Ocurrió un error inesperado" };
		}
	},
	updateAdmin: async (_node, { input }) => {
		const exists = await Admin.exists({
			email: input.email,
			$nor: [{ _id: input.id }],
		});
		if (exists) return { message: "Correo electrónico ya está en uso" };
		const updatedAdmin = await Admin.findByIdAndUpdate(input.id, { ...input });
		if (!updatedAdmin)
			return {
				message: `No se encontro un administrador con la ID: ${input.id}`,
			};
		return updatedAdmin.toJSON({ virtuals: true });
	},
	deleteAdmin: async (_node, { id }) => {
		const admin = await Admin.findByIdAndDelete(id);
		if (admin) return true;
		return false;
	},
	loginAdmin: async (
		_node,
		{ input: { email, password } },
		{ res }: GraphQLContext
	) => {
		const admin = await Admin.findOne({ email });
		if (!admin) return { message: "Credenciales no coinciden" };
		try {
			const valid = await verify(admin.password, password, { type: argon2id });
			if (!valid)
				return {
					message: "Credenciales no coinciden",
				};
		} catch {
			return {
				message: "Credenciales no coinciden",
			};
		}
		const tokens = createTokens({
			id: admin.id,
			roles: admin.roles,
			tic: admin.tic,
		});
		const cookies = createCookies(tokens);
		res?.setHeader("Set-Cookie", cookies);
		return admin.toJSON({ virtuals: true });
	},
	logoutAdmin: async (_node, _args, { res }: GraphQLContext) => {
		const cookies = expireCookies();
		res?.setHeader("Set-Cookie", cookies);
		return true;
	},
	createCategory: async (
		_node,
		{ input: { name, parent, showInMenu, id, description, image } },
		{ user }: GraphQLContext
	) => {
		const exists = await (
			Category as Model<CategoryFullTranslationsDocument>
		).exists({
			_id: id,
		});
		if (exists) return { message: "Ya existe una categoría con esa id" };
		const imageUrl = await uploadCategoryImage({ id, upload: image });
		const category = new (Category as Model<CategoryFullTranslationsDocument>)({
			name,
			description,
			parent: parent || undefined,
			showInMenu,
			createdBy: user?.id,
			updatedBy: user?.id,
			imageUrl,
			_id: id,
		});
		if (parent) {
			const parentCategory = await (
				Category as Model<CategoryFullTranslationsDocument>
			).findByIdAndUpdate(
				parent,
				{
					hasChildren: true,
					updatedBy: user?.id,
				},
				{ new: true }
			);
			if (!parentCategory)
				return { message: "Esa categoría padre ya no existe" };
		}
		await category.save();
		return category.toJSON({ virtuals: true });
	},
	updateCategory: async (
		_node,
		{ input: { name, showInMenu, id, description } },
		{ user }: GraphQLContext
	) => {
		const category = await (
			Category as Model<CategoryFullTranslationsDocument>
		).findByIdAndUpdate(id, {
			name,
			description,
			showInMenu,
			updatedBy: user?.id,
		});
		if (!category) return { message: "La categoría no existe" };
		return category.toJSON({ virtuals: true });
	},
	updateCategoryImage: async (
		_node,
		{ input: { id, image } },
		{ user }: GraphQLContext
	) => {
		await deleteCategoryImageFromBucket(id);
		const imageUrl = await uploadCategoryImage({ id, upload: image });
		const category = await (
			Category as Model<CategoryFullTranslationsDocument>
		).findByIdAndUpdate(id, { imageUrl, updatedBy: user?.id }, { new: true });
		if (!category) return { message: "Error inesperado" };
		return category.toJSON({ virtuals: true });
	},
	deleteCategoryImage: async (_node, { id }, { user }: GraphQLContext) => {
		const category = await (
			Category as Model<CategoryFullTranslationsDocument>
		).findByIdAndUpdate(
			id,
			{ $unset: { imageUrl: "" }, updatedBy: user?.id },
			{ new: true }
		);
		await deleteCategoryImageFromBucket(id);
		if (!category) return { message: "Error inesperado" };
		return category.toJSON({ virtuals: true });
	},
	deleteCategory: async (_node, { id }, { user }: GraphQLContext) => {
		//validamos que no sea categoría opcional
		const isOptional = await (
			Category as Model<CategoryFullTranslationsDocument>
		).exists({
			_id: id,
			isOptional: true,
		});
		if (isOptional) return false;
		const category = await Category.findByIdAndDelete(id);
		if (!category) return false;
		//eliminamos la categoría de los productos que la contengan
		await Product.updateMany(
			{ categories: { $in: [category.id as any] } },
			{ $pullAll: { categories: [category.id as any] } }
		);
		//eliminamos el la relación de padre de las categorías hijas
		if (category.hasChildren)
			await Category.updateMany(
				{ parent: category.id as any },
				{ $unset: { parent: "" }, updatedBy: user?.id }
			);
		//si la categoria que eliminamos tiene padre revisamos si el padre todavía tiene hijos. Si ya no tiene, actualizamos el atributo hasChildren
		if (category.parent) {
			const parentHasChildren = await (
				Category as Model<CategoryFullTranslationsDocument>
			).exists({
				$and: [{ parent: category.parent }, { _id: category.parent }],
			});
			if (!parentHasChildren)
				await (
					Category as Model<CategoryFullTranslationsDocument>
				).findByIdAndUpdate(category.parent, {
					hasChildren: false,
				});
		}
		// borramos la imagen de la nube
		await deleteCategoryImageFromBucket(id);
		return true;
	},
	createUndefinedProduct: async (
		_node,
		{ input },
		{ user }: GraphQLContext
	) => {
		const undefinedProduct =
			new (Product as Model<ProductFullTranslationsDocument>)({
				...input,
				_id: input.id,
				images: undefined,
				createdBy: user?.id,
				updatedBy: user?.id,
			});
		const images = await uploadProductImages({
			id: undefinedProduct.id,
			images: input.images,
		});
		undefinedProduct.images = images;
		const undefinedProductSaved = await undefinedProduct.save();
		const populatedProduct = await undefinedProductSaved
			.populate("categories")
			.execPopulate();
		return populatedProduct.toJSON({
			virtuals: true,
		});
	},
	updateUndefinedProduct: async (
		_node,
		{ input },
		{ user }: GraphQLContext
	) => {
		const undefinedProduct = await (
			Product as Model<ProductFullTranslationsDocument>
		)
			.findByIdAndUpdate(
				input.id,
				{
					...input,
					categories: input.categories as any,
					updatedBy: user?.id,
				},
				{ new: true }
			)
			.populate("categories")
			.exec();
		return (
			undefinedProduct?.toJSON({
				virtuals: true,
			}) || null
		);
	},
	createComputerProduct: async (_node, { input }, { user }: GraphQLContext) => {
		const computerProduct =
			new (ComputerProduct as Model<ComputerProductFullTranslationsDocument>)({
				...input,
				_id: input.id,
				images: undefined,
				createdBy: user?.id,
				updatedBy: user?.id,
			});
		const images = await uploadProductImages({
			id: computerProduct.id,
			images: input.images,
		});
		computerProduct.images = images;
		const computerProductSaved = await computerProduct.save();
		const populatedProduct = await computerProductSaved
			.populate("categories")
			.execPopulate();
		return populatedProduct.toJSON({
			virtuals: true,
		});
	},
	updateComputerProduct: async (_node, { input }, { user }: GraphQLContext) => {
		try {
			const computerProduct = await (
				ComputerProduct as Model<ComputerProductFullTranslationsDocument>
			)
				.findByIdAndUpdate(input.id, {
					...input,
					categories: input.categories as any,
					updatedBy: user?.id,
				})
				.populate("categories")
				.exec();

			return (
				computerProduct?.toJSON({
					virtuals: true,
				}) || null
			);
		} catch (e) {
			console.log("error", e);
			return null;
		}
	},
	deleteProduct: async (_node, { id }) => {
		const imageDeleted = await deleteProductImageFromBucket(id);
		if (!imageDeleted) return false;
		const product = await Product.findByIdAndDelete(id);
		if (product) return true;
		return false;
	},
	addProductImages: async (
		_node,
		{ input: { id, images } },
		{ user }: GraphQLContext
	) => {
		const product = await (
			Product as Model<ProductFullTranslationsDocument>
		).findById(id);
		if (!product) throw new ApolloError("Producto no encontrado");
		const imageReferences = await uploadProductImages({
			id,
			images,
			startingIndex: product.images.length,
		});
		let updatedImages = product.images;
		imageReferences.forEach((newImage) => {
			if (
				!updatedImages.some(
					(oldImage: any) => oldImage.filename === newImage.filename
				)
			) {
				updatedImages.push(newImage);
			}
		});
		product.updatedBy = user?.id || "";
		const updatedProduct = await (await product.save())
			.populate("categories")
			.execPopulate();
		return updatedProduct?.toJSON({
			virtuals: true,
		});
	},

	deleteProductImage: async (
		_node,
		{ input: { id, filename } },
		{ user }: GraphQLContext
	) => {
		const imageDeleted = await deleteProductImageFromBucket(id, filename);
		if (!imageDeleted) return null;
		const product = await (Product as Model<ProductFullTranslationsDocument>)
			.findByIdAndUpdate(
				id,
				{ $pull: { images: { filename } }, updatedBy: user?.id },
				{ new: true }
			)
			.populate("categories")
			.exec();
		return product?.toJSON({ virtuals: true }) || null;
	},
	updateConfig: async (_node, { input }, { user }: GraphQLContext) => {
		let imageUrl: string | undefined = undefined;
		if (input.homeBanner.upload) {
			await deleteHomeBannerImageFromBucket();
			const imageObj = await uploadHomeBannerImage({
				upload: input.homeBanner.upload,
			});
			if (!imageObj) return { message: "Ocurrió un error al subir la imagen" };
			//actualizamos cambiando homeBanner.imageUrl
			const config = await (
				Config as Model<ConfigFullTranslationsDocument>
			).findOneAndUpdate(
				{},
				{
					homeBanner: {
						...input.homeBanner,
						imageUrl: imageObj?.imageUrl,
						imagePlaceholder: imageObj?.placeholder,
					},
					socialLinks: input.socialLinks,
					updatedBy: user?.id,
				},
				{ new: true }
			);
			if (!config) return { message: "Ocurrió un error inesperado" };
			return config.toJSON({ virtuals: true });
		}

		//actualizamos sin cambiar homeBanner.imageUrl
		const config = await (
			Config as Model<ConfigFullTranslationsDocument>
		).findOne();
		if (config) {
			config.homeBanner = {
				...input.homeBanner,
				imageUrl: config?.homeBanner.imageUrl,
				imagePlaceholder: config?.homeBanner.imagePlaceholder,
			};
			config.socialLinks = input.socialLinks;
			await config.save();
			return config.toJSON({ virtuals: true });
		}
		//si llegamos aqui es porque no existe ningun document en config todavia. Entonces lo creamos.
		const newConfig = new (Config as Model<ConfigFullTranslationsDocument>)({
			homeBanner: { ...input.homeBanner, imageUrl },
			socialLinks: input.socialLinks,
			updatedBy: user?.id,
		});
		await newConfig.save();
		return newConfig.toJSON({ virtuals: true });
	},
	createWarehouse: async (_node, { input }, { user }: GraphQLContext) => {
		const warehouse = new Warehouse({
			name: input.name,
			point: {
				type: "Point",
				coordinates: [input.longitude, input.latitude],
			},
			address: input.address,
			createdBy: user?.id,
			updatedBy: user?.id,
		});
		try {
			await warehouse.save();
			return warehouse.toJSON({ virtuals: true });
		} catch (error) {
			console.log("createWarehouse error", error);
			return { message: "Ocurrió un error inesperado" };
		}
	},
	updateWarehouse: async (_node, { input }, { user }: GraphQLContext) => {
		const warehouse = await Warehouse.findByIdAndUpdate(
			input.id,
			{
				name: input.name,
				point: {
					type: "Point",
					coordinates: [input.longitude, input.latitude],
				},
				address: input.address,
				updatedBy: user?.id,
			},
			{ new: true }
		);
		if (warehouse) return warehouse.toJSON({ virtuals: true });
		return { message: "Bodega no encontrada" };
	},
	deleteWarehouse: async (_node, { id }) => {
		const warehouse = await Warehouse.findByIdAndDelete(id);
		if (warehouse) return true;
		return false;
	},
	capturePayment: async (_node, { orderid, shipmentid }) => {
		const order = await (Order as Model<OrderFullTranslationsDocument>).findOne(
			{
				_id: orderid,
				["shipments._id"]: shipmentid,
				["shipments.status"]: ShipmentStatus.Pending,
			}
		);
		const shipment = order?.shipments.find(
			(shipment) => shipmentid === shipment.id
		);
		if (!shipment) return null;
		const session = await mongoose.startSession();
		session.startTransaction();
		const newOrder = await (Order as Model<OrderFullTranslationsDocument>)
			.findOneAndUpdate(
				{
					_id: orderid,
					"shipments._id": shipmentid,
				},
				{
					$set: {
						"shipments.$.status": ShipmentStatus.Shipped,
						"shipments.$.shippedAt": new Date(Date.now()),
					},
				},
				{ session, new: true }
			)
			.populate("user")
			.exec();
		if (!newOrder?.user) {
			await session.abortTransaction();
			session.endSession();
			return null;
		}
		const successful = await processCapture({
			authorizationId: shipmentid,
			totalAmount: `${newOrder.invoice.totalPrice.toFixed(2)}`,
		});
		if (successful) {
			await session.commitTransaction();
			session.endSession();
			await sendShipmentConfirmationEmail({
				locale: Locale.Es,
				recipient: newOrder.user.email,
				addressLine1: newOrder.shippingAddress.address.addressLine1,
				city: newOrder.shippingAddress.address.city,
				country: newOrder.shippingAddress.address.country,
				currency: Currency.Hnl,
				dateAndTime: newOrder.shipments[0].shippedAt || new Date(Date.now()),
				itemsTotal: newOrder.invoice.itemsTotalPrice,
				orderItems: newOrder.shipments[0].orderItems,
				orderTotal: newOrder.invoice.totalPrice,
				orderid: newOrder.id,
				packageid: newOrder.shipments[0].id,
				province: newOrder.shippingAddress.address.province,
				shippingName: `${newOrder.shippingAddress.firstname} ${newOrder.shippingAddress.lastname}`,
				shippingTotal: newOrder.invoice.shippingTotalPrice,
				zipcode: newOrder.shippingAddress.address.zipcode,
				addressLine2:
					newOrder.shippingAddress.address.addressLine2 || undefined,
			});
			return newOrder.toJSON({ virtuals: true });
		}
		await session.abortTransaction();
		session.endSession();
		return null;
	},
	reverseAuthorization: async (
		_node,
		{ input: { orderid, shipmentid, reason } },
		{ user }: GraphQLContext
	) => {
		const order = await (Order as Model<OrderFullTranslationsDocument>).findOne(
			{
				_id: orderid,
				["shipments._id"]: shipmentid,
				["shipments.status"]: ShipmentStatus.Pending,
			}
		);
		const shipment = order?.shipments.find(
			(shipment) => shipmentid === shipment.id
		);
		if (!shipment || !order)
			return { message: "El paquete no fue encontrado en la base de datos" };
		const session = await mongoose.startSession();
		session.startTransaction();
		const cancellation =
			new (Cancellation as Model<CancellationFullTranslationsDocument>)({
				order: order.id,
				shipmentid: shipment.id,
				user: order.user as any,
				orderItems: shipment.orderItems,
				cancelledBy: user?.id,
			});
		await cancellation.save({ session });
		const modifyProductQuantityPromises = shipment.orderItems.map((item) =>
			(Product as Model<ProductFullTranslationsDocument>).findByIdAndUpdate(
				item.product,
				{ $inc: { quantity: item.invoice.totalQuantity } },
				{ session, new: true }
			)
		); // funciones para incrementar la cantidad de los productos que estamos cancelando
		const products = await (
			await Promise.all(modifyProductQuantityPromises)
		).filter((product) => !!product?.id);
		if (products.length !== shipment.orderItems.length) {
			await session.abortTransaction();
			session.endSession();
			return {
				message: "Ocurrió un error al modificar la cantidad de los productos",
			};
		}
		let response: LeanDocument<OrderFullTranslationsDocument> | null = null;
		if (order.shipments.length > 1) {
			const newOrder = await (Order as Model<OrderFullTranslationsDocument>)
				.findOneAndUpdate(
					{
						_id: orderid,
						"shipments._id": shipmentid,
					},
					{ $pull: { shipments: [{ id: shipmentid }] } },
					{ session, new: true }
				)
				.populate("user")
				.exec();
			if (!newOrder) {
				await session.abortTransaction();
				session.endSession();
				return { message: "Ocurrió un error al modificar la orden" };
			}
			response = newOrder.toJSON({ virtuals: true });
		} else {
			const deleted = await Order.findByIdAndDelete(order.id, { session });
			if (!deleted) {
				await session.abortTransaction();
				session.endSession();
				return { message: "Ocurrió un error al eliminar la orden" };
			}
		}
		const cancelled = await processAuthorizationReversal({
			authorizationId: shipment.id,
			totalAmount: `${order?.invoice.totalPrice.toFixed(2)}`,
			reason: reason || "Cancelado por admin",
			userId: order.user as any,
		});
		if (!cancelled) {
			await session.abortTransaction();
			session.endSession();
			return {
				message: "Ocurrió un error al cancelar la autorización de cobro",
			};
		}
		await session.commitTransaction();
		session.endSession();
		return response;
	},
};
export default Mutation;
