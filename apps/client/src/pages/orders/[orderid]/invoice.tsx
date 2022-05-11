import { PaymentMethod } from "@laptopoutlet-packages/types";
import {
	getDateFormatter,
	getParamAsString,
	getPriceFormatter,
} from "@laptopoutlet-packages/utils";
import Alert from "../../../components/common/Alert";
import SimpleLayout from "../../../components/layouts/SimpleLayouts/SimpleLayout";
import MessageWithLink from "../../../components/common/MessageWithAction";
import { CurrencyContext } from "../../../contexts/CurrencyContextProvider";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import goToSignIn from "../../../utils/goToSignIn";
import { translateCountry } from "@laptopoutlet-packages/utils";
import { creditCardType } from "card-validator";
import { NextPage } from "next";
import Head from "../../../components/common/Head";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { BiCaretRight, BiLoaderAlt, BiPrinter } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGetOrderQuery } from "../../../libs/graphql/operations/order.graphql";
import { useMeQuery } from "../../../libs/graphql/operations/user.graphql";

interface Props {}

const Invoice: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	const { data: dataMe, loading: loadingMe } = useMeQuery();
	const { locale } = useRouter();
	const { currency } = useContext(CurrencyContext);
	const currentLocale = getCurrentLocale(locale);
	const router = useRouter();
	const orderid = getParamAsString(router.query.orderid) || "";
	const priceFormatter = getPriceFormatter(currentLocale, currency);
	const dateFormatter = getDateFormatter({ locale: currentLocale });
	const { data, loading: loadingOrder } = useGetOrderQuery({
		variables: { id: orderid, locale: currentLocale },
	});
	const loading = loadingOrder || loadingMe || !orderid;
	return (
		<SimpleLayout hideLegalLinksFromFooter>
			<>
				<Head
					title={formatMessage(
						{ id: "title.orders.invoice" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				{loading ? (
					<div className="h-96 justify-center flex items-center">
						<BiLoaderAlt className="dark:text-gray-400 text-5xl animate-spin text-primary-500" />
					</div>
				) : !dataMe?.me ? (
					<MessageWithLink
						action={() => goToSignIn()}
						message={<FormattedMessage id="order.details.signIn" />}
						buttonLabel={<FormattedMessage id="signIn" />}
					/>
				) : !data?.getOrder?.id ? (
					<div className="mt-8 max-w-3xl mx-auto">
						<Alert
							type="error"
							message={<FormattedMessage id="order.details.badUrl" />}
						/>
					</div>
				) : (
					<>
						<div className="px-4 xs:px-0 text-right mt-8 mb-4 max-w-4xl mx-auto">
							{window.print && (
								<button
									className="px-4 py-2 btn btn-default text-sm"
									onClick={() => {
										window.print();
									}}
								>
									<BiPrinter className="text-lg mr-2" />
									<span>
										<FormattedMessage id="order.invoice.print" />
									</span>
								</button>
							)}
						</div>
						<div className="mb-16 print:bg-white  print:m-0  print:fixed print:w-screen print:h-screen print:top-0 print:z-50 print:left-0 max-w-4xl mx-auto print:dark:text-gray-800">
							<div className="grid md:grid-cols-5 print:grid-cols-5 gap-8 shadow-lg print:shadow-none bg-white dark:bg-gray-900 py-16 md:py-24 px-4 sm:px-16 print:py-16 print:px-16">
								<div className="col-span-full">
									<h1 className="text-xl md:text-2xl  print:text-2xl tracking-wide title print:dark:text-gray-800">
										<FormattedMessage id="order.invoice" />
									</h1>
								</div>
								<div className="md:col-span-3 print:col-span-3">
									<ul className="space-y-2 text-sm">
										<li className="flex items-center">
											<BiCaretRight className="mr-2" />
											<span className="font-medium mr-2">
												<FormattedMessage id="order.invoice.buyer" />:
											</span>
											<span>{`${dataMe.me.name} ${dataMe.me.surname}`}</span>
										</li>
										<li className="flex items-center">
											<BiCaretRight className="mr-2" />
											<span className="font-medium mr-2">
												<FormattedMessage id="order.invoice.seller" />:
											</span>
											<span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
										</li>
										<li className="flex items-center">
											<BiCaretRight className="mr-2" />
											<span className="font-medium mr-2">
												<FormattedMessage id="order.invoice.orderNumber" />:
											</span>
											<span>{data.getOrder.id}</span>
										</li>
										<li className="flex items-center">
											<BiCaretRight className="mr-2" />
											<span className="font-medium mr-2">
												<FormattedMessage id="order.invoice.date" />:
											</span>
											<span>
												{dateFormatter.format(data.getOrder.createdAt)}
											</span>
										</li>
										<li className="flex items-center">
											<BiCaretRight className="mr-2" />
											<span className="font-medium mr-2">
												<FormattedMessage id="order.invoice.paymentMethod" />:
											</span>
											{data.getOrder.paymentMethod.name ===
												PaymentMethod.PaymentCard && (
												<>
													<span className="mr-1">
														{data.getOrder.paymentMethod.card &&
															creditCardType.getTypeInfo(
																data.getOrder.paymentMethod.card?.brand
															).niceType}
													</span>
													<div>
														(
														<FormattedMessage
															id="order.details.paymentMethod.paymentCard"
															values={{
																snippet:
																	data.getOrder.paymentMethod.card?.snippet,
															}}
														/>
														)
													</div>
												</>
											)}
										</li>
									</ul>
								</div>
								<div className="md:col-span-2 print:col-span-2">
									<h2 className="mb-2 title print:dark:text-gray-800">
										<FormattedMessage id="order.invoice.shippingAddress" />
									</h2>
									<div className="text-xs md:text-sm">
										<span className="block">{`${
											data.getOrder.shippingAddress.firstname
										} ${data.getOrder.shippingAddress.lastname || ""}`}</span>
										<p>{data.getOrder.shippingAddress.address.addressLine1}</p>
										<span className="block">
											{data.getOrder.shippingAddress.address.addressLine2}
										</span>
										<span className="block">{`${data.getOrder.shippingAddress.address.city}, ${data.getOrder.shippingAddress.address.province}, ${data.getOrder.shippingAddress.address.zipcode}`}</span>
										<span className="block">
											{translateCountry({
												code: data.getOrder.shippingAddress.address.country,
												locale: currentLocale,
											}) || data.getOrder.shippingAddress.address.country}
										</span>
									</div>
								</div>
								<div className="col-span-full">
									<table className="text-2xs sm:text-sm print:text-sm ">
										<thead className="border-b dark:border-gray-600">
											<tr>
												<th className="pr-2 py-2 title print:dark:text-gray-800">
													<FormattedMessage id="order.invoice.itemsBought.quantity" />
												</th>
												<th className="py-2 px-4 title print:dark:text-gray-800 text-left w-full">
													<FormattedMessage id="order.invoice.itemsBought.description" />
												</th>
												<th className="pl-2 py-2 title print:dark:text-gray-800 whitespace-nowrap">
													<FormattedMessage id="order.invoice.itemsBought.total" />
												</th>
											</tr>
										</thead>
										<tbody>
											{data.getOrder.shipments.map((shipment, index) =>
												shipment.orderItems.map((item) => (
													<tr
														key={`${index}-${item.id}`}
														className="border-b dark:border-gray-600"
													>
														<td className="pr-2 py-2 text-center">
															{item.invoice.totalQuantity}
														</td>
														<td className="py-2 px-4">
															<span className="leading-none sm:leading-normal block">
																{item.title}
															</span>
															<div className="flex items-center flex-wrap text-2xs">
																<span className="font-medium mr-1">
																	<FormattedMessage id="condition" />:
																</span>
																<div>
																	<FormattedMessage
																		id={`condition.${item.condition}`}
																	/>
																</div>
															</div>
														</td>
														<td className="pl-2 py-2 text-right">
															{priceFormatter.format(
																item.invoice.itemsTotalPrice
															)}
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
								<div className="col-span-full">
									<div className="grid grid-cols-2 gap-2 sm:text-sm text-xs print:text-sm">
										<span>
											<FormattedMessage
												id="orderSummary.items"
												values={{
													total: data.getOrder.invoice.totalQuantity,
												}}
											/>
										</span>
										<span className="text-right break-words">
											{priceFormatter.format(
												data.getOrder.invoice.itemsTotalPrice
											)}
										</span>
										<span>
											<FormattedMessage id="orderSummary.shipping" />
										</span>
										<span className="text-right break-words">
											{priceFormatter.format(
												data.getOrder.invoice.shippingTotalPrice
											)}
										</span>
										{data.getOrder.invoice.returned && (
											<>
												<span>
													<FormattedMessage id="orderSummary.returned" />
												</span>
												<span className="text-right break-words text-green-600 dark:text-green-300 print:dark:text-green-600">
													{priceFormatter.format(
														data.getOrder.invoice.returned
													)}
												</span>
											</>
										)}
										<div className="col-span-full pt-4 border-t dark:border-gray-600 flex justify-between items-center">
											<span className="title print:dark:text-gray-800">
												<FormattedMessage id="orderSummary.total" />
											</span>
											<span className="text-right break-words title print:dark:text-gray-800">
												{priceFormatter.format(
													data.getOrder.invoice.totalPrice
												)}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</>
		</SimpleLayout>
	);
};

export default Invoice;
