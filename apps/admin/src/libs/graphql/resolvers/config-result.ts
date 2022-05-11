import { ConfigResultResolvers } from "graphql-let/__generated__/__types__";

const ConfigResult: ConfigResultResolvers = {
	__resolveType({ id }: any) {
		if (id) {
			return "Config";
		} else {
			return "GeneralError";
		}
	},
};

export default ConfigResult;
