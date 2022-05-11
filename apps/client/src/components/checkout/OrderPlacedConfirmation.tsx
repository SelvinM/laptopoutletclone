import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { BiCheckCircle, BiLoaderAlt, BiRightArrowAlt } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import { useGetOrderQuery } from "../../libs/graphql/operations/order.graphql";
import getCurrentLocale from "../../utils/getCurrentLocale";
import Card from "../common/Card";

interface Props {
	orderid: string;
}

const OrderPlacedConfirmation = ({ orderid }: Props) => {
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { data, loading } = useGetOrderQuery({
		variables: { id: orderid, locale: currentLocale },
	});

	return (
		<Card
			title={
				<div className="flex items-center text-sm md:text-base">
					<div className="w-10">
						<BiCheckCircle className="text-2xl text-green-600 mr-3" />{" "}
					</div>
					<FormattedMessage id="orderPlaced.title" />
				</div>
			}
		>
			<div className="p-4 sm:p-8 ">
				<div className="min-h-72">
					<h2 className="sm:text-lg">
						<FormattedMessage id="orderPlaced.confirmationEmail" />
					</h2>
					<span className="title text-sm mt-4 uppercase">
						<FormattedMessage id="orders.number" values={{ orderid }} />
					</span>
					<div className="dark:border-gray-600 border p-4 sm:p-8 mt-4">
						{loading || !data || !data.getOrder ? (
							<div className=" flex h-full items-center justify-center">
								<BiLoaderAlt className="dark:text-gray-400 text-4xl animate-spin text-primary-500" />
							</div>
						) : (
							<>
								<div className="space-y-4 divide-y dark:divide-gray-600">
									{data.getOrder.shipments.map((shipment) => (
										<div key={shipment.id}>
											<h3 className="text-sm sm:text-base font-medium">
												{data.getOrder?.shipments &&
												data.getOrder.shipments.length > 1 ? (
													<FormattedMessage
														id="orders.packageNumber"
														values={{ shipmentid: shipment.id }}
													/>
												) : (
													<FormattedMessage id="orderPlaced.packageInfo" />
												)}
											</h3>
											{/* <div className="text-xs text-gray-500 sm:text-sm">
												<span className="font-medium">
													<FormattedMessage id="orders.deliveryDate" />:
												</span>
												<span className="ml-1">14 de Mayo, 2021</span>
											</div> */}
											<ul className="space-y-2 mt-2 text-sm divide-y dark:divide-gray-600 divide-dashed">
												{shipment.orderItems.map((orderItem) => (
													<li
														className="flex items-center py-4 space-x-4"
														key={orderItem.id}
													>
														<BiRightArrowAlt className="text-xl inline" />
														<div className="w-11/12">
															<span className="truncate-3-lines overflow-hidden">
																{orderItem.title}
															</span>
															<div className="text-xs sm:text-sm mt-1">
																<span className="font-medium">
																	<FormattedMessage id="orders.quantity" />:
																</span>
																<span className="ml-1">
																	{orderItem.invoice.totalQuantity}
																</span>
															</div>
														</div>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</div>
				<div className="mt-8 text-center md:text-right">
					<Link href="/orders/[orderid]" as={`/orders/${orderid}`}>
						<a className="btn btn-primary px-4 py-2">
							<FormattedMessage id="orderPlaced.reviewOrEdit" />
						</a>
					</Link>
				</div>
			</div>
		</Card>
	);
};

export default OrderPlacedConfirmation;
