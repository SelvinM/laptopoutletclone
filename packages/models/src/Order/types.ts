import { IUser, UserAddress } from "../User/types";
import { ProductPricing } from "../Product/types";
import { SimpleInvoice } from "../Cart/types";
import {
	CardBrand,
	CardType,
	OrderItemStatus,
	PaymentMethod,
	ProductCondition,
	ShipmentStatus,
	TranslationObject,
} from "@laptopoutlet-packages/types";
import { MongooseIntlDocument } from "mongoose";

export interface OrderInvoice extends SimpleInvoice {
	returned?: number | null;
}
interface OrderItemCommonFields {
	id: string;
	product?: string | null;
	slug: string;
	pricing: ProductPricing;
	applyDiscount: boolean;
	freeShipping: boolean;
	invoice: OrderInvoice;
	condition: ProductCondition;
	imageUrl?: string | null;
	imagePlaceholder?: string | null;
	status: OrderItemStatus;
}

export interface OrderItemFullTranslations extends OrderItemCommonFields {
	title: TranslationObject;
}

export interface OrderItem extends OrderItemCommonFields {
	title: string;
}
type PaymentCardSummary = {
	type: CardType;
	snippet: string;
	brand: CardBrand;
};

type PaymentMethodSummary = {
	name: PaymentMethod;
	card?: PaymentCardSummary | null;
};

interface ShipmentCommonFields {
	id: string;
	status: ShipmentStatus;
	trackingNumber?: string | null;
	shippedAt?: Date | null;
}

export interface Shipment extends ShipmentCommonFields {
	orderItems: OrderItem[];
}

export interface ShipmentFullTranslations extends ShipmentCommonFields {
	orderItems: OrderItemFullTranslations[];
}

interface IOrderCommonFields {
	id: string;
	user: IUser | null;
	paymentMethod: PaymentMethodSummary;
	shippingAddress: UserAddress;
	invoice: OrderInvoice;
	createdAt: Date;
	updatedAt: Date;
}

export interface IOrder extends IOrderCommonFields {
	shipments: Shipment[];
}

export interface IOrderFullTranslations extends IOrderCommonFields {
	shipments: ShipmentFullTranslations[];
}

export interface OrderDocument extends IOrder, MongooseIntlDocument {
	id: string;
}

export interface OrderFullTranslationsDocument
	extends IOrderFullTranslations,
		MongooseIntlDocument {
	id: string;
}
