import {
	OrderItemStatus,
	ProductCondition,
	ShipmentStatus,
} from "@laptopoutlet-packages/types";
import Link from "next/link";
import React, { useContext } from "react";
import Image from "next/image";
import { FormattedMessage } from "react-intl";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import { useRouter } from "next/router";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { getPriceFormatter } from "@laptopoutlet-packages/utils";
import { getRgbDataUrl } from "../../utils/getRgbDataUrl";
import { RGB_PLACEHOLDER } from "../../constants";

interface Props {
	id: string;
	title: string;
	itemsTotalPrice: number;
	price: number;
	returned?: number | null;
	shipping: number;
	freeShipping: boolean;
	shippingTotalPrice: number;
	quantity: number;
	total: number;
	imageUrl?: string | null;
	imagePlaceholder?: string | null;
	condition: ProductCondition;
	status: OrderItemStatus;
	shipmentStatus: ShipmentStatus;
	slug: string;
}

const OrderDetailsPackageItem = ({
	itemsTotalPrice,
	// id,
	price,
	returned,
	freeShipping,
	shipping,
	shippingTotalPrice,
	condition,
	quantity,
	total,
	// shipmentStatus,
	title,
	imageUrl,
	imagePlaceholder,
	slug,
	status,
}: Props) => {
	const { currency: ctxCurrency } = useContext(CurrencyContext);
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const priceFormatter = getPriceFormatter(currentLocale, ctxCurrency);
	// const totalPriceParts = priceFormatter.formatToParts(total);
	const actionsAvailable = true;
	return (
		<div
			className={`grid gap-4 ${
				actionsAvailable ? "sm:grid-cols-4" : "sm:grid-cols-3"
			}`}
		>
			<div className="sm:hidden col-span-full">
				<p className="truncate-3-lines overflow-hidden text-sm xs:text-base">
					{title}
				</p>
			</div>
			<div className="flex space-x-4 sm:space-x-8 col-span-full md:col-span-3">
				<div className="w-5/12 sm:w-32 sm:h-32">
					<Image
						src={
							imageUrl
								? process.env.NEXT_PUBLIC_BUCKET_URL + imageUrl
								: "/static/missing-image.png"
						}
						className="product-image dark:hover:opacity-70"
						width={160}
						objectFit="contain"
						height={160}
						placeholder="blur"
						blurDataURL={imagePlaceholder || getRgbDataUrl(RGB_PLACEHOLDER)}
						alt={title}
					/>
				</div>
				<div className="w-7/12 sm:flex-auto">
					{status !== OrderItemStatus.Normal && (
						<div className="inline-block mb-2 text-xs sm:text-sm rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-800">
							<FormattedMessage id={`order.item.status.${status}`} />
						</div>
					)}
					<div className="hidden sm:block">
						<p className=" truncate-3-lines overflow-hidden text-sm md:text-base mb-2">
							{title}
						</p>
					</div>
					<div className="space-y-2 sm:space-y-3">
						<div className="text-sm">
							<span className="font-medium">
								<FormattedMessage id="condition" />:
							</span>
							<span className="ml-1 ">
								<FormattedMessage id={`condition.${condition}`} />
							</span>
						</div>
						<div className="text-2xs xs:text-xs space-y-1">
							<div>
								<span className="text-gray-700 dark:text-gray-400">
									<FormattedMessage id="order.details.price" />:
								</span>
								<span className="ml-1 text-black dark:text-gray-300">
									{priceFormatter.format(price)}
								</span>
							</div>
							<div>
								<span className="text-gray-700 dark:text-gray-400">
									<FormattedMessage id="order.details.shipping" />:
								</span>
								<span className="ml-1 text-black dark:text-gray-300">
									{freeShipping ? (
										<FormattedMessage id="freeShipping" />
									) : (
										priceFormatter.format(shipping)
									)}
								</span>
							</div>
							<div>
								<span className="text-gray-700 dark:text-gray-400">
									<FormattedMessage id="orders.quantity" />:
								</span>
								<span className="ml-1 text-black dark:text-gray-300">
									{quantity}
								</span>
							</div>
							<div>
								<span className="text-gray-700 dark:text-gray-400">
									<FormattedMessage id="order.details.itemsTotalPrice" />:
								</span>
								<span className="ml-1 text-black dark:text-gray-300">
									{priceFormatter.format(itemsTotalPrice)}
								</span>
							</div>
							{returned && (
								<div>
									<span className="text-gray-700 dark:text-gray-400">
										<FormattedMessage id="order.details.returned" />:
									</span>
									<span className="ml-1 text-green-600 dark:text-green-300">
										{priceFormatter.format(returned)}
									</span>
								</div>
							)}
							<div>
								<span className="text-gray-700 dark:text-gray-400">
									<FormattedMessage id="order.details.shippingTotalPrice" />:
								</span>
								<span className="ml-1 text-black dark:text-gray-300">
									{priceFormatter.format(shippingTotalPrice)}
								</span>
							</div>
							<div>
								<span className="text-gray-700 dark:text-gray-400">
									<FormattedMessage id="order.details.total" />:
								</span>
								<span className="ml-1 text-black dark:text-gray-300">
									{priceFormatter.format(total)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			{actionsAvailable && (
				<div className="space-y-2 text-sm sm:flex sm:flex-row-reverse sm:items-end sm:space-y-0 sm:space-x-2 sm:space-x-reverse  sm:col-span-full space-x-reverse md:block md:space-x-0 md:space-y-2 md:col-span-1">
					<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
						<a className="btn btn-default w-full sm:w-auto md:w-full px-4 py-2  ">
							<FormattedMessage id="orders.viewItem" />
						</a>
					</Link>
					{/* {shipmentStatus === ShipmentStatus.Pending &&
						status === OrderItemStatus.Normal && (
							<Link
								href="/orders/[orderid]/invoice"
								as={`/orders/${id}/invoice`}
							>
								<a className="btn btn-default w-full sm:w-auto md:w-full px-3 py-2  ">
									<FormattedMessage id="orders.cancel" />
								</a>
							</Link>
						)}
					{shipmentStatus === ShipmentStatus.Shipped &&
						(status === OrderItemStatus.Normal ||
							status === OrderItemStatus.PartialReturn) && (
							<>
								<Link
									href="/orders/[orderid]/invoice"
									as={`/orders/${id}/invoice`}
								>
									<a className="btn btn-default w-full px-4 py-2  ">
										<FormattedMessage id="orders.return" />
									</a>
								</Link>
							</>
						)} */}
				</div>
			)}
		</div>
	);
};

export default OrderDetailsPackageItem;
