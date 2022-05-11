import { Shipment } from "@laptopoutlet-packages/models";
import { ShipmentStatus } from "@laptopoutlet-packages/types";
import {
	getDateFormatter,
	getPriceFormatter,
} from "@laptopoutlet-packages/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { BiRightArrowAlt } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import getCurrentLocale from "../../utils/getCurrentLocale";
import Card from "../common/Card";
import OrdersListPackageItem from "./OrdersListPackageItem";

interface Props {
	id: string;
	shipments: Shipment[];
	createdAt: Date;
	total: number;
	sentTo: string;
}

const OrdersListItem = ({ id, total, createdAt, sentTo, shipments }: Props) => {
	const { currency } = useContext(CurrencyContext);
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const priceFormatter = getPriceFormatter(currentLocale, currency);
	const dateFormatter = getDateFormatter({
		locale: currentLocale,
		options: { month: "numeric" },
	});
	return (
		<Card
			title={
				<div className="font-normal normal-case text-xs sm:text-sm grid gap-4 grid-cols-4 grid-rows-4">
					<div className="flex flex-col justify-center col-start-1 col-end-5 sm:col-end-3 row-start-1 row-end-2 sm:row-end-3 lg:row-span-full lg:col-span-1">
						<span className="font-medium uppercase">
							<FormattedMessage id="orders.number" values={{ orderid: id }} />
						</span>
						<div>
							<FormattedMessage
								id="orders.date"
								values={{
									date: dateFormatter.format(createdAt),
								}}
							/>
						</div>
					</div>
					<div className="flex flex-col justify-center col-start-1 col-end-5 sm:col-end-3 row-start-2 row-end-3 sm:row-start-3 sm:row-end-5 lg:row-span-full lg:col-span-1">
						<span className="font-medium uppercase">
							<FormattedMessage id="orders.sentTo" />
						</span>
						<div className="truncate">{sentTo}</div>
					</div>
					<div className="flex flex-col justify-center col-span-full sm:col-span-1 row-start-3 row-end-4 sm:row-start-1 sm:row-end-5 ">
						<span className="font-medium uppercase">
							<FormattedMessage id="orders.total" />
						</span>
						<div>{priceFormatter.format(total)}</div>
					</div>
					<div className="row-start-4 row-end-5 sm:row-start-1 sm:row-end-5 col-span-full sm:col-span-1 sm:space-y-2 flex items-center sm:flex-col">
						<Link href="/orders/[orderid]" as={`/orders/${id}`}>
							<a className="btn btn-primary w-1/2 order-last sm:order-none sm:w-full px-4 py-2 ml-2 sm:ml-0">
								<FormattedMessage id="orders.viewDetails" />
							</a>
						</Link>
						<Link href="/orders/[orderid]/invoice" as={`/orders/${id}/invoice`}>
							<a className="btn btn-default w-1/2 sm:w-full px-4 py-2">
								<FormattedMessage id="orders.viewInvoice" />
							</a>
						</Link>
					</div>
				</div>
			}
		>
			<div className="divide-y dark:divide-gray-600">
				{shipments.map((shipment) => (
					<div className="px-4 sm:px-6" key={shipment.id}>
						<div className="py-4 sm:py-6 border-b  dark:border-gray-600 items-center grid gap-4 grid-cols-4">
							<div className="col-span-full sm:col-span-3 flex items-center space-x-4">
								<span className="font-medium text-sm sm:text-base">
									{shipments.length > 1 ? (
										<FormattedMessage
											id="orders.packageNumber"
											values={{ shipmentid: shipment.id }}
										/>
									) : (
										<FormattedMessage id="orders.package" />
									)}
								</span>
								<BiRightArrowAlt className="text-xl" />
								<div
									className={`ml-2 text-xs dark:text-gray-800 sm:text-sm rounded-md px-2 py-1 ${
										shipment.status === ShipmentStatus.Pending
											? "bg-blue-200 dark:bg-blue-300"
											: "bg-green-200 dark:bg-green-300"
									} `}
								>
									<FormattedMessage
										id={`order.shipment.status.${shipment.status}`}
									/>
								</div>
							</div>
						</div>

						<div className="divide-y dark:divide-gray-600 divide-dashed">
							{shipment.orderItems.map((item) => (
								<div key={item.product} className="py-4 sm:py-6">
									<OrdersListPackageItem
										id={item.id}
										title={item.title}
										imageUrl={item.imageUrl}
										imagePlaceholder={item.imagePlaceholder}
										condition={item.condition}
										total={item.invoice.itemsTotalPrice}
										quantity={item.invoice.totalQuantity}
										shipmentStatus={shipment.status}
										status={item.status}
										slug={item.slug}
									/>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</Card>
	);
};

export default OrdersListItem;
