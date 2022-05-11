import { Locale, Currency } from "@laptopoutlet-packages/types";
import { Document } from "mongoose";

type EmailChangeRequest = {
	pendingEmail: string;
	code: string;
};

type NotificationSetting = {
	email: boolean;
};

type NotificationSettings = {
	deals: NotificationSetting;
};

export type Address = {
	addressLine1: string;
	addressLine2?: string | null;
	country: string;
	province: string;
	city: string;
	zipcode: string;
};

export type UserAddress = {
	id: string;
	firstname: string;
	lastname: string;
	address: Address;
	phone: string;
};

export interface IUser {
	id: string;
	name: string;
	surname?: string | null;
	image: string;
	email: string;
	password?: string;
	phone?: string | null;
	locale?: Locale | null;
	addresses?: UserAddress[] | null;
	paymentInstruments?: string[] | null;
	currency?: Currency | null;
	notificationSettings?: NotificationSettings | null;
	emailChangeRequest?: EmailChangeRequest | null;
	shippingAddress?: string | null;
	paymentInstrument?: string | null;
	blocked?: boolean | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserDocument extends IUser, Document {
	id: string;
}
