import { ProductCondition } from "@laptopoutlet-packages/types";
import {
	useModifyCartItemMutation,
	useModifyInstaCheckoutMutation,
} from "../../libs/graphql/operations/cart.graphql";
import Link from "next/link";
import React, { useContext, useState, useEffect } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import { MessageContext } from "../../contexts/MessageContextProvider";
import { getPriceFormatter } from "@laptopoutlet-packages/utils";
import CartQuantityListBox from "./CartQuantityListbox";
import ItemSummary from "../products/ItemSummary";
import Modal from "../common/Modal";
import Image from "next/image";
import SoldOutImageBadge from "../products/SoldOutImageBadge";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import YesNoButtons from "../common/YesNoButtons";
import { getRgbDataUrl } from "../../utils/getRgbDataUrl";
import { RGB_PLACEHOLDER } from "../../constants";
interface Props {
	productid: string;
	slug: string;
	title: string;
	maxQuantity: number;
	quantity: number;
	price: number;
	shipping: number | null;
	freeShipping: boolean;
	condition: ProductCondition;
	discountPrice: number;
	applyDiscount: boolean;
	list: boolean;
	imageUrl?: string;
	imagePlaceholder?: string | null;
	isInstaCheckout?: boolean;
}

const CartItem = ({
	productid,
	applyDiscount,
	slug,
	isInstaCheckout,
	discountPrice,
	imageUrl,
	list,
	condition,
	freeShipping,
	maxQuantity,
	price,
	quantity,
	title,
	shipping,
	imagePlaceholder,
}: Props) => {
	const { formatMessage } = useIntl();
	const { currency: ctxCurrency } = useContext(CurrencyContext);
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const [modifyCartProduct, { data, loading: loadingCart, error }] =
		useModifyCartItemMutation();
	const [
		modifyInstaCheckout,
		{
			data: dataInstaCheckout,
			loading: loadingInstaCheckout,
			error: errorInstaCheckout,
		},
	] = useModifyInstaCheckoutMutation();
	const [removeModalVisible, setRemoveModalVisible] = useState(false);
	const showRemoveModal = () => {
		setRemoveModalVisible(true);
	};
	const { setMessage, setMessageType, setMessageVisible } =
		useContext(MessageContext);
	useEffect(() => {
		if (data?.modifyCartItem.__typename === "GeneralError") {
			setMessage(data.modifyCartItem.message);
			setMessageType("error");
			setMessageVisible(true);
		}
		if (data?.modifyCartItem.__typename === "ProductNotAvailableError") {
			setMessage(data.modifyCartItem.message);
			setMessageType("warning");
			setMessageVisible(true);
		}
		if (error) {
			setMessage(formatMessage({ id: "cart.modifyCartError" }));
			setMessageType("error");
			setMessageVisible(true);
		}
	}, [error, data?.modifyCartItem.__typename]);
	useEffect(() => {
		if (dataInstaCheckout?.modifyInstaCheckout.__typename === "GeneralError") {
			setMessage(dataInstaCheckout.modifyInstaCheckout.message);
			setMessageType("error");
			setMessageVisible(true);
		}
		if (
			dataInstaCheckout?.modifyInstaCheckout.__typename ===
			"ProductNotAvailableError"
		) {
			setMessage(dataInstaCheckout.modifyInstaCheckout.message);
			setMessageType("warning");
			setMessageVisible(true);
		}
		if (errorInstaCheckout) {
			setMessage(formatMessage({ id: "cart.modifyCartError" }));
			setMessageType("error");
			setMessageVisible(true);
		}
	}, [errorInstaCheckout, dataInstaCheckout?.modifyInstaCheckout.__typename]);
	const priceFormatter = getPriceFormatter(currentLocale, ctxCurrency);
	const priceParts = priceFormatter.formatToParts(
		applyDiscount && discountPrice
			? discountPrice * quantity
			: (price || 0) * quantity
	);
	const formattedShipping = priceFormatter.format((shipping || 0) * quantity);
	const formattedPrice = priceFormatter.format((price || 0) * quantity);
	const optionsAmount = maxQuantity > 50 ? 50 : maxQuantity;

	const onQuantityChange = (value: number) => {
		if (!productid || typeof value !== "number") return;
		if (value === 0) {
			showRemoveModal();
			return;
		}
		if (isInstaCheckout) {
			modifyInstaCheckout({
				variables: {
					productid,
					quantity: value,
					locale: currentLocale,
				},
			});
			return;
		}
		modifyCartProduct({
			variables: {
				productid: productid,
				quantity: value,
				locale: currentLocale,
			},
		});
	};
	const handleDelete = async () => {
		if (!productid) return;
		await modifyCartProduct({
			variables: { productid, quantity: 0, locale: currentLocale },
		});
		setRemoveModalVisible(false);
	};
	const closeModal = () => {
		setRemoveModalVisible(false);
	};
	const unavailable = maxQuantity === 0 || !list;
	const loading = loadingInstaCheckout || loadingCart;
	return (
		<>
			<Modal
				title={
					<h3 className="text-lg sm:text-xl title">
						<FormattedMessage id="cart.removeConfirmation.message" />
					</h3>
				}
				isOpen={removeModalVisible}
				onClose={closeModal}
				closeDisabled={loading}
			>
				<>
					<div className="sm:my-4">
						<ItemSummary
							title={title}
							imageUrl={imageUrl}
							slug={slug}
							condition={condition}
						/>
					</div>
					<YesNoButtons
						noAction={closeModal}
						loading={loading}
						yesAction={handleDelete}
					/>
				</>
			</Modal>
			<div className="mb-4 sm:hidden">
				<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
					<a className="truncate-3-lines overflow-hidden text-xs link">
						{title}
					</a>
				</Link>
			</div>
			<div className="flex">
				<div className="relative">
					<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
						<a>
							<div className="w-28 xs:w-40 h-28 xs:h-40 ">
								<Image
									src={
										imageUrl
											? process.env.NEXT_PUBLIC_BUCKET_URL + imageUrl
											: "/static/missing-image.png"
									}
									className="product-image"
									width={200}
									height={200}
									placeholder="blur"
									blurDataURL={
										imagePlaceholder || getRgbDataUrl(RGB_PLACEHOLDER)
									}
									objectFit="contain"
									alt={title}
								/>
							</div>
						</a>
					</Link>
					{unavailable && <SoldOutImageBadge size="lg" descriptionSize="xs" />}
				</div>
				<div className="pl-4 sm:order-2 w-full">
					<div className="mb-2 hidden sm:block ">
						<p
							className={`truncate-2-lines overflow-hidden text-base ${
								unavailable ? "text-gray-400" : ""
							}`}
						>
							{title}
						</p>
					</div>
					<div
						className={`text-2xs xs:text-xs mb-2 leading-snug ${
							unavailable ? "text-gray-400" : ""
						}`}
					>
						<span className="font-medium sm:text-sm">
							<FormattedMessage id="condition" />:
						</span>
						<span className="ml-1 sm:text-sm">
							<FormattedMessage id={`condition.${condition}`} />
						</span>
					</div>
					{!unavailable && (quantity || 0) > maxQuantity && (
						<span className="text-red-600 dark:text-red-500  text-xs">
							<FormattedMessage id="cart.invalidQuantity" />
						</span>
					)}
					{!unavailable && (
						<div className="sm:flex sm:flex-wrap sm:justify-between">
							<div>
								{applyDiscount && discountPrice && (
									<span className="text-gray-700 dark:text-gray-400 font-light line-through text-xs sm:text-sm ">
										{formattedPrice}
									</span>
								)}
								<div className="flex items-start">
									{
										<div className="flex items-center font-medium">
											{priceParts.map(({ type, value }, index) => (
												<span
													className={
														type === "currency"
															? "text-2xs sm:text-xs"
															: "font-medium sm:text-lg"
													}
													key={index}
												>
													{value}
												</span>
											))}
										</div>
									}
								</div>
								<div className="text-2xs xs:text-xs">
									{!freeShipping ? (
										<FormattedMessage
											id="shippingLabel"
											values={{ shipping: formattedShipping }}
										/>
									) : (
										<FormattedMessage id="freeShipping" />
									)}
								</div>
							</div>
							<div className="flex items-center sm:block sm:self-end text-right mt-2 sm:mt-0">
								<CartQuantityListBox
									allowRemove={!isInstaCheckout}
									optionsAmount={optionsAmount}
									value={quantity}
									onChange={onQuantityChange as any}
									loading={!removeModalVisible && loading}
								/>
								{!isInstaCheckout && (
									<div className="hidden xs:block ml-3 sm:ml-0">
										<button
											className=" btn link text-xs sm:mt-2"
											onClick={showRemoveModal}
										>
											<FormattedMessage id="remove" />
										</button>
									</div>
								)}
							</div>
						</div>
					)}
					{unavailable && (
						<>
							<span className="text-xs leading-none block sm:text-sm text-red-600 italic">
								<FormattedMessage id="soldOut.message" />
							</span>
							<div className="text-right">
								<button
									className={`btn text-sm sm:text-base ${
										loading ? "text-gray-400" : "link"
									} mt-2`}
									onClick={handleDelete}
								>
									{loading && <BiLoaderAlt className="animate-spin mr-1" />}{" "}
									<FormattedMessage id="remove" />
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default CartItem;
