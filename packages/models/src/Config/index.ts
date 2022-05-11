import { Locale } from "@laptopoutlet-packages/types";
import mongoose, { Model } from "mongoose";
import mongooseIntl from "../../plugins/mongoose-intl";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import { ConfigDocument, ConfigFullTranslationsDocument } from "./types";

mongoose.plugin(mongooseIntl, {
	languages: Object.values(Locale),
	defaultLanguage: DEFAULT_LOCALE,
});

const Schema = mongoose.Schema;

const HomeBannerSchema = new Schema(
	{
		title: {
			type: String,
			intl: true,
			trim: true,
		},
		message: {
			type: String,
			intl: true,
			trim: true,
		},
		buttonLabel: {
			type: String,
			intl: true,
			trim: true,
		},
		href: {
			type: String,
		},
		as: String,
		imageUrl: String,
		imagePlaceholder: String,
	},
	{ _id: false }
);

const SocialLinks = new Schema(
	{
		facebook: String,
		instagram: String,
	},
	{ _id: false }
);

const ConfigSchema = new Schema(
	{
		homeBanner: {
			type: HomeBannerSchema,
			required: true,
		},
		socialLinks: {
			type: SocialLinks,
			required: true,
		},
		updatedBy: {
			type: String,
			ref: "Admin",
			index: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
	}
);
ConfigSchema.index({ createdAt: 1 });
ConfigSchema.index({ updatedAt: 1 });

const ConfigModel = (mongoose.models.Config ||
	mongoose.model("Config", ConfigSchema)) as
	| Model<ConfigDocument>
	| Model<ConfigFullTranslationsDocument>;

export const Config = ConfigModel;
