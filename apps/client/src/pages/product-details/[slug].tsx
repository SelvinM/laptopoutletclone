import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/300.css";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "../../components/common/Head";
import { useRouter } from "next/router";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import BreadCrumbs from "../../components/common/BreadCrumbs";
import StoreLayout from "../../components/layouts/StoreLayout";
import ProductDetailsSection from "../../components/product-details/ProductDetailsSection";
import ProductImages from "../../components/product-details/ProductImages";
import SectionCard from "../../components/common/SectionCard";
import {
	getCategoryCrumbs,
	sortCategories,
} from "../../utils/categoryDataHelpers";
import ProductDetailsTable from "../../components/product-details/ProductDetailsTable";
import {
	GetProductDocument,
	GetProductQuery,
	GetProductQueryVariables,
	useGetProductQuery,
} from "../../libs/graphql/operations/product.graphql";
import {
	GetConfigDocument,
	GetConfigQuery,
	GetConfigQueryVariables,
} from "../../libs/graphql/operations/config.graphql";
import {
	CategoriesDocument,
	CategoriesQuery,
	CategoriesQueryVariables,
} from "../../libs/graphql/operations/category.graphql";
import { addApolloState, initializeApollo } from "../../libs/apollo/apollo";
import {
	ICategory,
	Product,
	ProductDocument,
} from "@laptopoutlet-packages/models";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { Model } from "mongoose";
import { dbConnect, getParamAsString } from "@laptopoutlet-packages/utils";
import Skeleton from "../../components/skeletons/Skeleton";
import ProductImagesSkeleton from "../../components/skeletons/ProductImagesSkeleton";
import ProductDetailsSectionSkeleton from "../../components/skeletons/ProductDetailsSectionSkeleton";
import Custom404 from "../404";
interface Props {}

const ProductDetails: NextPage<Props> = ({}) => {
	const router = useRouter();
	const slug = getParamAsString(router.query.slug) || "";
	const currentLocale = getCurrentLocale(router.locale);
	const { formatMessage } = useIntl();
	const { data, error, loading } = useGetProductQuery({
		variables: {
			slug,
			locale: currentLocale,
		},
		fetchPolicy: "cache-only",
	});
	error && console.error("getProductQuery error", error);
	data?.getProduct?.listing.description;
	const categories = sortCategories(
		data?.getProduct?.categories as ICategory[] | undefined
	);
	let crumbs = getCategoryCrumbs(categories);
	crumbs.push({ name: data?.getProduct?.listing.shortTitle });
	if (router.isFallback || loading) {
		return (
			<StoreLayout wide>
				<>
					<Head title={formatMessage({ id: "loading" })}>
						<meta name="robots" content="noindex, nofollow" />
					</Head>
					<div className="container">
						<div className="m-4">
							<div className="w-2/3 md:w-72 h-5">
								<Skeleton />
							</div>
						</div>
					</div>
					<div className=" mb-8 bg-white dark:bg-gray-900 rounded-md">
						<div className="container ">
							<div className="p-4">
								<div className="md:hidden col-span-12 mb-4">
									<div className="h-4 mb-1">
										<Skeleton />
									</div>
									<div className="h-4 mb-1">
										<Skeleton />
									</div>
									<div className="h-4 mb-1">
										<Skeleton />
									</div>
									<div className="h-4 w-4/5">
										<Skeleton />
									</div>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-12 sm:gap-8 md:gap-10 lg:gap-6">
									<div className="sm:col-span-6 lg:col-span-7 xl:col-span-6">
										<ProductImagesSkeleton />
									</div>
									<div className="sm:col-span-6 lg:col-span-5 xl:col-span-6">
										<ProductDetailsSectionSkeleton />
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			</StoreLayout>
		);
	}
	if (!data?.getProduct) return <Custom404 />;
	return (
		<StoreLayout wide>
			<>
				<Head
					title={
						data.getProduct
							? `${data.getProduct?.listing.longTitle} | ${process.env.NEXT_PUBLIC_APP_NAME}`
							: process.env.NEXT_PUBLIC_APP_NAME
					}
					canonical={
						data.getProduct.quantity > 0
							? `/product-details/${slug}`
							: undefined
					}
				>
					{data.getProduct.quantity > 0 ? (
						<meta
							name="description"
							content={
								data.getProduct.listing.description ||
								data.getProduct.listing.longTitle
							}
						/>
					) : (
						<meta name="robots" content="noindex, nofollow" />
					)}
				</Head>
				<div className="container">
					<div className="m-4">
						<BreadCrumbs crumbs={crumbs} />
					</div>
				</div>
				<div className=" mb-8 bg-white dark:bg-gray-900 rounded-md">
					<div className="container">
						<div className="p-4">
							<h1 className="md:hidden col-span-12 sm:text-lg mb-4">
								{data.getProduct.listing.longTitle}
							</h1>
							<div className="grid grid-cols-1 sm:grid-cols-12 sm:gap-8 md:gap-10 lg:gap-6">
								<div className="sm:col-span-6 lg:col-span-7 xl:col-span-6">
									<ProductImages productData={data} />
								</div>
								<div className="sm:col-span-6 lg:col-span-5 xl:col-span-6">
									<ProductDetailsSection
										categories={categories}
										productData={data}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="container">
					<div className="mb-8">
						<SectionCard
							title={
								<h2 className="title mx-4 sm:text-lg md:text-xl">
									<FormattedMessage id="description" />
								</h2>
							}
						>
							<div className="flex justify-center sm:block mt-4">
								<div className=" max-w-md sm:max-w-none">
									<p>{data.getProduct.listing.description}</p>
								</div>
							</div>
						</SectionCard>
					</div>
					<div className="mb-8">
						<SectionCard
							title={
								<h2 className="title mx-4 sm:text-lg md:text-xl">
									<FormattedMessage id="productDetails" />
								</h2>
							}
						>
							<div className="mt-8">
								<div className="mx-auto max-w-md sm:max-w-none">
									<ProductDetailsTable data={data} />
								</div>
							</div>
						</SectionCard>
					</div>
				</div>
			</>
		</StoreLayout>
	);
};

export default ProductDetails;

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
	const slug = getParamAsString(params?.slug);
	if (!slug) return { notFound: true };
	await dbConnect();
	const currentLocale = getCurrentLocale(locale);
	const apolloClient = initializeApollo();
	await Promise.all([
		apolloClient.query<GetProductQuery, GetProductQueryVariables>({
			query: GetProductDocument,
			variables: {
				slug,
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

export const getStaticPaths: GetStaticPaths = async () => {
	await dbConnect();
	const products: ProductDocument[] = await (
		Product as Model<ProductDocument>
	).find({ list: true });
	return {
		paths: products.map((product) => ({ params: { slug: product.slug } })),
		fallback: true,
	};
};
