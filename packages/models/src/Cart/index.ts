import mongoose, { Model } from "mongoose";
import { CartDocument, CartItem, ICart } from "./types";

const Schema = mongoose.Schema;
const CartItemSchema = new Schema({
	product: { type: String, required: true, ref: "Product", index: true },
	quantity: {
		type: Number,
		default: 1,
	},
});

const CartSchema = new Schema(
	{
		_id: {
			type: String,
			required: true,
			ref: "User",
		},
		instaCheckout: {
			type: CartItemSchema,
		},
		cartItems: {
			type: [CartItemSchema],
			required: true,
		},
	},
	{ timestamps: true, _id: false }
);
CartItemSchema.virtual("totalQuantity").get(function (
	this: CartItem | undefined
) {
	if (!this?.product) return 0;
	return this.quantity;
});
CartItemSchema.virtual("unitPriceWithShipping").get(function (
	this: CartItem | undefined
) {
	if (!this?.product) return 0;
	if (this.product.applyDiscount && this.product.freeShipping)
		return this.product.pricing.discountPrice;
	if (this.product.applyDiscount && !this.product.freeShipping)
		return this.product.pricing.discountPrice + this.product.pricing.shipping;
	if (!this.product.applyDiscount && this.product.freeShipping)
		return this.product.pricing.price;
	return this.product.pricing.price + this.product.pricing.shipping;
});
CartItemSchema.virtual("itemsTotalPrice").get(function (
	this: CartItem | undefined
) {
	if (!this?.product) return 0;
	if (this?.product.applyDiscount)
		return this.quantity * this.product.pricing.discountPrice;
	return this.quantity * (this.product?.pricing?.price || 0);
});
CartItemSchema.virtual("shippingTotalPrice").get(function (
	this: CartItem | undefined
) {
	if (!this?.product) return 0;
	if (this.product.freeShipping) return 0;
	return this.product.pricing.shipping * this.quantity;
});
CartItemSchema.virtual("totalPrice").get(function (this: CartItem | undefined) {
	if (!this?.product) return 0;
	if (this.product.freeShipping && this.product.applyDiscount)
		return this.quantity * this.product.pricing.discountPrice;
	if (!this.product.freeShipping && this.product.applyDiscount)
		return (
			this.quantity *
			(this.product.pricing.discountPrice + this.product.pricing.shipping)
		);
	if (this.product.freeShipping && !this.product.applyDiscount)
		return this.quantity * this.product.pricing.price;
	return (
		this.quantity * (this.product.pricing.price + this.product.pricing.shipping)
	);
});
CartSchema.virtual("totalQuantity").get(function (this: ICart) {
	return this.cartItems.reduce((acc, curr) => {
		if (!curr?.product) return acc;
		const quantity = curr.quantity;
		return acc + quantity;
	}, 0);
});

CartSchema.virtual("itemsTotalPrice").get(function (this: ICart) {
	return this.cartItems.reduce((acc, curr) => {
		if (!curr?.product) return acc;
		const quantity = curr.quantity;
		if (curr.product.applyDiscount) {
			const price = curr.product.pricing.discountPrice * quantity;
			return acc + price;
		}
		const price = curr.product.pricing.price * quantity;
		return acc + price;
	}, 0);
});
CartSchema.virtual("shippingTotalPrice").get(function (this: ICart) {
	return this.cartItems.reduce((acc, curr) => {
		if (!curr?.product || curr.product.freeShipping) return acc;
		const quantity = curr.quantity;
		const shipping = curr.product.pricing.shipping * quantity;
		return acc + shipping;
	}, 0);
});
CartSchema.virtual("totalPrice").get(function (this: ICart) {
	return this.cartItems.reduce((acc, curr) => {
		if (!curr?.product) return acc;
		const quantity = curr.quantity;
		if (curr.product.freeShipping && !curr.product.applyDiscount) {
			const totalPrice = curr.product.pricing.price * quantity;
			return acc + totalPrice;
		}
		if (!curr.product.freeShipping && !curr.product.applyDiscount) {
			const totalPrice =
				(curr.product.pricing.price + curr.product.pricing.shipping) * quantity;
			return acc + totalPrice;
		}
		if (curr.product.freeShipping && curr.product.applyDiscount) {
			const totalPrice = curr.product.pricing.discountPrice * quantity;
			return acc + totalPrice;
		}
		const totalPrice =
			(curr.product.pricing.discountPrice + curr.product.pricing.shipping) *
			quantity;
		return acc + totalPrice;
	}, 0);
});
CartSchema.index({ createdAt: 1 });
CartSchema.index({ updatedAt: 1 });

const CartModel = (mongoose.models.Cart ||
	mongoose.model("Cart", CartSchema)) as Model<CartDocument>;

export const Cart = CartModel;
