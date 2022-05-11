import { InMemoryCacheConfig } from "@apollo/client";
const fragmentTypes = {
	CartResult: ["Cart", "GeneralError", "ProductNotAvailableError"],
	Product: ["UndefinedProduct", "ComputerProduct"],
	UserResult: ["User", "GeneralError"],
	OrderResult: ["Order", "GeneralError"],
	PlaceOrderResult: ["PlaceOrderResponse", "GeneralError"],
	PaymentCardsResult: ["PaymentCards", "GeneralError"],
};
const cacheConfig: InMemoryCacheConfig = {
	possibleTypes: fragmentTypes,
	typePolicies: {
		Cart: {
			fields: {
				cartItems: {
					merge: false,
				},
			},
		},
		User: {
			fields: {
				addresses: {
					merge: false,
				},
			},
		},
		Query: {
			fields: {
				"getProduct.listing.description": {
					merge: false,
				},
			},
		},
	},
};

export default cacheConfig;
