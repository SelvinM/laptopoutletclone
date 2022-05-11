import mongoose, { Model } from "mongoose";
import {
	validateEmail,
	validatePhone,
	isArrayLengthLessThan11,
	isArrayLengthLessThan6,
} from "@laptopoutlet-packages/utils";
import { Country, Currency, Locale } from "@laptopoutlet-packages/types";
import { UserDocument } from "./types";
const Schema = mongoose.Schema;

const UserEmailChangeRequestSchema = new Schema(
	{
		pendingEmail: {
			type: String,
			validate: [validateEmail, "emailChangeRequest is not valid"],
			maxlength: [255, "email has maxlength of 255"],
			trim: true,
		},
		code: {
			type: String,
			// validate: [validateCode, "code is not valid"],
			maxlength: [5, "code must have length of 5"],
			minlength: [5, "code must have length of 5"],
		},
	},
	{ _id: false }
);

const UserNotificationSettingSchema = new Schema(
	{
		email: {
			type: Boolean!,
			default: true,
		},
	},
	{ _id: false }
);

const UserNotificationSettingsSchema = new Schema(
	{
		deals: {
			type: UserNotificationSettingSchema,
			required: true,
		},
	},
	{ _id: false }
);

export const AddressSchema = new Schema(
	{
		addressLine1: {
			type: String,
			maxlength: [255, "province has maxlength of 255"],
			trim: true,
			required: true,
		},
		addressLine2: {
			type: String,
			maxlength: [255, "province has maxlength of 255"],
			trim: true,
		},
		country: {
			type: String,
			trim: true,
			enum: Object.values(Country),
			required: true,
		},
		province: {
			type: String,
			maxlength: [128, "province has maxlength of 128"],
			trim: true,
			required: true,
		},
		city: {
			type: String,
			maxlength: [128, "zipcode has maxlength of 128"],
			trim: true,
			required: true,
		},
		zipcode: {
			type: String,
			maxlength: [14, "zipcode has maxlength of 14"],
			trim: true,
			required: true,
		},
	},
	{ _id: false }
);

export const UserAddressSchema = new Schema({
	firstname: {
		type: String,
		maxlength: [26, "province has maxlength of 26"],
		trim: true,
		required: true,
	},
	lastname: {
		type: String,
		maxlength: [26, "province has maxlength of 26"],
		trim: true,
		required: true,
	},
	address: {
		type: AddressSchema,
		required: true,
	},
	phone: {
		type: String,
		validate: [validatePhone, "phone is not valid"],
		maxlength: [20, "phone has maxlength of 20"],
		required: true,
		trim: true,
	},
});

const UserSchema = new Schema(
	{
		name: {
			required: [true, "name is required"],
			trim: true,
			type: String,
		},
		surname: {
			trim: true,
			maxlength: [26, "surname max length is 26"],
			type: String,
		},
		email: {
			type: String,
			required: [true, "email is required"],
			validate: [validateEmail, "email is not valid"],
			maxlength: [255, "email has maxlength of 255"],
			trim: true,
			unique: true,
		},
		emailChangeRequest: UserEmailChangeRequestSchema,
		shippingAddress: {
			type: String,
		},
		paymentInstruments: {
			type: [String],
			validate: [isArrayLengthLessThan6, "5 payment instruments maximum"],
		},
		paymentInstrument: {
			type: String,
		},
		phone: {
			type: String,
			validate: [validatePhone, "phone is not valid"],
			maxlength: [20, "phone has maxlength og 20"],
			trim: true,
		},
		locale: {
			type: String,
			default: "es",
			enum: Object.values(Locale),
		},
		addresses: {
			type: [UserAddressSchema],
			validate: [isArrayLengthLessThan11, "10 addresses maximum"],
		},
		blocked: {
			type: Boolean,
			default: false,
		},
		currency: {
			type: String,
			default: "HNL",
			enum: Object.values(Currency),
		},
		notificationSettings: {
			type: UserNotificationSettingsSchema,
			default: {
				deals: UserNotificationSettingSchema,
			},
		},
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

UserSchema.index({ email: "text", name: "text", surname: "text" });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ updatedAt: 1 });

const UserModel = (mongoose.models.User ||
	mongoose.model("User", UserSchema, "users")) as Model<UserDocument>;

export const User = UserModel;
