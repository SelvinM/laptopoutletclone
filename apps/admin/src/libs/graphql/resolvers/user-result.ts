import { UserResultResolvers } from "graphql-let/__generated__/__types__";

const UserResult: UserResultResolvers = {
	__resolveType({ id }: any) {
		if (id) {
			return "User";
		} else {
			return "GeneralError";
		}
	},
};

export default UserResult;
