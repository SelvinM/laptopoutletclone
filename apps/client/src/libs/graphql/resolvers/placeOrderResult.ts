import { PlaceOrderResultResolvers } from "graphql-let/__generated__/__types__";
const PlaceOrderResult: PlaceOrderResultResolvers = {
	__resolveType({ message }: any) {
		if (message) return "GeneralError";
		return "OrderResult";
	},
};
export default PlaceOrderResult;
