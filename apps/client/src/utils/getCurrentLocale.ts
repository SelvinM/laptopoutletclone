import { Locale } from "@laptopoutlet-packages/types";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import { isLocale } from "@laptopoutlet-packages/utils";
type GetCurrentLocale = (locale: string | undefined) => Locale;
const getCurrentLocale: GetCurrentLocale = (locale) =>
	isLocale(locale) ? locale : DEFAULT_LOCALE;
export default getCurrentLocale;
