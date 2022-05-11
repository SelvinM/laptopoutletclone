import { DistinctProductDetailsResolvers } from "graphql-let/__generated__/__types__";

const DistinctProductDetails: DistinctProductDetailsResolvers = {
	__resolveType(params) {
		if (
			params.graphicsProcessor &&
			params.hdd &&
			params.screenSize &&
			params.os &&
			params.ram &&
			params.model
		) {
			return "DistinctComputerProductDetails";
		} else {
			return "DistinctComputerProductDetails";
		}
	},
};

export default DistinctProductDetails;
