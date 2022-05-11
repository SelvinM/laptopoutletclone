import mongoose, { Model } from "mongoose";
import { validateEmail, validatePassword } from "@laptopoutlet-packages/utils";
import { Role } from "@laptopoutlet-packages/types";
import { AdminDocument } from "./types";

const Schema = mongoose.Schema;

const AdminSchema = new Schema(
	{
		firstname: {
			type: String,
			required: [true, "firstname is required"],
			trim: true,
			maxlength: 26,
		},
		lastname: {
			type: String,
			trim: true,
			maxlength: 26,
		},
		tic: {
			type: Number,
			default: 0,
		},
		roles: {
			type: [String],
			required: true,
			enum: Object.values(Role),
		},
		email: {
			type: String,
			required: [true, "email is required"],
			validate: [validateEmail, "email is not valid"],
			maxlength: [255, "email has maxlength of 255"],
			trim: true,
			unique: true,
		},
		password: {
			type: String,
			validate: [validatePassword, "password is not valid"],
			minlength: [8, "password has minlength of 8"],
			maxlength: [128, "password has maxlength of 128"],
		},
	},
	{ timestamps: true }
);

AdminSchema.index({ createdAt: 1 });
AdminSchema.index({ updatedAt: 1 });

const AdminModel = (mongoose.models.Admin ||
	mongoose.model("Admin", AdminSchema)) as Model<AdminDocument>;

export const Admin = AdminModel;
