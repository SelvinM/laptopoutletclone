import { isLocale } from "@laptopoutlet-packages/utils";
import cookie from "cookie";
import { Locale } from "@laptopoutlet-packages/types";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
export function getInitialLocale(): Locale {
	const localSetting = cookie.parse(document.cookie).locale;
	if (localSetting && isLocale(localSetting)) return localSetting;
	return DEFAULT_LOCALE;
}
