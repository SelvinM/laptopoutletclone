import mongoose, { Model } from "mongoose";
import { Product, productSchemaOptions } from "..";
import {
	ComputerProductDocument,
	ComputerProductFullTranslationsDocument,
} from "./types";

const Schema = mongoose.Schema;

const ComputerProductDetailsSchema = new Schema(
	{
		model: {
			type: String,
			maxlength: [64, "maxlength is 64"],
			default: "",
			index: true,
			trim: true,
		},
		os: {
			type: String,
			maxlength: [64, "maxlength is 64"],
			default: "",
			index: true,
			trim: true,
		},
		screenSize: {
			type: String,
			maxlength: [28, "maxlength is 28"],
			default: "",
			index: true,
			trim: true,
		},
		hdd: {
			type: String,
			maxlength: [28, "maxlength is 28"],
			default: "",
			index: true,
			trim: true,
		},
		ssd: {
			type: String,
			maxlength: [28, "maxlength is 28"],
			default: "",
			index: true,
			trim: true,
		},
		ram: {
			type: String,
			maxlength: [28, "maxlength is 28"],
			default: "",
			index: true,
			trim: true,
		},
		graphicsProcessor: {
			type: String,
			maxlength: [64, "maxlength is 64"],
			default: "",
			index: true,
			trim: true,
		},
		processor: {
			type: String,
			maxlength: [64, "maxlength is 64"],
			default: "",
			index: true,
			trim: true,
		},
	},
	{ _id: false }
);

const ComputerProductSchema = new Schema(
	{
		details: { type: ComputerProductDetailsSchema, required: true },
	},
	productSchemaOptions
);

const ComputerProductModel = (mongoose.models.ComputerProduct ||
	Product.discriminator("ComputerProduct", ComputerProductSchema)) as
	| Model<ComputerProductDocument>
	| Model<ComputerProductFullTranslationsDocument>;

export const ComputerProduct = ComputerProductModel;
