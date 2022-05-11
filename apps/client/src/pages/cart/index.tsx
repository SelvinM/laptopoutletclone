import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/300.css";
import "@fontsource/rubik/400-italic.css";
import {
	useGetCartQuery,
	useRemoveInstaCheckoutMutation,
} from "../../libs/graphql/operations/cart.graphql";
import { useMeQuery } from "../../libs/graphql/operations/user.graphql";
import { GetStaticProps, NextPage } from "next";
import Head from "../../components/common/Head";
import React, { useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import CartSummary from "../../components/cart/CartSummary";
import CartItems from "../../components/cart/CartItems";
import StoreLayout from "../../components/layouts/StoreLayout";
import { dbConnect } from "@laptopoutlet-packages/utils";
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
import { useRouter } from "next/router";

interface Props {}

const Cart: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { data, loading: loadingCart } = useGetCartQuery({
		variables: { locale: currentLocale },
	});
	const { data: dataMe, loading: loadingMe } = useMeQuery();
	const [removeInstaCheckout, { loading: loadingRemoveInstaCheckout }] =
		useRemoveInstaCheckoutMutation();
	useEffect(() => {
		if (data?.getCart?.instaCheckout)
			removeInstaCheckout({ variables: { locale: currentLocale } });
	}, [data?.getCart?.instaCheckout]);
	const loading = loadingCart || loadingMe || loadingRemoveInstaCheckout;
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.cart" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div className="mt-8 mb-16 grid grid-cols-1 lg:grid-cols-11 xl:grid-cols-3 gap-8 xl:gap-16">
					<div className=" lg:col-span-7 xl:col-span-2">
						<CartItems
							data={data}
							loading={loading}
							dataMe={dataMe}
							title={<FormattedMessage id="cart.itemsInCart" />}
						/>
					</div>
					<div className="lg:col-span-4 xl:col-span-1 flex flex-col items-center">
						<div className="lg:sticky lg:top-24 w-full">
							<CartSummary
								itemsTotalPrice={data?.getCart?.itemsTotalPrice}
								totalPrice={data?.getCart?.totalPrice}
								shippingTotalPrice={data?.getCart?.shippingTotalPrice}
								totalQuantity={data?.getCart?.totalQuantity}
								showCheckoutLink={
									data?.getCart?.cartItems && data.getCart.cartItems.length >= 1
								}
								hideActionButton={
									loading || (data?.getCart?.totalQuantity || 0) <= 0
								}
							/>
						</div>
					</div>
				</div>
			</>
		</StoreLayout>
	);
};

export default Cart;

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
