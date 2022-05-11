import { Role } from "@laptopoutlet-packages/types";
import { Document } from "mongoose";
export interface IAdmin {
	id: string;
	firstname: string;
	lastname: string;
	tic: number;
	roles: Role[];
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface AdminDocument extends IAdmin, Document {
	id: string;
}
