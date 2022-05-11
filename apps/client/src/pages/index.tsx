import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/300.css";
import { GetStaticProps, NextPage } from "next";
import React from "react";
import StoreLayout from "../components/layouts/StoreLayout";
import HomeBanner from "../components/home/HomeBanner";
import Badges from "../components/home/Badges";
import CategoriesGrid from "../components/home/CategoriesGrid";
import ProductsGrid from "../components/home/ProductsGrid";
import { useIntl } from "react-intl";
import { dbConnect } from "@laptopoutlet-packages/utils";
import { addApolloState, initializeApollo } from "../libs/apollo/apollo";
import {
	GetConfigDocument,
	GetConfigQuery,
	GetConfigQueryVariables,
} from "../libs/graphql/operations/config.graphql";
import {
	CategoriesQuery,
	CategoriesQueryVariables,
	CategoriesDocument,
} from "../libs/graphql/operations/category.graphql";
import {
	GetProductsQuery,
	GetProductsQueryVariables,
	GetProductsDocument,
} from "../libs/graphql/operations/product.graphql";
import getCurrentLocale from "../utils/getCurrentLocale";
import Head from "../components/common/Head";
interface Props {}

const HOMEPAGE_CATEGORY_ID = "featured-products";

const Index: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.home" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
					canonical=""
				>
					<>
						<meta
							name="description"
							content={formatMessage(
								{ id: "description.home" },
								{ appname: process.env.NEXT_PUBLIC_APP_NAME }
							)}
						/>
						<meta
							name="google-site-verification"
							content="qcL0pdkoI5z5nvZ7FTjkiP35iR7TnB011ztvOmZvdzE"
						/>
					</>
				</Head>
				<div className="mt-8">
					<HomeBanner />
				</div>
				<div className="mt-8">
					<Badges />
				</div>
				<div className="mt-8">
					<CategoriesGrid />
				</div>
				<div className="mt-8 mb-16">
					<ProductsGrid categoryid={HOMEPAGE_CATEGORY_ID} />
				</div>
			</>
		</StoreLayout>
	);
};

export default Index;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	await dbConnect();
	const currentLocale = getCurrentLocale(locale);
	const apolloClient = initializeApollo();
	await Promise.all([
		apolloClient.query<GetProductsQuery, GetProductsQueryVariables>({
			query: GetProductsDocument,
			variables: {
				limit: 12,
				categories: [HOMEPAGE_CATEGORY_ID],
				getFacets: false,
				getTotal: false,
				locale: currentLocale,
			},
		}),
		apolloClient.query<CategoriesQuery, CategoriesQueryVariables>({
			query: CategoriesDocument,
			variables: { locale: currentLocale },
		}),
		apolloClient.query<GetConfigQuery, GetConfigQueryVariables>({
			query: GetConfigDocument,
			variables: { locale: currentLocale },
		}),
	]);

	return addApolloState(apolloClient, { props: {}, revalidate: 5 });
};
