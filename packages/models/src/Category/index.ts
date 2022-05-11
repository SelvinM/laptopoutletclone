import { Locale } from "@laptopoutlet-packages/types";
import mongoose, { Model } from "mongoose";
import mongooseIntl from "../../plugins/mongoose-intl";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import { CategoryDocument, CategoryFullTranslationsDocument } from "./types";

mongoose.plugin(mongooseIntl, {
	languages: Object.values(Locale),
	defaultLanguage: DEFAULT_LOCALE,
});

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
	{
		_id: {
			type: String,
			required: true,
			trim: true,
			maxLength: [36, "_id has maxlength of 36"],
		},
		name: {
			type: String,
			intl: true,
			maxlength: [36, "name has max length of 36"],
			trim: true,
			required: true,
		},
		description: {
			type: String,
			intl: true,
			maxlength: [256, "description has max length of 256"],
			required: true,
			trim: true,
		},
		imageUrl: {
			type: String,
		},
		showInMenu: {
			type: Boolean,
			default: true,
			index: true,
		},
		isOptional: {
			type: Boolean,
			default: false,
			index: true,
		},
		hasChildren: {
			type: Boolean,
			default: false,
		},
		parent: {
			type: String,
			ref: "Category",
			index: true,
		},
		createdBy: {
			type: String,
			ref: "Admin",
			index: true,
		},
		updatedBy: {
			type: String,
			ref: "Admin",
			index: true,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true }, _id: false }
);

CategorySchema.index({ createdAt: 1 });
CategorySchema.index({ updatedAt: 1 });

const CategoryModel = (mongoose.models.Category ||
	mongoose.model("Category", CategorySchema)) as
	| Model<CategoryDocument>
	| Model<CategoryFullTranslationsDocument>;

export const Category = CategoryModel;
