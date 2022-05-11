import Adapters, { TypeORMUserModel } from "next-auth/adapters";
import { EntitySchemaColumnOptions } from "typeorm";

export default class User extends (<any>Adapters.TypeORM.Models.User.model) {
	constructor(
		name?: string,
		email?: string,
		image?: string,
		emailVerified?: Date
	) {
		super(name, email, image, emailVerified);
		if (!this.name && this.email) this.name = this.email.split("@")[0];
	}
}
type UserSchema = {
	name: string;
	target: typeof TypeORMUserModel;
	columns: {
		name?: EntitySchemaColumnOptions;
		email?: EntitySchemaColumnOptions;
		image?: EntitySchemaColumnOptions;
		emailVerified?: EntitySchemaColumnOptions;
	};
};

export const UserSchema = {
	name: "User",
	target: User,
	columns: {
		...Adapters.TypeORM.Models.User.schema.columns,
	},
};
