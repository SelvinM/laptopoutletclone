import Link from "next/link";
import React, { useState } from "react";
import { FormattedMessage, FormattedPlural } from "react-intl";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { calculatePercentage } from "../../utils/calculatePercentage";
import { useContext } from "react";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import { useRouter } from "next/router";
import Notification from "../common/Notification";
import CartNotificationContent from "./CartNotificationContent";
import { BiLoaderAlt } from "react-icons/bi";
import { NotificationType } from "../../types";
import goToSignIn from "../../utils/goToSignIn";
import {
	useAddCartItemMutation,
	GetCartQuery,
	GetCartDocument,
	useSetInstaCheckoutMutation,
} from "../../libs/graphql/operations/cart.graphql";
import { GetProductQuery } from "../../libs/graphql/operations/product.graphql";
import { useMeQuery } from "../../libs/graphql/operations/user.graphql";
import { MessageContext } from "../../contexts/MessageContextProvider";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { getPriceFormatter } from "@laptopoutlet-packages/utils";
import CartNotificationTitle from "./CartNotificationTitle";
import { ICategory } from "@laptopoutlet-packages/models";
interface Props {
	productData?: GetProductQuery;
	categories: ICategory[];
}

const ProductDetailsSection = ({ productData, categories }: Props) => {
	const router = useRouter();
	const { currency: ctxCurrency } = useContext(CurrencyContext);
	const currentLocale = getCurrentLocale(router.locale);
	const { setMessage, setMessageType, setMessageVisible } =
		useContext(MessageContext);
	const [showCartNotification, setShowCartNotification] = useState(false);
	const [notificationType, setNotificationType] =
		useState<NotificationType>("error");
	const [addToCartClicked, setAddToCartClicked] = useState(false);
	const [buyNowClicked, setBuyNowClicked] = useState(false);
	const [addCartItem, { data, loading: loadingIncCart }] =
		useAddCartItemMutation();
	const [setInstaCheckout, { loading: loadingSetInstaCheckout }] =
		useSetInstaCheckoutMutation();
	const { data: dataMe, loading: loadingMe } = useMeQuery();

	if (!productData?.getProduct) {
		return <></>;
	}
	const priceFormatter = getPriceFormatter(currentLocale, ctxCurrency);
	const priceParts = priceFormatter.formatToParts(
		productData.getProduct.applyDiscount
			? productData.getProduct.pricing.discountPrice
			: productData.getProduct.pricing.price
	);
	const formattedShipping = priceFormatter.format(
		productData.getProduct.pricing.shipping || 0
	);
	const formattedPrice = priceFormatter.format(
		productData.getProduct.pricing.price || 0
	);
	const discountAmmount = priceFormatter.format(
		productData.getProduct.pricing.price -
			(productData.getProduct.pricing.discountPrice || 0)
	);

	const addToCart = async () => {
		if (loadingMe) setAddToCartClicked(true);
		if (!productData?.getProduct?.id) return;
		if (!dataMe?.me && !loadingMe) {
			goToSignIn();
			return;
		}
		const { data } = await addCartItem({
			variables: {
				productid: productData.getProduct.id,
				locale: currentLocale,
			},
			update: (cache, { data }) => {
				if (data?.addCartItem.__typename !== "Cart") return;
				cache.writeQuery<GetCartQuery>({
					query: GetCartDocument,
					data: {
						__typename: "Query",
						getCart: {
							__typename: "Cart",
							id: data.addCartItem.id,
							cartItems: [...data.addCartItem.cartItems],
							instaCheckout: data.addCartItem.instaCheckout,
							itemsTotalPrice: data.addCartItem.itemsTotalPrice,
							totalPrice: data.addCartItem.totalPrice,
							shippingTotalPrice: data.addCartItem.shippingTotalPrice,
							totalQuantity: data.addCartItem.totalQuantity,
						},
					},
				});
			},
		});
		if (data?.addCartItem.__typename === "GeneralError") {
			setMessage(data.addCartItem.message);
			setMessageType("error");
			setMessageVisible(true);
		}
		if (data?.addCartItem.__typename === "ProductNotAvailableError") {
			setNotificationType("info");
			setShowCartNotification(true);
		}
		if (data?.addCartItem.__typename === "Cart") {
			setNotificationType("default");
			setShowCartNotification(true);
		}
	};
	const checkoutItem = async () => {
		if (!productData?.getProduct?.id) return;
		if (loadingMe) setBuyNowClicked(true);
		if (!dataMe?.me && !loadingMe) {
			goToSignIn();
			return;
		}
		const { data } = await setInstaCheckout({
			variables: {
				productid: productData.getProduct.id,
				locale: currentLocale,
			},
		});
		if (data?.setInstaCheckout.__typename === "GeneralError") {
			setMessage(data.setInstaCheckout.message);
			setMessageType("error");
			setMessageVisible(true);
		}
		if (data?.setInstaCheckout.__typename === "ProductNotAvailableError") {
			setMessage(data.setInstaCheckout.message);
			setMessageType("info");
			setMessageVisible(true);
		}
		if (data?.setInstaCheckout.__typename === "Cart") router.push("/checkout");
	};

	return (
		<div className="flex flex-col justify-between sm:h-78 md:h-auto lg:min-h-98 xl:min-h-112">
			{!loadingIncCart && (
				<Notification
					visible={showCartNotification && !loadingIncCart}
					type={notificationType}
					closeAction={() => setShowCartNotification(false)}
					title={<CartNotificationTitle cartData={data} />}
				>
					{data?.addCartItem.__typename === "Cart" ? (
						<CartNotificationContent productData={productData} />
					) : undefined}
				</Notification>
			)}
			<div>
				<Link
					href={{
						pathname: "/products/[categoryid]",
						query: {
							brand: productData.getProduct.manufacturer?.brand || "undefined",
						},
					}}
					as={`/products/all?brand=${
						productData.getProduct.manufacturer?.brand || "undefined"
					}`}
				>
					<button className="btn btn-primary h-5 px-1 text-xs md:mb-2 xl:mb-4">
						{productData.getProduct.manufacturer?.brand || (
							<FormattedMessage id="brand.generic" />
						)}
					</button>
				</Link>
				<h1 className="hidden md:block md:text-base lg:text-xl xl:text-2xl">
					{productData.getProduct.listing.longTitle}
				</h1>
			</div>
			<div className="mt-4 md:mt-6 lg:mt-10">
				<div>
					<span className="font-medium">
						<FormattedMessage id="condition" />:
					</span>
					<span className="ml-2">
						<FormattedMessage
							id={`condition.${productData.getProduct.condition}`}
						/>
					</span>
				</div>

				{categories.length > 0 && (
					<div className=" xl:mt-1 flex flex-wrap">
						<span className="font-medium mr-1 mt-1 sm:mr-2">
							<FormattedPlural
								one={<FormattedMessage id="category" />}
								value={categories.length}
								other={<FormattedMessage id="categories" />}
							/>
							:
						</span>
						{categories.map((category, index) => (
							<div key={index} className="mr-1 mt-1 sm:mr-2">
								<Link
									href="/products/[categoryid]"
									as={`/products/${category.id}`}
									key={index}
								>
									<a className="dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-600 px-2 py-1 border  bg-gray-50 hover:bg-gray-100 transition duration-200 whitespace-nowrap rounded-md text-2xs lg:text-xs xl:text-sm">
										{category.name}
									</a>
								</Link>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="mt-10 md:mt-6 lg:mt-10 text-sm lg:text-sm xl:text-base">
				<div className=" flex flex-wrap items-center">
					{productData.getProduct.applyDiscount && (
						<div className="w-full mb-1 xl:mb-2 text-sm">
							<span className="text-secondary-500 dark:text-secondary-200 ">
								<FormattedMessage
									id="saleTag.complete"
									values={{
										pct: calculatePercentage(
											productData.getProduct.pricing.price,
											productData.getProduct?.pricing.discountPrice
										),
										ammount: discountAmmount,
									}}
								/>
							</span>
						</div>
					)}
					<div className="flex items-center font-medium">
						{priceParts.map(({ type, value }, index) => (
							<span
								className={type === "currency" ? "text-base" : "text-2xl"}
								key={index}
							>
								{value}
							</span>
						))}
					</div>
					{productData.getProduct?.applyDiscount && (
						<span className="text-gray-700 line-through dark:text-gray-500 text-sm lg:text-base xl:text-lg font-light ml-3 ">
							{formattedPrice}
						</span>
					)}
					<div className="text-sm mt-1 w-full">
						{!productData.getProduct?.freeShipping ? (
							<FormattedMessage
								id="shippingLabel"
								values={{ shipping: formattedShipping }}
							/>
						) : (
							<FormattedMessage id="freeShipping" />
						)}
					</div>
				</div>
			</div>

			<div className="w-full grid-cols-1 grid lg:grid-cols-2 gap-2  xl:gap-10 mt-8 lg:mt-10 ">
				<button
					disabled={
						loadingIncCart ||
						(loadingMe && addToCartClicked) ||
						productData.getProduct.quantity <= 0
					}
					className={`${
						loadingIncCart ||
						(loadingMe && addToCartClicked) ||
						productData.getProduct.quantity <= 0
							? "btn-primary-disabled"
							: "btn-primary"
					} btn w-full px-6 py-3 sm:px-4 sm:py-2 xl:px-6 xl:py-3`}
					onClick={addToCart}
				>
					{(loadingIncCart || (loadingMe && addToCartClicked)) && (
						<BiLoaderAlt className="absolute animate-spin text-2xl" />
					)}
					<AiOutlineShoppingCart
						className={
							loadingIncCart || (loadingMe && addToCartClicked)
								? "invisible"
								: "text-2xl sm:text-xl xl:text-2xl"
						}
					/>
					<span
						className={
							loadingIncCart || (loadingMe && addToCartClicked)
								? "invisible"
								: "ml-2 flex-auto text-center"
						}
					>
						<FormattedMessage id="addToCart" />
					</span>
				</button>
				<button
					disabled={
						loadingSetInstaCheckout ||
						(loadingMe && buyNowClicked) ||
						productData.getProduct.quantity <= 0
					}
					onClick={checkoutItem}
					className={`${
						loadingSetInstaCheckout ||
						(loadingMe && buyNowClicked) ||
						productData.getProduct.quantity <= 0
							? "btn-tertiary-disabled"
							: "btn-tertiary"
					} btn w-full px-6 py-3 sm:px-4 sm:py-2 xl:px-6 xl:py-3 relative`}
				>
					{(loadingSetInstaCheckout || (loadingMe && buyNowClicked)) && (
						<BiLoaderAlt className="absolute animate-spin text-2xl" />
					)}
					<span
						className={
							loadingSetInstaCheckout || (loadingMe && buyNowClicked)
								? "invisible"
								: ""
						}
					>
						<FormattedMessage id="buyItNow" />
					</span>
				</button>
			</div>
		</div>
	);
};

export default ProductDetailsSection;
