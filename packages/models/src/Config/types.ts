import { TranslationObject } from "@laptopoutlet-packages/types";
import { MongooseIntlDocument } from "mongoose";

interface HomeBannerCommonFields {
	href?: string | null;
	as?: string | null;
	imageUrl?: string | null;
	imagePlaceholder?: string | null;
}

interface HomeBanner extends HomeBannerCommonFields {
	title?: string | null;
	message?: string | null;
	buttonLabel?: string | null;
}
interface HomeBannerFullTranslations extends HomeBannerCommonFields {
	title?: TranslationObject | null;
	message?: TranslationObject | null;
	buttonLabel?: TranslationObject | null;
}
type SocialLinks = {
	facebook?: string | null;
	instagram?: string | null;
};

interface IConfigCommonFields {
	id: string;
	socialLinks?: SocialLinks | null;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface IConfig extends IConfigCommonFields {
	homeBanner: HomeBanner;
}
export interface IConfigFullTranslations extends IConfigCommonFields {
	homeBanner: HomeBannerFullTranslations;
}

export interface ConfigDocument extends IConfig, MongooseIntlDocument {
	id: string;
}

export interface ConfigFullTranslationsDocument
	extends IConfigFullTranslations,
		MongooseIntlDocument {
	id: string;
}
