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
	total: number;
	quantity: number;
	imageUrl?: string | null;
	imagePlaceholder?: string | null;
	condition: ProductCondition;
	status: OrderItemStatus;
	shipmentStatus: ShipmentStatus;
	slug: string;
}

const OrdersListPackageItem = ({
	total,
	// id,
	condition,
	quantity,
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
	const priceParts = priceFormatter.formatToParts(total);
	const actionsAvailable = true;
	return (
		<div
			className={`grid gap-4 ${
				actionsAvailable ? "sm:grid-cols-4" : "sm:grid-cols-3"
			}`}
		>
			<div className="sm:hidden col-span-full">
				<p className="truncate-3-lines overflow-hidden text-sm xs:text-base dark:text-gray-200">
					{title}
				</p>
			</div>
			<div className="flex space-x-4 sm:space-x-8 col-span-full md:col-span-3">
				<div className="w-5/12 sm:w-52 sm:h-52">
					<Image
						src={
							imageUrl
								? process.env.NEXT_PUBLIC_BUCKET_URL + imageUrl
								: "/static/missing-image.png"
						}
						className="product-image transition-none dark:hover:opacity-70"
						width={210}
						placeholder="blur"
						blurDataURL={imagePlaceholder || getRgbDataUrl(RGB_PLACEHOLDER)}
						objectFit="contain"
						height={210}
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
						<p className=" truncate-2-lines overflow-hidden text-xs sm:text-sm md:text-base mb-2">
							{title}
						</p>
					</div>
					<div className="space-y-2 sm:space-y-3">
						<div className="text-2xs xs:text-xs">
							<div className="mb-1">
								<span className="font-medium sm:text-sm ">
									<FormattedMessage id="condition" />:
								</span>
								<span className="ml-1 sm:text-sm">
									<FormattedMessage id={`condition.${condition}`} />
								</span>
							</div>
							<div>
								<span className="font-medium sm:text-sm">
									<FormattedMessage id="orders.quantity" />:
								</span>
								<span className="ml-1 sm:text-sm">{quantity}</span>
							</div>
						</div>
						<div>
							<div className="text-sm hidden sm:block">
								<span className="text-gray-600 dark:text-gray-400">
									<FormattedMessage id="order.details.itemsTotalPrice" />
								</span>
							</div>
							<div className="flex items-center font-medium">
								{priceParts.map(({ type, value }, index) => (
									<span
										className={
											type === "currency" ? "text-xs sm:text-sm " : "sm:text-xl"
										}
										key={index}
									>
										{value}
									</span>
								))}
							</div>
						</div>
						<div className="mt-2 md:hidden ">
							<Link
								href="/product-details/[slug]"
								as={`/product-details/${slug}`}
							>
								<a className="btn btn-default w-full text-xs sm:w-auto sm:px-2 py-2  ">
									<FormattedMessage id="orders.viewItem" />
								</a>
							</Link>
						</div>
					</div>
				</div>
			</div>
			<div
				className={`hidden md:block ${
					actionsAvailable ? "block" : "hidden"
				} space-y-2 text-sm`}
			>
				<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
					<a className="btn btn-default w-full px-4 py-2  ">
						<FormattedMessage id="orders.viewItem" />
					</a>
				</Link>
				{/* {shipmentStatus === ShipmentStatus.Pending &&
					status === OrderItemStatus.Normal && (
						<Link href="/orders/[orderid]/invoice" as={`/orders/${id}/invoice`}>
							<a className="btn btn-default w-full px-3 py-2  ">
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
		</div>
	);
};

export default OrdersListPackageItem;
