import mongoose, { SchemaOptions } from "mongoose";
import {
	ProductType,
	ProductCondition,
	Locale,
} from "@laptopoutlet-packages/types";
import { ProductDocument, ProductFullTranslationsDocument } from "./types";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import mongooseIntl from "../../plugins/mongoose-intl";
import { validateProductId } from "packages/utils/src/validations";

const slug = require("mongoose-slug-updater");

mongoose.plugin(mongooseIntl, {
	languages: Object.values(Locale),
	defaultLanguage: DEFAULT_LOCALE,
});
mongoose.plugin(slug);

const Schema = mongoose.Schema;

export const productSchemaOptions: SchemaOptions = {
	discriminatorKey: "type",
	timestamps: true,
	toJSON: { virtuals: true },
	_id: false,
};
const subDocSchemaOptions: SchemaOptions = {
	_id: false,
};

export const ProductListingSchema = new Schema(
	{
		longTitle: {
			type: String,
			required: [true, "title.es is required"],
			maxlength: [200, "title.es has maxlength of 200"],
			intl: true,
			trim: true,
		},
		shortTitle: {
			type: String,
			required: [true, "shortTitle.es is required"],
			maxlength: [36, "shortTitle.es has maxlength of 36"],
			intl: true,
			trim: true,
		},
		description: {
			type: String,
			maxlength: [1024, "description has maxlength of 1024"],
			intl: true,
			trim: true,
		},
	},
	subDocSchemaOptions
);

const ProductImageSchema = new Schema(
	{
		url: {
			type: String,
			required: [true, "url is required"],
		},
		filename: {
			type: String,
			required: true,
		},
		placeholder: {
			type: String,
		},
	},
	subDocSchemaOptions
);

export const ProductPricingSchema = new Schema(
	{
		price: {
			type: Number,
			required: [true, "pricing.price is required"],
			min: 0,
			index: true,
		},
		discountPrice: {
			type: Number,
			required: [true, "pricing.discountPrice is required"],
			min: 0,
			index: true,
		},
		shipping: {
			type: Number,
			required: [true, "shipping cost is required"],
			min: 0,
		},
	},
	subDocSchemaOptions
);

const ManufacturerSchema = new Schema(
	{
		brand: {
			type: String,
			maxlength: [28, "brand has maxlength of 28"],
			index: true,
			trim: true,
		},
		model: {
			type: String,
			maxlength: [36, "model has maxlength of 36"],
			trim: true,
		},
	},
	subDocSchemaOptions
);

const ProductSchema = new Schema(
	{
		_id: {
			type: String,
			required: true,
			trim: true,
			validate: [validateProductId, "id is not valid"],
			maxLength: [16, "_id has maxlength of 16"],
		},
		listing: { type: ProductListingSchema, required: true },
		images: { type: [ProductImageSchema], default: [] },
		pricing: { type: ProductPricingSchema, required: true },
		retailCost: { type: Number },
		manufacturer: { type: ManufacturerSchema, required: true },
		type: {
			type: String,
			default: ProductType.UndefinedProduct,
			enum: Object.values(ProductType),
			index: true,
		},
		slug: {
			type: String,
			slug: ["listing.shortTitle.es"],
			unique: true,
			permanent: true,
			slugPaddingSize: 4,
		},
		condition: {
			type: String,
			enum: Object.values(ProductCondition),
			required: [true, "condition is required"],
			index: true,
		},
		applyDiscount: { type: Boolean, default: false, index: true },
		list: {
			type: Boolean,
			default: true,
			index: true,
		},
		freeShipping: { type: Boolean, default: false, index: true },
		categories: [
			{
				type: String,
				ref: "Category",
				required: true,
				index: true,
			},
		],
		quantity: {
			type: Number,
			required: true,
			min: 0,
			index: true,
		},
		createdBy: {
			type: String,
			ref: "Admin",
			required: true,
			index: true,
		},
		updatedBy: {
			type: String,
			ref: "Admin",
			required: true,
			index: true,
		},
	},
	productSchemaOptions
);
ProductSchema.index({ createdAt: 1 });
ProductSchema.index({ updatedAt: 1 });
const ProductModel = (mongoose.models.Product ||
	mongoose.model("Product", ProductSchema)) as
	| mongoose.Model<ProductFullTranslationsDocument>
	| mongoose.Model<ProductDocument>;

export const Product = ProductModel;
