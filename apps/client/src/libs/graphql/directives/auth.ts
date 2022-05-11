import {
	SchemaDirectiveVisitor,
	AuthenticationError,
} from "apollo-server-micro";
import { GraphQLField, defaultFieldResolver } from "graphql";
import { GraphQLContext } from "../../../types";
import { MESSAGES } from "../../i18n/i18n-server";
import getMessage from "../../../utils/getMessage";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";

class AuthDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field: GraphQLField<any, any>) {
		const { resolve = defaultFieldResolver } = field;
		field.resolve = async function (...args) {
			const [, , context] = args;
			const { token }: GraphQLContext = context;
			if (!token?.id) {
				throw new AuthenticationError(
					getMessage(MESSAGES[DEFAULT_LOCALE]["mustLogIn"])
				);
			}
			const result = await resolve.apply(this, args);

			return result;
		};
	}
}
export default AuthDirective;
