import { getParamAsString } from "@laptopoutlet-packages/utils";
import { DEFAULT_PAGE_SIZE } from "../constants";

export const getSkip = (page: string[] | string | undefined) => {
	const skip = (Number(getParamAsString(page)) - 1) * DEFAULT_PAGE_SIZE;
	return skip > 0 ? skip : 0;
};
