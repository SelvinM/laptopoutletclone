import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import StoreLayout from "../../../components/layouts/StoreLayout";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "../../../components/common/Head";
import React, { useContext } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { CurrencyContext } from "../../../contexts/CurrencyContextProvider";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { creditCardType } from "card-validator";
import {
	dbConnect,
	getDateFormatter,
	getParamAsString,
	getPriceFormatter,
} from "@laptopoutlet-packages/utils";
import { initializeApollo, addApolloState } from "../../../libs/apollo/apollo";
import {
	CategoriesQuery,
	CategoriesQueryVariables,
	CategoriesDocument,
} from "../../../libs/graphql/operations/category.graphql";
import {
	GetConfigQuery,
	GetConfigQueryVariables,
	GetConfigDocument,
} from "../../../libs/graphql/operations/config.graphql";
import BreadCrumbs from "../../../components/common/BreadCrumbs";
import { Crumb } from "../../../types";
import Card from "../../../components/common/Card";
import OrderSummary from "../../../components/order-details/OrderSummary";
import OrderShippingAddress from "../../../components/order-details/OrderShippingAddress";
import CardBrandIcon from "../../../components/payments/CardBrandIcon";
import { PaymentMethod, ShipmentStatus } from "@laptopoutlet-packages/types";
import { BiRightArrowAlt } from "react-icons/bi";
import OrderDetailsPackageItem from "../../../components/order-details/OrderDetailsPackageItem";
import Alert from "../../../components/common/Alert";
import OrderDetailsPackageItemSkeleton from "../../../components/skeletons/OrderDetailsPackageItemSkeleton";
import Skeleton from "../../../components/skeletons/Skeleton";
import { useMeQuery } from "../../../libs/graphql/operations/user.graphql";
import Link from "next/link";
import MessageWithLink from "../../../components/common/MessageWithAction";
import goToSignIn from "../../../utils/goToSignIn";
import { useGetOrderQuery } from "../../../libs/graphql/operations/order.graphql";

interface Props {}

const OrderDetails: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	const crumbs: Crumb[] = [
		{ href: "/orders", name: formatMessage({ id: "orders.title" }) },
		{
			href: "/orders/[orderid]/details",
			name: formatMessage({ id: "order.details" }),
		},
	];
	const { data: dataMe, loading: loadingMe } = useMeQuery();
	const { locale } = useRouter();
	const { currency } = useContext(CurrencyContext);
	const currentLocale = getCurrentLocale(locale);
	const router = useRouter();
	const orderid = getParamAsString(router.query.orderid);
	const priceFormatter = getPriceFormatter(currentLocale, currency);
	const dateFormatter = getDateFormatter({ locale: currentLocale });
	const { data, loading: loadingOrder } = useGetOrderQuery({
		variables: { id: orderid || "", locale: currentLocale },
	});
	const loading = loadingOrder || loadingMe || !orderid;
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.orders.details" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div className="mt-8 mb-16 px-4">
					<div className="mb-8">
						<BreadCrumbs crumbs={crumbs} />
					</div>
					<h1 className="mb-4 font-medium tracking-wide text-2xl">
						<FormattedMessage id="order.details" />
					</h1>
					{loading ? (
						<div className="flex space-y-4 xs:space-y-0 flex-col xs:flex-row xs:justify-between xs:items-end mb-2">
							<div className="flex flex-col lg:flex-row lg:space-x-8">
								<div className="h-5 w-52 mb-1 lg:mb-0">
									<Skeleton />
								</div>
								<div className="w-52 h-5">
									<Skeleton />
								</div>
							</div>
							<div className="self-end sm:self-auto">
								<div className="h-9 w-28">
									<Skeleton />
								</div>
							</div>
						</div>
					) : (
						!!data?.getOrder && (
							<div className="flex space-y-4 xs:space-y-0 flex-col xs:flex-row xs:justify-between xs:items-end mb-2">
								<div className="flex flex-col lg:flex-row text-xs xs:text-sm lg:space-x-8">
									<div>
										<FormattedMessage
											id="order.details.number"
											values={{ orderid: data.getOrder.id }}
										/>
									</div>
									<div>
										<FormattedMessage
											id="order.details.date"
											values={{
												date: dateFormatter.format(data.getOrder.createdAt),
											}}
										/>
									</div>
								</div>
								<div className="self-end sm:self-auto">
									<Link
										href="/orders/[orderid]/invoice"
										as={`/orders/${orderid}/invoice`}
									>
										<a className="btn btn-default text-xs py-2 sm:text-sm px-2 sm:px-4">
											<FormattedMessage id="order.details.inovice" />
										</a>
									</Link>
								</div>
							</div>
						)
					)}
					<div className="grid grid-cols-1 lg:grid-cols-11 xl:grid-cols-3 gap-8 xl:gap-16">
						<div className="lg:col-span-7 xl:col-span-2">
							{loading ? (
								<Card title={<FormattedMessage id="order.details.shipment" />}>
									<OrderDetailsPackageItemSkeleton />
								</Card>
							) : !dataMe?.me ? (
								<Card title={<FormattedMessage id="items" />}>
									<MessageWithLink
										action={() => goToSignIn()}
										message={<FormattedMessage id="order.details.signIn" />}
										buttonLabel={<FormattedMessage id="signIn" />}
									/>
								</Card>
							) : !!!data?.getOrder ? (
								<Alert
									type="error"
									message={<FormattedMessage id="order.details.badUrl" />}
								/>
							) : (
								<Card
									title={
										data?.getOrder.shipments.length > 1 ? (
											<FormattedMessage
												id="order.details.shipments"
												values={{ number: data.getOrder.shipments.length }}
											/>
										) : (
											<FormattedMessage id="order.details.shipment" />
										)
									}
								>
									<div className="divide-y dark:divide-gray-600">
										{!!data?.getOrder &&
											data.getOrder.shipments.map((shipment) => (
												<div key={shipment.id}>
													<div className="p-4 sm:px-8 sm:py-6 dark:border-gray-600 border-b items-center grid gap-4 grid-cols-4">
														<div className="col-span-full sm:col-span-3 flex items-center space-x-4">
															<span className="font-medium text-sm sm:text-base">
																{data.getOrder &&
																data.getOrder.shipments.length > 1 ? (
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
													<div className="divide-y divide-dashed dark:divide-gray-600">
														{shipment.orderItems.map((item) => (
															<div
																key={item.product}
																className="p-4 sm:px-8 sm:py-6"
															>
																<OrderDetailsPackageItem
																	id={item.id}
																	title={item.title}
																	freeShipping={item.freeShipping}
																	price={
																		item.applyDiscount
																			? item.pricing.discountPrice
																			: item.pricing.price
																	}
																	itemsTotalPrice={item.invoice.itemsTotalPrice}
																	shipping={item.pricing.shipping}
																	imageUrl={item.imageUrl}
																	condition={item.condition}
																	shippingTotalPrice={
																		item.invoice.shippingTotalPrice
																	}
																	returned={item.invoice.returned}
																	total={item.invoice.totalPrice}
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
							)}
						</div>
						<div className="lg:col-span-4 xl:col-span-1">
							<div className="lg:flex lg:flex-col-reverse lg:justify-end lg:space-y-reverse space-y-4">
								{!!data?.getOrder && !loading && (
									<div className="space-y-4 md:grid md:space-y-0 md:grid-cols-2  md:space-x-4 lg:grid-cols-1 lg:space-x-0 lg:space-y-4">
										<Card
											title={
												<FormattedMessage id="order.details.shippingAddress" />
											}
										>
											<OrderShippingAddress
												addressLine1={
													data.getOrder.shippingAddress.address.addressLine1
												}
												addressLine2={
													data.getOrder.shippingAddress.address.addressLine2
												}
												firstname={data.getOrder.shippingAddress.firstname}
												lastname={data.getOrder.shippingAddress.lastname}
												country={data.getOrder.shippingAddress.address.country}
												zipcode={data.getOrder.shippingAddress.address.zipcode}
												province={
													data.getOrder.shippingAddress.address.province
												}
												city={data.getOrder.shippingAddress.address.city}
												currentLocale={currentLocale}
											/>
										</Card>
										<Card
											title={
												<FormattedMessage id="order.details.paymentMethod" />
											}
										>
											<div className="p-4 sm:px-8 md:py-10 lg:py-6 text-sm">
												{data.getOrder.paymentMethod.name ===
													PaymentMethod.PaymentCard && (
													<>
														<div className="flex items-center  space-x-2">
															<CardBrandIcon
																cardBrand={
																	data.getOrder.paymentMethod.card?.brand
																}
															/>
															<span className="font-medium">
																{data.getOrder.paymentMethod.card &&
																	creditCardType.getTypeInfo(
																		data.getOrder.paymentMethod.card?.brand
																	).niceType}
															</span>
														</div>
														<div>
															<FormattedMessage
																id="order.details.paymentMethod.paymentCard"
																values={{
																	snippet:
																		data.getOrder.paymentMethod.card?.snippet,
																}}
															/>
														</div>
													</>
												)}
											</div>
										</Card>
									</div>
								)}
								<Card title={<FormattedMessage id="orderSummary" />}>
									<div className="p-4 sm:p-8">
										<OrderSummary
											loading={loading}
											totalQuantity={data?.getOrder?.invoice.totalQuantity || 0}
											itemsTotalPrice={priceFormatter.format(
												data?.getOrder?.invoice.itemsTotalPrice || 0
											)}
											shippingTotalPrice={priceFormatter.format(
												data?.getOrder?.invoice.shippingTotalPrice || 0
											)}
											totalPrice={priceFormatter.format(
												data?.getOrder?.invoice.totalPrice || 0
											)}
											returned={
												data?.getOrder?.invoice.returned
													? priceFormatter.format(
															data.getOrder.invoice.returned || 0
													  )
													: undefined
											}
										/>
									</div>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</>
		</StoreLayout>
	);
};

export default OrderDetails;
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	await dbConnect();
	const currentLocale = getCurrentLocale(locale);
	const apolloClient = initializeApollo();
	await Promise.all([
		apolloClient.query<CategoriesQuery, CategoriesQueryVariables>({
			query: CategoriesDocument,
			variables: { locale: currentLocale },
		}),
		apolloClient.query<GetConfigQuery, GetConfigQueryVariables>({
			query: GetConfigDocument,
			variables: { locale: currentLocale },
		}),
	]);
	return addApolloState(apolloClient, { props: {}, revalidate: 60 * 60 });
};

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: true,
	};
};
