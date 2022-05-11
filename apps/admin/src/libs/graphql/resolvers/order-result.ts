import { OrderResultResolvers } from "graphql-let/__generated__/__types__";

const OrderResult: OrderResultResolvers = {
	__resolveType({ id }: any) {
		if (id) {
			return "Order";
		} else {
			return "GeneralError";
		}
	},
};

export default OrderResult;
