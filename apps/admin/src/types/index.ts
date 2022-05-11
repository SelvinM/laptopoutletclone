export type TreeNode = {
	title: string;
	value: string;
	children?: TreeNode[];
};

export enum SortType {
	Asc = "asc",
	Desc = "desc",
}

export type TableFilter = (string | number | boolean)[] | null | undefined;

export type TableFilters = Record<string, (string | number | boolean)[] | null>;

export enum SortCriteria {
	CreatedAt = "createdAt",
	UpdatedAt = "updatedAt",
}
import { ProductCondition } from "@laptopoutlet-packages/types";
import { ServerResponse, IncomingMessage } from "http";
import { TokenUser } from "../utils/auth";

export type GraphQLContext = {
	res?: ServerResponse;
	req?: IncomingMessage;
	user?: TokenUser;
};

export type SortInfo = {
	columnKey?: SortCriteria;
	order?: "ascend" | "descend";
};

export interface ProductForm {
	longTitleEs: string;
	longTitleEn?: string;
	shortTitleEs: string;
	shortTitleEn?: string;
	descriptionEs: string;
	descriptionEn?: string;
	brand?: string;
	modelNumber?: string;
	price: number;
	discountPrice: number;
	shipping: number;
	condition: ProductCondition;
	list: boolean;
	applyDiscount: boolean;
	freeShipping: boolean;
	category: string;
	productLists?: string[];
	quantity: number;
}

export interface ProductFormErrors {
	longTitleEs?: string;
	longTitleEn?: string;
	shortTitleEs?: string;
	shortTitleEn?: string;
	descriptionEs?: string;
	descriptionEn?: string;
	brand?: string;
	modelNumber?: string;
	price?: number;
	discountPrice?: number;
	shipping?: number;
	condition?: ProductCondition;
	list?: boolean;
	applyDiscount?: boolean;
	freeShipping?: boolean;
	category?: string;
	productLists?: string[];
	quantity?: number;
}
export interface ComputerProductForm extends ProductForm {
	modelName?: string;
	os?: string;
	screenSize?: string;
	hdd?: string;
	ssd?: string;
	ram?: string;
	graphicsProcessor?: string;
	processor?: string;
}

export type ProductFormFields = ProductForm | ComputerProductForm;

export type ProductFormFieldsErrors = ProductFormErrors | ComputerProductForm;
