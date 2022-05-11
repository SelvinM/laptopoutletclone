import { WarehouseResultResolvers } from "graphql-let/__generated__/__types__";

const WarehouseResult: WarehouseResultResolvers = {
	__resolveType({ id }: any) {
		if (id) {
			return "Warehouse";
		} else {
			return "GeneralError";
		}
	},
};

export default WarehouseResult;
