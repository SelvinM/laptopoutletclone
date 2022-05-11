import { TableFilter } from "../types";

export const tableFilterToBoolean = (filter: TableFilter) => {
	const parsedFilter = Array.isArray(filter)
		? filter.length === 2
			? undefined
			: filter[0]
		: undefined;
	switch (parsedFilter?.toString().toLowerCase().trim()) {
		case "true":
		case "yes":
		case "1":
			return true;
		case "false":
		case "no":
		case "0":
		case null:
			return false;
		default:
			return undefined;
	}
};
