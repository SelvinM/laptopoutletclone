import { IUser } from "@laptopoutlet-packages/models";
import { MongooseIntlDocument } from "mongoose";
import { OrderItem, OrderItemFullTranslations } from "../Order/types";

interface CancellationCommonFields {
	id: string;
	order: string;
	user: IUser;
	shipmentid: string;
	cancelledBy?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICancellation extends CancellationCommonFields {
	orderItems: OrderItem[];
}

export interface ICancellationFullTranslations
	extends CancellationCommonFields {
	orderItems: OrderItemFullTranslations[];
}

export interface CancellationFullTranslationsDocument
	extends ICancellationFullTranslations,
		MongooseIntlDocument {
	id: string;
}

export interface CancellationDocument
	extends ICancellation,
		MongooseIntlDocument {
	id: string;
}
