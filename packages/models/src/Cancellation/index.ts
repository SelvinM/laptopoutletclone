import { Locale } from "@laptopoutlet-packages/types";
import mongoose, { Model } from "mongoose";
import mongooseIntl from "../../plugins/mongoose-intl";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import {
	CancellationDocument,
	CancellationFullTranslationsDocument,
} from "./types";
import { OrderItemSchema } from "../Order";
mongoose.plugin(mongooseIntl, {
	languages: Object.values(Locale),
	defaultLanguage: DEFAULT_LOCALE,
});

const Schema = mongoose.Schema;

const CancellationSchema = new Schema(
	{
		order: { type: String, required: true, ref: "Order" },
		user: { type: String, required: true, ref: "User", index: true },
		shipmentid: { type: String, required: true },
		orderItems: {
			type: [OrderItemSchema],
			required: true,
		},
		cancelledBy: {
			type: String,
			ref: "Admin",
		},
	},
	{ timestamps: true }
);

const CancellationModel = (mongoose.models.Cancellation ||
	mongoose.model("Cancellation", CancellationSchema)) as
	| Model<CancellationDocument>
	| Model<CancellationFullTranslationsDocument>;

export const Cancellation = CancellationModel;
