import {
	Admin,
	Cancellation,
	CancellationFullTranslationsDocument,
	Category,
	CategoryFullTranslationsDocument,
	Config,
	ConfigFullTranslationsDocument,
	IAdmin,
	ICategoryFullTranslations,
	IConfigFullTranslations,
	IProductFullTranslations,
	Order,
	OrderFullTranslationsDocument,
	Product,
	ProductFullTranslationsDocument,
	User,
	Warehouse,
} from "@laptopoutlet-packages/models";
import { DEFAULT_PAGINATION_LIMIT } from "apps/admin/src/constants";
import { unflattenCategories } from "apps/admin/src/utils/categoryDataHelpers";
import { Model } from "mongoose";
import { GraphQLContext } from "../../../types";
import { QueryResolvers } from "graphql-let/__generated__/__types__";

const Query: Required<QueryResolvers> = {
	me: async (_root, _args, { user }: GraphQLContext) => {
		if (!user?.id) {
			return null;
		}
		const me = await Admin.findById(user?.id);
		return me?.toJSON({ virtuals: true }) as IAdmin;
	},
	getAdmins: async (_root, { options }, { user }: GraphQLContext) => {
		const [total, admins] = await Promise.all([
			Admin.countDocuments({ $nor: [{ _id: user?.id }] }),
			Admin.find({ $nor: [{ _id: user?.id }] })
				.sort([
					[
						options?.sort?.criteria || "createdAt",
						options?.sort?.type || "desc",
					],
				])
				.skip(options?.skip || 0)
				.limit(options?.limit || DEFAULT_PAGINATION_LIMIT),
		]);
		return { total, admins };
	},
	getWarehouses: async (_root, { options }, { user }: GraphQLContext) => {
		const [total, warehouses] = await Promise.all([
			Warehouse.countDocuments({ $nor: [{ _id: user?.id }] }),
			Warehouse.find({ $nor: [{ _id: user?.id }] })
				.sort([
					[
						options?.sort?.criteria || "createdAt",
						options?.sort?.type || "desc",
					],
				])
				.skip(options?.skip || 0)
				.limit(options?.limit || DEFAULT_PAGINATION_LIMIT),
		]);
		return { total, warehouses };
	},
	getWarehouse: async (_root, { id }) => {
		const warehouse = await Warehouse.findById(id);
		return warehouse?.toJSON({ virtuals: true }) || null;
	},
	getAdmin: async (_root, { id }) => {
		const admin = await Admin.findById(id);
		return admin?.toJSON({ virtuals: true }) || null;
	},
	getCategories: async () => {
		const flattenedCategories = await (
			Category as Model<CategoryFullTranslationsDocument>
		).find();
		const categories = unflattenCategories(flattenedCategories);
		return categories;
	},
	getCategory: async (_root, { id }) => {
		const category = await (
			Category as Model<CategoryFullTranslationsDocument>
		).findById(id);
		return category?.toJSON({ virtuals: true }) as ICategoryFullTranslations;
	},
	verifyIdAvailability: async (_root, { id }) => {
		const exists = await (
			Product as Model<ProductFullTranslationsDocument>
		).exists({ _id: id });
		return !exists;
	},
	getProducts: async (_root, { options }) => {
		const sortCriteria = options?.sort?.criteria
			? options?.sort?.criteria
			: "createdAt";
		const sortType = options?.sort?.type ? options?.sort?.type : "desc";
		let match: any = {};

		if (options?.categories && options.categories.length > 0)
			match = {
				...match,
				categories: {
					$in: options.categories,
				},
			};

		if (options?.applyDiscount !== null && options?.applyDiscount !== undefined)
			match = {
				...match,
				applyDiscount: options.applyDiscount,
			};

		if (options?.freeShipping !== null && options?.freeShipping !== undefined)
			match = {
				...match,
				freeShipping: options.freeShipping,
			};

		if (options?.list !== null && options?.list !== undefined)
			match = {
				...match,
				list: options.list,
			};

		if (options?.type !== null && options?.type !== undefined)
			match = {
				...match,
				type: { $in: options.type },
			};

		if (options?.condition !== null && options?.condition !== undefined)
			match = {
				...match,
				condition: { $in: options.condition },
			};

		if (options?.brand !== null && options?.brand !== undefined)
			match = {
				...match,
				"manufacturer.brand": { $in: options.brand },
			};

		let query: any[] = [{ $match: match }];
		if (options?.search) {
			query = [
				{
					$search: {
						phrase: {
							query: options.search.split(" "),
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
					},
				},
				...query,
			];
		}

		const [count, products]: any = await Promise.all([
			(Product as Model<ProductFullTranslationsDocument>).aggregate([
				...query,
				{ $count: "total" },
			]),
			(Product as Model<ProductFullTranslationsDocument>).aggregate([
				...query,
				{
					$sort: { [sortCriteria]: sortType === "desc" ? -1 : 1 },
				},
				{
					$skip: options?.skip ? options.skip : 0,
				},
				{
					$limit: options?.limit ? options.limit : DEFAULT_PAGINATION_LIMIT,
				},
				{
					$lookup: {
						from: "categories",
						localField: "categories",
						foreignField: "_id",
						as: "categories",
					},
				},
				{
					$addFields: {
						id: {
							$toString: "$_id",
						},
						categories: {
							$map: {
								input: "$categories",
								as: "category",
								in: {
									id: {
										$toString: "$$category._id",
									},
									name: {
										es: "$$category.name.es",
										en: "$$category.name.en",
									},
									description: {
										es: "$$category.description.es",
										en: "$$category.description.en",
									},
									showInMenu: "$$category.showInMenu",
									hasChildren: "$$category.hasChildren",
									isOptional: "$$category.isOptional",
									parent: "$$category.parent",
									createdAt: "$$category.createdAt",
									updatedAt: "$$category.updatedAt",
								},
							},
						},
					},
				},
			]),
		]);
		const total: number = count.length > 0 ? count[0].total : 0;
		return { total, products };
	},
	getProduct: async (_root, { id }) => {
		const product = await (Product as Model<ProductFullTranslationsDocument>)
			.findById(id)
			.populate("categories")
			.exec();
		return product?.toJSON({
			virtuals: true,
		}) as IProductFullTranslations;
	},
	getDistinctBrands: async () => {
		const data = await (
			Product as Model<ProductFullTranslationsDocument>
		).distinct("manufacturer.brand");
		return data;
	},
	getDistinctProductDetails: async (_root, { type }) => {
		let groupBy = undefined;
		if (type === "UndefinedProduct") {
			return null;
		}
		if (type === "ComputerProduct") {
			groupBy = {
				_id: null,
				model: { $addToSet: "$details.model" },
				os: { $addToSet: "$details.os" },
				screenSize: { $addToSet: "$details.screenSize" },
				hdd: { $addToSet: "$details.hdd" },
				ssd: { $addToSet: "$details.ssd" },
				ram: { $addToSet: "$details.ram" },
				graphicsProcessor: { $addToSet: "$details.graphicsProcessor" },
				processor: { $addToSet: "$details.processor" },
			};
		}
		const dataArray = await (
			Product as Model<ProductFullTranslationsDocument>
		).aggregate([
			{ $match: { type } },
			{
				$group: groupBy,
			},
		]);
		const data = dataArray[0] as any;
		return data;
	},
	getConfig: async () => {
		const config = await (
			Config as Model<ConfigFullTranslationsDocument>
		).findOne();
		return config?.toJSON({ virtuals: true }) as IConfigFullTranslations;
	},
	getUser: async (_root, { id }) => {
		const user = await User.findById(id);
		return user;
	},
	getUsers: async (_root, { options }) => {
		let query = {};
		if (options?.search) {
			query = { $text: { $search: options?.search } };
		}
		const [total, users] = await Promise.all([
			User.countDocuments(),
			User.find(query)
				.sort([
					[
						options?.sort?.criteria || "createdAt",
						options?.sort?.type || "desc",
					],
				])
				.skip(options?.skip || 0)
				.limit(options?.limit || DEFAULT_PAGINATION_LIMIT),
		]);
		return { total, users };
	},
	getOrders: async (_root, { options }) => {
		let query: any = {};
		if (options?.shipmentStatus && options.shipmentStatus.length > 0)
			query = {
				...query,
				shipments: { $elemMatch: { status: { $in: options.shipmentStatus } } },
			};
		const [total, orders] = await Promise.all([
			(Order as Model<OrderFullTranslationsDocument>).countDocuments(query),
			(Order as Model<OrderFullTranslationsDocument>)
				.find(query)
				.sort([
					[
						options?.sort?.criteria || "createdAt",
						options?.sort?.type || "desc",
					],
				])
				.skip(options?.skip || 0)
				.limit(options?.limit || DEFAULT_PAGINATION_LIMIT)
				.populate("user")
				.exec(),
		]);
		return { total, orders };
	},
	getOrder: async (_root, { id }) => {
		const order = await (Order as Model<OrderFullTranslationsDocument>)
			.findById(id)
			.populate("user")
			.exec();
		return order?.toJSON({ virtuals: true }) || null;
	},
	getCancellations: async (_root, { options }) => {
		const [total, cancellations] = await Promise.all([
			(
				Cancellation as Model<CancellationFullTranslationsDocument>
			).countDocuments(),
			(Cancellation as Model<CancellationFullTranslationsDocument>)
				.find()
				.sort([
					[
						options?.sort?.criteria || "createdAt",
						options?.sort?.type || "desc",
					],
				])
				.skip(options?.skip || 0)
				.limit(options?.limit || DEFAULT_PAGINATION_LIMIT)
				.populate("user")
				.exec(),
		]);
		return { total, cancellations };
	},
	getCancellation: async (_root, { id }) => {
		const cancellation = await (
			Cancellation as Model<CancellationFullTranslationsDocument>
		)
			.findById(id)
			.populate("user")
			.exec();
		return cancellation?.toJSON({ virtuals: true }) || null;
	},
};
export default Query;
