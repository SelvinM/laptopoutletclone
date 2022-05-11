import { PaymentCardsResultResolvers } from "graphql-let/__generated__/__types__";
const PaymentCardsResult: PaymentCardsResultResolvers = {
	__resolveType({ message }: any) {
		if (message) return "GeneralError";
		return "PaymentCards";
	},
};
export default PaymentCardsResult;
