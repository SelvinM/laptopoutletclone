import mongoose, { Model } from "mongoose";
import {
	ArrayFilterType,
	BooleanFilterType,
	GraphQLContext,
} from "../../../types";
import {
	Category,
	User,
	Product,
	Cart,
	Config,
	ProductDocument,
	CategoryDocument,
	ConfigDocument,
	ICategory,
	Order,
	OrderDocument,
} from "@laptopoutlet-packages/models";
import {
	getFinalPipeline,
	getProductsMatchAfterApplyingFilters,
	getProductsMatchBeforeApplyingFilters,
	getProductsSort,
} from "../../../utils/productsQueryHelpers";
import { unflattenCategories } from "../../../utils/categoryDataHelpers";
import {
	PaymentCard,
	ProductFacets,
	QueryResolvers,
} from "graphql-let/__generated__/__types__";
import { getPaymentInstrument } from "apps/client/src/utils/paymentFunctions";
import { DEFAULT_PAGE_SIZE } from "apps/client/src/constants";
const transformCategories = (categories: any) => {
	return categories.map((category: ICategory) => {
		if (category.hasChildren && category.children) {
			const newCategory = new (Category as Model<CategoryDocument>)({
				...category,
				children: transformCategories(category.children),
			});
			return newCategory.toJSON({ virtuals: true });
		}
		const newCategory = new (Category as Model<CategoryDocument>)({
			...category,
		});
		return newCategory.toJSON({ virtuals: true });
	});
};

const Query: Required<QueryResolvers> = {
	getConfig: async (_node, { locale }) => {
		mongoose.setDefaultLanguage(locale);
		const config = await Config.findOne();
		return config as ConfigDocument | null;
	},
	me: async (_node, _args, { token }: GraphQLContext) => {
		if (!token?.id) return null;
		const loggedUser = await User.findById(token.id);
		return loggedUser;
	},
	categories: async (_node, { locale }) => {
		mongoose.setDefaultLanguage(locale);
		const flattenedCategories = await (
			Category as Model<CategoryDocument>
		).find({
			showInMenu: true,
		});
		const categories = unflattenCategories(flattenedCategories);
		return categories;
	},
	getProducts: async (_node, { options, locale }) => {
		const $search = {
			phrase: {
				query: options?.search,
				path: [
					"listing.shortTitle.es",
					"listing.longTitle.es",
					"listing.description.es",
					"listing.shortTitle.en",
					"listing.longTitle.en",
					"listing.description.en",
					"manufacturer.brand",
					"manufacturer.model",
				],
				slop: 5,
			},
		}; //we declare the search pipeline attribute to reutilize later
		const initialMatch = getProductsMatchBeforeApplyingFilters(options); //match before applying filters (implicit filters. ex. categories)
		const facetToString = {
			$addFields: {
				title: {
					$toString: "$_id",
				},
			},
		};
		let facetsPipeline: any[] = [
			{
				$facet: {
					applyDiscount: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [BooleanFilterType.ApplyDiscount],
							}),
						},
						{ $sortByCount: "$applyDiscount" },
						facetToString,
					],
					freeShipping: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [BooleanFilterType.FreeShipping],
							}),
						},
						{ $sortByCount: "$freeShipping" },
						facetToString,
					],
					brand: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.Brand],
							}),
						},
						{ $sortByCount: "$manufacturer.brand" },
						facetToString,
					],
					condition: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.Condition],
							}),
						},
						{ $sortByCount: "$condition" },
						facetToString,
					],
					screenSize: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.ScreenSize],
							}),
						},
						{ $sortByCount: "$details.screenSize" },
						facetToString,
					],
					hdd: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.Hdd],
							}),
						},
						{ $sortByCount: "$details.hdd" },
						facetToString,
					],
					ssd: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.Ssd],
							}),
						},
						{ $sortByCount: "$details.ssd" },
						facetToString,
					],
					ram: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.Ram],
							}),
						},
						{ $sortByCount: "$details.ram" },
						facetToString,
					],
					graphicsProcessor: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.GraphicsProcessor],
							}),
						},
						{ $sortByCount: "$details.graphicsProcessor" },
						facetToString,
					],
					processor: [
						{
							$match: getProductsMatchAfterApplyingFilters({
								options,
								$match: initialMatch,
								filtersToIgnore: [ArrayFilterType.Processor],
							}),
						},
						{ $sortByCount: "$details.processor" },
						facetToString,
					],
				},
			},
		]; //we initialize the facets pipeline
		if (options?.search) facetsPipeline = [{ $search }, ...facetsPipeline]; //if there is a search option we add it to the facets pipeline
		let pipeline: any[] = [
			{
				$match: getProductsMatchAfterApplyingFilters({
					options,
					$match: initialMatch,
				}),
			},
		]; //we add the optional filters to the pipeline
		if (options?.search) pipeline = [{ $search }, ...pipeline];
		const [products, count, facetsArray] = await Promise.all([
			Product.aggregate(
				getFinalPipeline({
					pipeline,
					locale,
					$sort: getProductsSort(options?.sort),
					options,
				})
			),
			options?.getTotal
				? Product.aggregate([...pipeline, { $count: "total" }])
				: undefined,
			options?.getFacets
				? (Product as Model<ProductDocument>).aggregate(facetsPipeline)
				: undefined,
		]);
		const total = count ? (count.length > 0 ? count[0].total : 0) : null;
		const facets: ProductFacets | undefined = facetsArray?.[0];
		return { products, total, facets };
	},
	getProduct: async (_node, { slug, locale }) => {
		mongoose.setDefaultLanguage(locale);
		const product = await (Product as Model<ProductDocument>)
			.findOne({ slug, list: true })
			.populate("categories")
			.exec();
		return product?.toJSON({ virtuals: true }) || null;
	},
	getCart: async (_node, { locale }, { token }: GraphQLContext) => {
		if (!token?.id) return null;
		mongoose.setDefaultLanguage(locale);
		const cart = await Cart.findOne({ _id: token?.id })
			.populate("cartItems.product instaCheckout.product")
			.exec();
		if (!cart)
			return {
				id: token.id,
				cartItems: [],
				itemsTotalPrice: 0,
				totalPrice: 0,
				shippingTotalPrice: 0,
				totalQuantity: 0,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};
		return cart.toJSON({ virtuals: true });
	},
	getPaymentCards: async (_node, {}, { token }: GraphQLContext) => {
		const user = await User.findById(token?.id);
		if (!user?.paymentInstruments) return null;
		const paymentInstrumentsFunctions = user.paymentInstruments.map((id) =>
			getPaymentInstrument(id)
		);
		const paymentInstruments = await Promise.all(paymentInstrumentsFunctions);
		return {
			paymentCards: paymentInstruments
				.filter((item) => !!item)
				.map((item) => item?.paymentCard) as PaymentCard[],
			defaultCard: user.paymentInstrument,
		};
	},
	getOrders: async (_node, { options, locale }, { token }: GraphQLContext) => {
		if (!token?.id) return null;
		mongoose.setDefaultLanguage(locale);
		let query: any = { user: token.id };
		if (options?.shipmentStatus)
			query = {
				...query,
				shipments: { $elemMatch: { status: options.shipmentStatus } },
			};
		const [total, orders] = await Promise.all([
			(Order as Model<OrderDocument>).countDocuments(query),
			(Order as Model<OrderDocument>)
				.find(query)
				.sort([["createdAt", "desc"]])
				.skip(options?.skip || 0)
				.limit(options?.limit || DEFAULT_PAGE_SIZE),
		]);
		return { total, orders };
	},
	getOrder: async (_node, { locale, id }, { token }: GraphQLContext) => {
		if (!token?.id) return null;
		mongoose.setDefaultLanguage(locale);
		const order = await (Order as Model<OrderDocument>).findById(id);
		if (!order || (order.user as any) !== token.id) return null;
		return order.toJSON({ virtuals: true });
	},
};
export default Query;
