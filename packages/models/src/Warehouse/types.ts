import { MongooseIntlDocument } from "mongoose";
import { Address } from "../User/types";

type Point = {
	type: "Point";
	coordinates: [number, number];
};

export interface IWarehouse {
	id: string;
	name: string;
	point: Point;
	address: Address;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
	updatedBy: string;
}

export interface WarehouseDocument extends IWarehouse, MongooseIntlDocument {
	id: string;
}
