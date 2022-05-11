import { MongooseIntlDocument } from "mongoose";
import { IProductFullTranslations, IProduct } from "../types";

type ComputerProductDetails = {
	model?: string | null;
	os?: string | null;
	screenSize?: string | null;
	hdd?: string | null;
	ssd?: string | null;
	ram?: string | null;
	graphicsProcessor?: string | null;
	processor?: string | null;
};
export interface IComputerProduct extends IProduct {
	details: ComputerProductDetails;
}
export interface IComputerProductFullTranslations
	extends IProductFullTranslations {
	details: ComputerProductDetails;
}
export interface ComputerProductDocument
	extends IComputerProduct,
		MongooseIntlDocument {
	id: string;
}

export interface ComputerProductFullTranslationsDocument
	extends IComputerProductFullTranslations,
		MongooseIntlDocument {
	id: string;
}
