import {
	CardType,
	Locale,
	OrderItemStatus,
	PaymentMethod,
	ProductCondition,
	CardBrand,
	ShipmentStatus,
} from "@laptopoutlet-packages/types";
import { validateNumber } from "@laptopoutlet-packages/utils";
import { UserAddressSchema } from "../User";
import {
	IOrder,
	OrderDocument,
	OrderFullTranslationsDocument,
	OrderInvoice,
} from "./types";
import mongoose, { Model } from "mongoose";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import mongooseIntl from "../../plugins/mongoose-intl";

mongoose.plugin(mongooseIntl, {
	languages: Object.values(Locale),
	defaultLanguage: DEFAULT_LOCALE,
});

const Schema = mongoose.Schema;

const InvoiceSchema = new Schema(
	{
		totalQuantity: {
			type: Number,
			min: 1,
			required: true,
			immutable: true,
		},
		itemsTotalPrice: {
			type: Number,
			min: 0,
			required: true,
			immutable: true,
		},
		shippingTotalPrice: {
			type: Number,
			min: 0,
			required: true,
			immutable: true,
		},
		returned: {
			type: Number,
			max: 0,
		},
	},
	{ _id: false }
);

InvoiceSchema.virtual("totalPrice").get(function (this: OrderInvoice) {
	return this.itemsTotalPrice + this.shippingTotalPrice + (this.returned || 0);
});

const PaymentCardSummarySchema = new Schema(
	{
		brand: {
			type: String,
			required: true,
			enum: Object.values(CardBrand),
		},
		snippet: {
			type: String,
			required: true,
			maxlength: 4,
			validate: [validateNumber, "Only numbers allowed"],
		},
		type: {
			type: String,
			required: true,
			enum: Object.values(CardType),
		},
	},
	{ _id: false }
);

const OrderItemPricingSchema = new Schema(
	{
		price: {
			type: Number,
			required: [true, "pricing.price is required"],
			min: 0,
		},
		discountPrice: {
			type: Number,
			required: [true, "pricing.discountPrice is required"],
			min: 0,
		},
		shipping: {
			type: Number,
			required: [true, "shipping cost is required"],
			min: 0,
		},
	},
	{ _id: false }
);

export const OrderItemSchema = new Schema({
	product: {
		type: String,
		ref: "Product",
		required: true,
		index: true,
	},
	title: {
		type: String,
		required: [true, "title.es is required"],
		maxlength: [200, "title.es has maxlength of 200"],
		intl: true,
		trim: true,
	},
	slug: {
		type: String,
		required: true,
	},
	pricing: {
		type: OrderItemPricingSchema,
		required: true,
	},
	imageUrl: {
		type: String,
	},
	imagePlaceholder: {
		type: String,
	},
	applyDiscount: { type: Boolean, required: true },
	freeShipping: { type: Boolean, required: true },
	status: {
		type: String,
		enum: Object.values(OrderItemStatus),
		required: true,
	},
	condition: {
		type: String,
		enum: Object.values(ProductCondition),
		required: true,
	},
	invoice: {
		type: InvoiceSchema,
		required: true,
	},
	updatedBy: {
		type: String,
		ref: "Admin",
		index: true,
	},
});

const PaymentMethodSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			enum: Object.values(PaymentMethod),
		},
		card: {
			type: PaymentCardSummarySchema,
		},
	},
	{ _id: false }
);

const ShipmentSchema = new Schema(
	{
		_id: {
			type: String,
			required: true,
			ref: "User",
		},
		shippingAddress: {
			type: UserAddressSchema,
		},
		orderItems: {
			type: [OrderItemSchema],
			required: true,
		},
		trackingNumber: {
			type: String,
		},
		shippedAt: {
			type: Date,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(ShipmentStatus),
		},
	},
	{ _id: false }
);

const OrderSchema = new Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		user: {
			type: String,
			ref: "User",
			required: true,
			index: true,
		},
		shipments: {
			type: [ShipmentSchema],
			required: true,
		},
		shippingAddress: {
			type: UserAddressSchema,
			required: true,
		},
		paymentMethod: {
			type: PaymentMethodSchema,
			required: true,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true }, _id: false }
);
OrderSchema.virtual("invoice.totalQuantity").get(function (this: IOrder) {
	return this.shipments.reduce((acc, currentShipment) => {
		let quantityInShipment = 0;
		currentShipment.orderItems.forEach((item) => {
			quantityInShipment = quantityInShipment + item.invoice.totalQuantity;
		});
		return acc + quantityInShipment;
	}, 0);
});

OrderSchema.virtual("invoice.itemsTotalPrice").get(function (this: IOrder) {
	return this.shipments.reduce((acc, currentShipment) => {
		let itemsTotalPriceInShipment = 0;
		currentShipment.orderItems.forEach((item) => {
			itemsTotalPriceInShipment =
				itemsTotalPriceInShipment + item.invoice.itemsTotalPrice;
		});
		return acc + itemsTotalPriceInShipment;
	}, 0);
});
OrderSchema.virtual("invoice.shippingTotalPrice").get(function (this: IOrder) {
	return this.shipments.reduce((acc, currentShipment) => {
		let shippingTotalPriceInShipment = 0;
		currentShipment.orderItems.forEach((item) => {
			shippingTotalPriceInShipment =
				shippingTotalPriceInShipment + item.invoice.shippingTotalPrice;
		});
		return acc + shippingTotalPriceInShipment;
	}, 0);
});

OrderSchema.virtual("invoice.returned").get(function (this: IOrder) {
	const returned = this.shipments.reduce((acc, currentShipment) => {
		let returnedInShipment = 0;
		currentShipment.orderItems.forEach((item) => {
			returnedInShipment = returnedInShipment + (item.invoice.returned || 0);
		});
		return acc + returnedInShipment;
	}, 0);
	if (returned === 0) return null;
	return returned;
});

OrderSchema.virtual("invoice.totalPrice").get(function (this: IOrder) {
	return this.shipments.reduce((acc, currentShipment) => {
		let totalPriceInShipment = 0;
		currentShipment.orderItems.forEach((item) => {
			totalPriceInShipment =
				totalPriceInShipment +
				item.invoice.itemsTotalPrice +
				item.invoice.shippingTotalPrice +
				(item.invoice.returned || 0);
		});
		return acc + totalPriceInShipment;
	}, 0);
});

OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ updatedAt: 1 });
OrderSchema.index({ user: 1, "shipments.status": 1 });
const OrderModel = (mongoose.models.Order ||
	mongoose.model("Order", OrderSchema)) as
	| Model<OrderDocument>
	| Model<OrderFullTranslationsDocument>;

export const Order = OrderModel;
