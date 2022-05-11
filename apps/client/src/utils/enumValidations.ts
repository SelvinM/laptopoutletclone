import {
	ArrayFilterType,
	PriceRangeFilterType,
	ProductSort,
	BooleanFilterType,
	Theme,
} from "../types";

export function isProductSort(tested?: string): tested is ProductSort {
	return Object.values(ProductSort).some((value) => value === tested);
}
export function isArrayFilterType(tested?: string): tested is ArrayFilterType {
	return Object.values(ArrayFilterType).some((value) => value === tested);
}
export function isPriceRangeFilterType(
	tested?: string
): tested is PriceRangeFilterType {
	return Object.values(PriceRangeFilterType).some((value) => value === tested);
}
export function isBooleanFilterType(
	tested?: string
): tested is BooleanFilterType {
	return Object.values(BooleanFilterType).some((value) => value === tested);
}
export function isTheme(tested?: string): tested is Theme {
	return Object.values(Theme).some((value) => value === tested);
}
