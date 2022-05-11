import {
	SchemaDirectiveVisitor,
	AuthenticationError,
} from "apollo-server-micro";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import { GraphQLField, defaultFieldResolver } from "graphql";
import { GraphQLContext } from "../../../types";
import getMessage from "../../../utils/getMessage";
import { MESSAGES } from "../../i18n/i18n-server";

class GuestDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field: GraphQLField<any, any>) {
		const { resolve = defaultFieldResolver } = field;
		field.resolve = async function (...args) {
			const [, , context] = args;
			const { token }: GraphQLContext = context;
			if (token?.id) {
				throw new AuthenticationError(
					getMessage(MESSAGES[DEFAULT_LOCALE]["mustLogOut"])
				);
			}
			const result = await resolve.apply(this, args);
			return result;
		};
	}
}
export default GuestDirective;
