import { Locale } from "@laptopoutlet-packages/types";
import mongoose, { Model } from "mongoose";
import mongooseIntl from "../../plugins/mongoose-intl";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import { WarehouseDocument } from "./types";
import { AddressSchema } from "../User";
import { validatePointCoordinates } from "@laptopoutlet-packages/utils";

mongoose.plugin(mongooseIntl, {
	languages: Object.values(Locale),
	defaultLanguage: DEFAULT_LOCALE,
});

const Schema = mongoose.Schema;

const PointSchema = new Schema({
	type: {
		type: String,
		enum: ["Point"],
		required: true,
	},
	coordinates: {
		type: [Number],
		required: true,
		validate: [validatePointCoordinates, "coordinates invalid"],
	},
});

const WarehouseSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			maxlength: 64,
		},
		point: {
			type: PointSchema,
			required: true,
		},
		address: {
			type: AddressSchema,
			required: true,
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
	{ timestamps: true }
);

WarehouseSchema.index({ createdAt: 1 });
WarehouseSchema.index({ updatedAt: 1 });
WarehouseSchema.index({ location: "2dsphere" });

const WarehouseModel = (mongoose.models.Warehouse ||
	mongoose.model("Warehouse", WarehouseSchema)) as Model<WarehouseDocument>;

export const Warehouse = WarehouseModel;
