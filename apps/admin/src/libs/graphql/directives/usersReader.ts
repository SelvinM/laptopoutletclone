import { Role } from "@laptopoutlet-packages/types";
import { SchemaDirectiveVisitor, ForbiddenError } from "apollo-server-micro";
import { GraphQLField, defaultFieldResolver } from "graphql";
import { GraphQLContext } from "../../../types";

class UsersReaderDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field: GraphQLField<any, any>) {
		const { resolve = defaultFieldResolver } = field;
		field.resolve = async function (...args) {
			const [, , context] = args;
			const { user }: GraphQLContext = context;
			if (
				!user?.roles?.some(
					(role) =>
						role === Role.SuperAdmin ||
						role === Role.UsersEditor ||
						role === Role.UsersReader
				)
			)
				throw new ForbiddenError(
					"No tienes permisos para realizar esta acción"
				);

			const result = await resolve.apply(this, args);
			return result;
		};
	}
}
export default UsersReaderDirective;
