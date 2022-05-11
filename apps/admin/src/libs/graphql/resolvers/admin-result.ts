import { AdminResultResolvers } from "graphql-let/__generated__/__types__";

const AdminResult: AdminResultResolvers = {
	__resolveType({ id }: any) {
		if (id) {
			return "Admin";
		} else {
			return "GeneralError";
		}
	},
};

export default AdminResult;
