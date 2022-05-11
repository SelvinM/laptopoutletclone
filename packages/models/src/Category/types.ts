import { TranslationObject } from "@laptopoutlet-packages/types";
import { MongooseIntlDocument } from "mongoose";

interface CategoryCommonFields {
	imageUrl: string;
	showInMenu: boolean;
	hasChildren: boolean;
	isOptional: boolean;
	parent?: string | null;
	createdBy: string;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICategory extends CategoryCommonFields {
	id: string;
	name: string;
	description: string;
	children?: ICategory[] | null;
}

export interface ICategoryFullTranslations extends CategoryCommonFields {
	id: string;
	name: TranslationObject;
	description: TranslationObject;
	children?: ICategoryFullTranslations[] | null;
}

export interface CategoryDocument extends ICategory, MongooseIntlDocument {
	id: string;
}
export interface CategoryFullTranslationsDocument
	extends ICategoryFullTranslations,
		MongooseIntlDocument {
	id: string;
}
