import { ICategory, ICategoryFullTranslations } from "../Category/types";
import {
	TranslationObject,
	ProductType,
	ProductCondition,
} from "@laptopoutlet-packages/types";
import { MongooseIntlDocument } from "mongoose";

export type ProductListing = {
	longTitle: string;
	shortTitle: string;
	description: string;
};
export type ProductListingFullTranslations = {
	longTitle: TranslationObject;
	shortTitle: TranslationObject;
	description: TranslationObject;
};
export type Image = {
	url: string;
	filename: string;
	placeholder?: string | null;
};
export type ProductPricing = {
	price: number;
	discountPrice: number;
	shipping: number;
};
type ProductManufacturer = {
	brand?: string | null;
	model?: string | null;
};

interface IProductCommonFields {
	id: string;
	images: Image[];
	type: ProductType;
	manufacturer?: ProductManufacturer | null;
	pricing: ProductPricing;
	retailCost?: number | null;
	applyDiscount: boolean;
	quantity: number;
	slug: string;
	condition: ProductCondition;
	discount: boolean;
	list: boolean;
	freeShipping: boolean;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
	updatedBy: string;
}

export interface IProduct extends IProductCommonFields {
	listing: ProductListing;
	categories: ICategory[];
}

export interface IProductFullTranslations extends IProductCommonFields {
	listing: ProductListingFullTranslations;
	categories: ICategoryFullTranslations[];
}

export interface ProductDocument extends IProduct, MongooseIntlDocument {
	id: string;
}
export interface ProductFullTranslationsDocument
	extends IProductFullTranslations,
		MongooseIntlDocument {
	id: string;
}
