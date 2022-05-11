import { IProduct } from "../Product/types";
import { Document } from "mongoose";
export interface SimpleInvoice {
	totalQuantity: number;
	itemsTotalPrice: number;
	shippingTotalPrice: number;
	totalPrice: number;
}

interface CartItemInvoice extends SimpleInvoice {
	unitPriceWithShipping: number;
}
export interface CartItem extends CartItemInvoice {
	id: string;
	product: IProduct | null;
	quantity: number;
}

export interface ICart extends SimpleInvoice {
	id: string;
	instaCheckout?: CartItem;
	cartItems: CartItem[];
	createdAt: Date;
	updatedAt: Date;
}
export interface CartDocument extends ICart, Document {
	id: string;
}
