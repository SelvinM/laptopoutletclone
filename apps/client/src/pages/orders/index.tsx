import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import { GetStaticProps, NextPage } from "next";
import React from "react";
import StoreLayout from "../../components/layouts/StoreLayout";
import Head from "../../components/common/Head";
import { FormattedMessage, useIntl } from "react-intl";
import OrderStatusDropdown from "../../components/orders/ShipmentStatusDropdown";
import OrdersListItem from "../../components/orders/OrdersListItem";
import Pagination from "../../components/products/Pagination";
import goToSignIn from "../../utils/goToSignIn";
import {
	dbConnect,
	getParamAsString,
	isShipmentStatus,
} from "@laptopoutlet-packages/utils";
import { initializeApollo, addApolloState } from "../../libs/apollo/apollo";
import {
	CategoriesQuery,
	CategoriesQueryVariables,
	CategoriesDocument,
} from "../../libs/graphql/operations/category.graphql";
import {
	GetConfigQuery,
	GetConfigQueryVariables,
	GetConfigDocument,
} from "../../libs/graphql/operations/config.graphql";
import getCurrentLocale from "../../utils/getCurrentLocale";
import BreadCrumbs from "../../components/common/BreadCrumbs";
import { Crumb } from "../../types";
import OrderListItemSkeleton from "../../components/skeletons/OrderListItemSkeleton";
import MessageWithLink from "../../components/common/MessageWithAction";
import { useRouter } from "next/router";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { getSkip } from "../../utils/getSkip";
import { useMeQuery } from "../../libs/graphql/operations/user.graphql";
import { useGetOrdersQuery } from "../../libs/graphql/operations/order.graphql";

interface Props {}

const Orders: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	const { data: dataMe, loading: loadingMe } = useMeQuery();
	const crumbs: Crumb[] = [
		{ href: "/orders", name: formatMessage({ id: "orders.title" }) },
	];
	const router = useRouter();
	const status = getParamAsString(router.query.status);
	const statusValue = isShipmentStatus(status) ? status : "all";
	const currentLocale = getCurrentLocale(router.locale);
	const { data, loading: loadingOrders } = useGetOrdersQuery({
		variables: {
			locale: currentLocale,
			options: {
				limit: DEFAULT_PAGE_SIZE,
				skip: getSkip(router.query.page),
				shipmentStatus: statusValue === "all" ? undefined : statusValue,
			},
		},
	});
	const loading = loadingMe || loadingOrders;
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.orders" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div className="mt-8 mb-16 max-w-5xl mx-auto px-4">
					<div className="mb-8">
						<BreadCrumbs crumbs={crumbs} />
					</div>
					<div className="mb-4 mt-8 flex flex-wrap justify-end items-center sm:justify-between">
						<h1 className="w-full sm:w-auto capitalize mb-4 sm:mb-0 font-medium tracking-wide text-2xl">
							<FormattedMessage id="orders.title" />
						</h1>
						<OrderStatusDropdown />
					</div>
					{loading ? (
						<OrderListItemSkeleton />
					) : !dataMe?.me ? (
						<div className="bg-white dark:bg-gray-900 xs:border dark:border-gray-600">
							<MessageWithLink
								message={<FormattedMessage id="orders.signIn" />}
								buttonLabel={<FormattedMessage id="signIn" />}
								action={() => goToSignIn()}
							/>
						</div>
					) : data?.getOrders && data.getOrders.orders.length === 0 ? (
						<div className="bg-white dark:bg-gray-900 xs:border dark:border-gray-600">
							<MessageWithLink
								message={
									statusValue === "all" ? (
										<FormattedMessage id="orders.emptyMessage" />
									) : (
										<FormattedMessage id="orders.emptyMessage.filters" />
									)
								}
								buttonLabel={<FormattedMessage id="continueShopping" />}
								link={{ href: "/" }}
							/>
						</div>
					) : (
						<div className="space-y-8">
							{data?.getOrders &&
								data.getOrders.orders.map(
									(order) =>
										order && (
											<OrdersListItem
												id={order.id}
												key={order.id}
												shipments={order.shipments}
												createdAt={order.createdAt}
												total={order.invoice.totalPrice}
												sentTo={`${order.shippingAddress.firstname} ${order.shippingAddress.lastname}`}
											/>
										)
								)}
						</div>
					)}
					<Pagination
						pageSize={DEFAULT_PAGE_SIZE}
						total={data?.getOrders?.total}
						paginatedObjects={formatMessage({ id: "orders" })}
					/>
				</div>
			</>
		</StoreLayout>
	);
};

export default Orders;

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
