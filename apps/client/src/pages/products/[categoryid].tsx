import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/300.css";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import React from "react";
import StoreLayout from "../../components/layouts/StoreLayout";
import Head from "../../components/common/Head";
import { ProductCondition } from "@laptopoutlet-packages/types";
import {
	isProductCondition,
	getParamAsString,
	getParamAsArray,
} from "@laptopoutlet-packages/utils";
import BreadCrumbs from "../../components/common/BreadCrumbs";
import {
	getCategoryAncestry,
	getCategoryCrumbs,
} from "../../utils/categoryDataHelpers";
import { FormattedMessage, FormattedPlural, useIntl } from "react-intl";
import { useRouter } from "next/router";
import ProductFilters from "../../components/products/ProductFilters";
import FilterTags from "../../components/products/FilterTags";
import SortByDropdown from "../../components/products/SortByDropdown";
import FiltersDrawer from "../../components/products/FiltersDrawer";
import { ProductFacet } from "../../types";
import ProductListItem from "../../components/products/ProductListItem";
import Pagination from "../../components/products/Pagination";
import ProductListItemSkeleton from "../../components/skeletons/ProductListItemSkeleton";
import {
	CategoriesDocument,
	CategoriesQuery,
	CategoriesQueryVariables,
	useCategoriesQuery,
} from "../../libs/graphql/operations/category.graphql";
import {
	GetProductsDocument,
	GetProductsQuery,
	GetProductsQueryVariables,
	useGetProductsQuery,
} from "../../libs/graphql/operations/product.graphql";
import { CategoryDocument, ICategory } from "@laptopoutlet-packages/models";
import { addApolloState, initializeApollo } from "../../libs/apollo/apollo";
import {
	GetConfigQuery,
	GetConfigQueryVariables,
	GetConfigDocument,
} from "../../libs/graphql/operations/config.graphql";
import { Category } from "@laptopoutlet-packages/models";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { Model } from "mongoose";
import { dbConnect } from "@laptopoutlet-packages/utils";
import {
	isArrayFilterType,
	isProductSort,
	isBooleanFilterType,
	isPriceRangeFilterType,
} from "../../utils/enumValidations";
import { getSkip } from "../../utils/getSkip";
import Skeleton from "../../components/skeletons/Skeleton";
import { DEFAULT_PAGE_SIZE } from "../../constants";

interface Props {}
const validateConditionsArray = (conditions?: string[]) => {
	if (!conditions) return;
	let productConditionArray: ProductCondition[] = [];
	for (let i = 0; i < conditions.length; i++) {
		const condition = conditions[i];
		if (isProductCondition(condition)) productConditionArray.push(condition);
	}
	return productConditionArray;
};
const Products: NextPage<Props> = ({}) => {
	const router = useRouter();
	const currentLocale = getCurrentLocale(router.locale);
	const { data: categoryData } = useCategoriesQuery({
		variables: { locale: currentLocale },
	});
	const categoryid = getParamAsString(router.query.categoryid);
	const sort = getParamAsString(router.query.sort);
	const variables: GetProductsQueryVariables = {
		getFacets: true,
		getTotal: true,
		limit: DEFAULT_PAGE_SIZE,
		skip: getSkip(router.query.page),
		categories: categoryid && categoryid !== "all" ? [categoryid] : undefined,
		brand: getParamAsArray(router.query.brand),
		applyDiscount:
			getParamAsString(router.query.applyDiscount) === "true" || undefined,
		freeShipping:
			getParamAsString(router.query.freeShipping) === "true" || undefined,
		condition: validateConditionsArray(getParamAsArray(router.query.condition)),
		sort: isProductSort(sort) ? sort : undefined,
		search: getParamAsString(router.query.search),
		screenSize: getParamAsArray(router.query.screenSize),
		graphicsProcessor: getParamAsArray(router.query.graphicsProcessor),
		hdd: getParamAsArray(router.query.hdd),
		processor: getParamAsArray(router.query.processor),
		ram: getParamAsArray(router.query.ram),
		ssd: getParamAsArray(router.query.ssd),
		minPrice: Number(getParamAsString(router.query.minPrice)) || undefined,
		maxPrice: Number(getParamAsString(router.query.maxPrice)) || undefined,
		locale: currentLocale,
	};
	const { formatMessage } = useIntl();
	const { data, loading, error } = useGetProductsQuery({
		variables,
	});
	error && console.error("getProducts error", error);
	const categoryAncestry = getCategoryAncestry({
		categories: categoryData?.categories as ICategory[] | undefined,
		id: getParamAsString(router.query.categoryid),
		allProductsDescription: formatMessage({ id: "allDescription" }),
		allProductsTitle: formatMessage({ id: "allProducts" }),
	});
	const crumbs = getCategoryCrumbs(categoryAncestry as ICategory[]);
	const { name: title, description } =
		categoryAncestry && categoryAncestry.length > 0
			? categoryAncestry[categoryAncestry.length - 1]
			: { name: undefined, description: undefined };
	let filtersApplied = false;
	for (const prop in router.query)
		if (
			isArrayFilterType(prop) ||
			isBooleanFilterType(prop) ||
			isPriceRangeFilterType(prop)
		)
			filtersApplied = true;
	return (
		<StoreLayout wide>
			<>
				<Head
					title={
						title
							? `${title} | ${process.env.NEXT_PUBLIC_APP_NAME}`
							: process.env.NEXT_PUBLIC_APP_NAME
					}
					canonical={`/products/${categoryid}`}
				>
					<meta
						name="description"
						content={description || process.env.NEXT_PUBLIC_APP_NAME}
					/>
				</Head>
				<div className="m-4">
					<BreadCrumbs crumbs={crumbs} />
				</div>
				<div className="p-4 mb-4 grid grid-cols-7 lg:grid-cols-11 xl:grid-cols-12 gap-2 lg:gap-4 xl:gap-8">
					<div className="col-span-7 lg:col-span-3">
						<div className="md:mb-4 flex flex-wrap items-center">
							{loading ? (
								<div className="w-3/4 h-5 lg:h-7 mb-4 sm:mb-0">
									<Skeleton />
								</div>
							) : (
								<div className="w-full mb-4 sm:mb-0 sm:w-9/12 lg:w-auto text-sm md:text-lg overflow-x-hidden break-words">
									{!router.query.search ? (
										<h1 className="font-medium">{title}</h1>
									) : (
										<h1>
											<FormattedMessage
												id="search"
												values={{
													search: (
														<span className="font-medium">{`"${getParamAsString(
															router.query.search
														)}"`}</span>
													),
												}}
											/>
										</h1>
									)}
								</div>
							)}
							<div className="lg:hidden w-full sm:w-3/12 text-right">
								<FiltersDrawer>
									<ProductFilters
										loading={loading || router.isFallback}
										facets={data?.getProducts.facets as ProductFacet | null}
									/>
								</FiltersDrawer>
							</div>
						</div>
						<div className="hidden lg:block bg-white dark:bg-gray-900 border dark:border-gray-600 sticky-filters-container top-24 overflow-auto sticky">
							<ProductFilters
								loading={loading || router.isFallback}
								facets={data?.getProducts.facets as ProductFacet | null}
							/>
						</div>
					</div>
					<div className="col-span-7 lg:col-span-8 xl:col-span-9">
						<div className="flex justify-between items-center pb-4">
							<div className="w-1/2 self-end lg:self-center lg:py-0">
								{!loading && (
									<span className="text-xs sm:text-sm truncate">
										{data?.getProducts.total || 0}{" "}
										<FormattedPlural
											value={data?.getProducts.total || 0}
											one={<FormattedMessage id="item" />}
											other={<FormattedMessage id="items" />}
										/>
									</span>
								)}
							</div>
							<SortByDropdown />
						</div>
						{filtersApplied && (
							<div className="py-3 border-t dark:border-gray-600">
								<FilterTags />
							</div>
						)}
						<div className="bg-white dark:bg-gray-900 dark:border-gray-600 border-t border-r border-l ">
							{loading || router.isFallback ? (
								<>
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
									<ProductListItemSkeleton />
								</>
							) : (
								<>
									{data?.getProducts.products &&
									data.getProducts.products.length > 0 ? (
										data.getProducts.products.map(
											(product: any, index: any) =>
												product && (
													<ProductListItem
														applyDiscount={product.applyDiscount}
														title={product.listing.longTitle}
														condition={product.condition}
														price={product.pricing.price}
														discountPrice={product.pricing.discountPrice}
														freeShipping={product.freeShipping}
														slug={product.slug}
														brand={product.manufacturer.brand}
														imageUrl={product.images?.[0]?.url}
														imagePlaceholder={product.images?.[0]?.placeholder}
														shipping={product.pricing.shipping}
														key={index}
													/>
												)
										)
									) : (
										<div className="dark:border-gray-600 py-8 h-92 md:py-16 flex justify-center border-b">
											<span className=" md:text-lg text-center mx-2">
												<FormattedMessage id="products.notFound" />
											</span>
										</div>
									)}
								</>
							)}
						</div>
						<Pagination
							total={data?.getProducts.total}
							pageSize={DEFAULT_PAGE_SIZE}
							asPath={`/products/${categoryid}`}
							onChangeQueryObj={{ categoryid: undefined }}
							paginatedObjects={formatMessage({ id: "items" })}
						/>
					</div>
				</div>
				<style jsx>
					{`
						.sticky-filters-container {
							max-height: calc(100vh - 6rem);
						}
					`}
				</style>
			</>
		</StoreLayout>
	);
};

export default Products;
export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
	const categoryid = getParamAsString(params?.categoryid);
	if (!categoryid) return { notFound: true };
	await dbConnect();
	const currentLocale = getCurrentLocale(locale);
	const apolloClient = initializeApollo();
	await Promise.all([
		apolloClient.query<GetProductsQuery, GetProductsQueryVariables>({
			query: GetProductsDocument,
			variables: {
				getFacets: true,
				getTotal: true,
				limit: DEFAULT_PAGE_SIZE,
				skip: 0,
				categories:
					categoryid && categoryid !== "all" ? [categoryid] : undefined,
				brand: undefined,
				applyDiscount: undefined,
				freeShipping: undefined,
				condition: undefined,
				sort: undefined,
				search: undefined,
				screenSize: undefined,
				graphicsProcessor: undefined,
				hdd: undefined,
				processor: undefined,
				ram: undefined,
				ssd: undefined,
				minPrice: undefined,
				maxPrice: undefined,
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

export const getStaticPaths: GetStaticPaths = async ({}) => {
	await dbConnect();
	const categories: CategoryDocument[] = await (
		Category as Model<CategoryDocument>
	).find({
		showInMenu: true,
		isOptional: false,
	});
	const categoryPaths = categories.map((category) => ({
		params: { categoryid: category.id },
	}));
	return {
		paths: [...categoryPaths, { params: { categoryid: "all" } }],
		fallback: false,
	};
};
