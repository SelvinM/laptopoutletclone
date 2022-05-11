import {
  SchemaDirectiveVisitor,
  AuthenticationError,
} from "apollo-server-micro";
import { GraphQLField, defaultFieldResolver } from "graphql";
import { GraphQLContext } from "../../../types";

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const [, , context] = args;
      const { user }: GraphQLContext = context;
      if (!user) {
        throw new AuthenticationError(
          "Debes iniciar sesión para realizar esta acción"
        );
      }
      const result = await resolve.apply(this, args);

      return result;
    };
  }
}
export default AuthDirective;
