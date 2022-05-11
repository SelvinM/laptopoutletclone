import { CategoryResultResolvers } from "graphql-let/__generated__/__types__";

const CategoryResult: CategoryResultResolvers = {
	__resolveType({ id }: any) {
		if (id) {
			return "Category";
		} else {
			return "GeneralError";
		}
	},
};

export default CategoryResult;
