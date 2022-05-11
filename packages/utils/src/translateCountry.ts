import { COUNTRIES } from "@laptopoutlet-packages/constants";
import { Locale } from "@laptopoutlet-packages/types";
type Params = {
	code?: string;
	locale: Locale;
};
export const translateCountry = ({ code, locale }: Params) => {
	const label = COUNTRIES[locale].find(
		(country) => country.code === code
	)?.name;
	return label || undefined;
};
