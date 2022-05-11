import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import schemaDirectives from "./directives";
import { makeExecutableSchema } from "apollo-server-micro";
const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
	schemaDirectives: schemaDirectives as any,
});

export default schema;
``;
