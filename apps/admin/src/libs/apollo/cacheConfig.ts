import { InMemoryCacheConfig } from "@apollo/client";
const GeneralError = "GeneralError";
const fragmentTypes = {
	AdminResult: ["Admin", GeneralError],
	UserResult: ["User", GeneralError],
	CategoryResult: ["Category", GeneralError],
	OrderResult: ["Order", GeneralError],
	WarehouseResult: ["Warehouse", GeneralError],
	ConfigResult: ["Config", GeneralError],
	Product: ["UndefinedProduct", "ComputerProduct"],
	DistinctProductDetails: ["DistinctComputerProductDetails"],
};

const cacheConfig: InMemoryCacheConfig = {
	possibleTypes: fragmentTypes,
	typePolicies: {
		Query: {
			fields: {
				getCategories: {
					merge: false,
				},
			},
		},
	},
};

export default cacheConfig;
