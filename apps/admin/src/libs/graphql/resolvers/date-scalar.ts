import { GraphQLScalarType, Kind } from "graphql";

const DateScalar: GraphQLScalarType = new GraphQLScalarType({
  name: "DateScalar",
  description: "Date custom scalar type",
  parseValue(value: Date) {
    return value;
  },
  serialize(value: Date) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return Date.parse(ast.value);
    }
    return null;
  },
});

export default DateScalar;
