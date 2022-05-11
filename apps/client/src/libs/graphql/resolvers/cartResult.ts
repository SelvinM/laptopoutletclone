import { CartResultResolvers } from "graphql-let/__generated__/__types__";
const CartResult: CartResultResolvers = {
	__resolveType({ message, reason }: any) {
		if (message && reason) return "ProductNotAvailableError";
		if (message) return "GeneralError";
		return "Cart";
	},
};
export default CartResult;
