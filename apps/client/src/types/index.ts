import {
	CardBrand,
	CardType,
	Currency,
	ProductType,
} from "@laptopoutlet-packages/types";
import { IncomingMessage, ServerResponse } from "http";
import { Address } from "@laptopoutlet-packages/models";
export type CategorySummary = {
	name?: string;
	id: string;
	description?: string;
};
export type Crumb = {
	name?: string;
	href?: string;
	as?: string;
};
export type Tab = {
	href: string;
	label: JSX.Element | string;
};
export enum CheckoutState {
	ShippingFormOpen,
	PaymentFormOpen,
	BothClosed,
}
export type Token = {
	name: string;
	email: string;
	picture: string;
	id: string;
	iat: number;
	exp: number;
};
export interface GraphQLContext {
	token?: Token | null;
	res?: ServerResponse;
	req?: IncomingMessage;
	currency?: Currency;
}
export type Facet = {
	title?: string | null;
	count: number;
};
export type ProductFacet = {
	[key: string]: Facet[];
};
export enum ProductSort {
	BestMatch = "bestMatch",
	NewArrivals = "newArrivals",
	PriceAsc = "priceAsc",
	PriceDesc = "priceDesc",
	BrandAsc = "brandAsc",
	BrandDesc = "brandDesc",
}

export enum Country {
	Honduras = "Honduras",
}

export enum Province {
	FraciscoMorazan = "Francisco Morazán",
	Atlantida = "Atlántida",
	Cortes = "Cortés",
	Choluteca = "Choluteca",
}
export enum City {
	Tegucigalpa = "Tegucigalpa",
	Comayaguela = "Comayagüela",
	LaCeiba = "La Ceiba",
	SanPedroSula = "San Pedro Sula",
	Choluteca = "Choluteca",
}

export enum ZipCode {
	Tegucigalpa = "11101",
	Comayaguela = "12101",
	LaCeiba = "31101",
	Choluteca = "51101",
	SanPedroSulaNE = "21101",
	SanPedroSulaNO = "21102",
	SanPedroSulaSE = "21103",
	SanPedroSulaSO = "21104",
}

export enum ArrayFilterType {
	Brand = "brand",
	Condition = "condition",
	ScreenSize = "screenSize",
	Hdd = "hdd",
	Ssd = "ssd",
	Ram = "ram",
	GraphicsProcessor = "graphicsProcessor",
	Processor = "processor",
}

export enum PriceRangeFilterType {
	MinPrice = "minPrice",
	MaxPrice = "maxPrice",
}

export enum BooleanFilterType {
	ApplyDiscount = "applyDiscount",
	FreeShipping = "freeShipping",
}

export type NotificationType =
	| "error"
	| "warning"
	| "success"
	| "default"
	| "info";

// export enum OrdersTimeLapses {
// 	SixtyDays = "sixtyDays",
// 	CurrentYear = "currentYear",
// 	LastYear = "lastYear",
// 	BeforeLastYear = "beforeLastYear",
// }

export enum Theme {
	Dark = "dark",
	Light = "light",
	System = "system",
}

export type PaymentCard = {
	id: string;
	nameOnCard: string;
	expiryMonth: string;
	expiryYear: string;
	type: CardType;
	brand: CardBrand;
	snippet: string;
	billingAddress: Address;
};

type StringOption = undefined | null | string;
type ProductTypeOption = undefined | null | ProductType;
export type ProductsOptions = {
	skip?: number | null;
	limit?: number | null;
	getTotal?: boolean | null;
	getFacets?: boolean | null;
	sort?: ProductSort | null;
	minPrice?: number | null;
	maxPrice?: number | null;
	applyDiscount?: boolean | null;
	freeShipping?: boolean | null;
	categories?: StringOption[] | null;
	type?: ProductTypeOption[] | null;
	search?: string | null;
	excludeItem?: StringOption | null;
	brand?: StringOption[] | null;
	condition?: StringOption[] | null;
	screenSize?: StringOption[] | null;
	hdd?: StringOption[] | null;
	ssd?: StringOption[] | null;
	ram?: StringOption[] | null;
	graphicsProcessor?: StringOption[] | null;
	processor?: StringOption[] | null;
};

export type TImage = {
	url: string;
	placeholder?: string | null;
};

export enum AuthorizationError {
	AVS_FAILED = "AVS_FAILED",
	CONTACT_PROCESSOR = "CONTACT_PROCESSOR",
	EXPIRED_CARD = "EXPIRED_CARD",
	PROCESSOR_DECLINED = "PROCESSOR_DECLINED",
	INSUFFICIENT_FUND = "INSUFFICIENT_FUND",
	STOLEN_LOST_CARD = "STOLEN_LOST_CARD",
	ISSUER_UNAVAILABLE = "ISSUER_UNAVAILABLE",
	UNAUTHORIZED_CARD = "UNAUTHORIZED_CARD",
	CVN_NOT_MATCH = "CVN_NOT_MATCH",
	EXCEEDS_CREDIT_LIMIT = "EXCEEDS_CREDIT_LIMIT",
	INVALID_CVN = "INVALID_CVN",
	BLACKLISTED_CUSTOMER = "BLACKLISTED_CUSTOMER",
	SUSPENDED_ACCOUNT = "SUSPENDED_ACCOUNT",
	PAYMENT_REFUSED = "PAYMENT_REFUSED",
	CV_FAILED = "CV_FAILED",
	INVALID_ACCOUNT = "INVALID_ACCOUNT",
	GENERAL_DECLINE = "GENERAL_DECLINE",
	INVALID_MERCHANT_CONFIGURATION = "INVALID_MERCHANT_CONFIGURATION",
	DECISION_PROFILE_REJECT = "DECISION_PROFILE_REJECT",
	SCORE_EXCEEDS_THRESHOLD = "SCORE_EXCEEDS_THRESHOLD",
	CONSUMER_AUTHENTICATION_REQUIRED = "CONSUMER_AUTHENTICATION_REQUIRED",
}
export enum CybersourceProductCode {
	AdultContent = "adult_content",
	Coupon = "coupon",
	Default = "default",
	ElectronicGood = "electronic_good",
	ElectronicSoftware = "electronic_software",
	GiftCertificate = "gift_certificate",
	Service = "service",
	ShippingAndHandling = "shipping_and_handling",
	Subscription = "subscription",
}
