import {
	Country,
	Currency,
	Locale,
	ProductCondition,
	CardType,
	ShipmentStatus,
	CardBrand,
} from "@laptopoutlet-packages/types";
export function isCurrency(tested?: string): tested is Currency {
	return Object.values(Currency).some((value) => value === tested);
}
export function isCardType(tested?: string): tested is CardType {
	return Object.values(CardType).some((value) => value === tested);
}
export function isCardBrand(tested?: string): tested is CardBrand {
	return Object.values(CardBrand).some((value) => value === tested);
}
export function isLocale(tested?: string | null): tested is Locale {
	return Object.values(Locale).some((value) => value === tested);
}
export function isProductCondition(
	tested?: string
): tested is ProductCondition {
	return Object.values(ProductCondition).some((value) => value === tested);
}
export function isCountryCode(tested?: string): tested is Country {
	return Object.values(Country).some((value) => value === tested);
}
export function isShipmentStatus(tested?: string): tested is ShipmentStatus {
	return Object.values(ShipmentStatus).some((value) => value === tested);
}
