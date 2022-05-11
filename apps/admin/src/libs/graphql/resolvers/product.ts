import { ProductResolvers } from "graphql-let/__generated__/__types__";

const Product: ProductResolvers = {
	__resolveType({ type }) {
		return type;
	},
};

export default Product;
