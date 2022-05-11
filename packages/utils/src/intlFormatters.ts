import { Currency, Locale } from "@laptopoutlet-packages/types";
export const getPriceFormatter = (locale: Locale, ctxCurrency: Currency) => {
	const priceFormatter = new Intl.NumberFormat(
		[`${locale}-HN`, locale, Locale.En],
		{
			style: "currency",
			currency: ctxCurrency,
		}
	);
	return priceFormatter;
};
type GetDateFormatterParams = {
	locale: Locale;
	options?: Intl.DateTimeFormatOptions;
};
export const getDateFormatter = ({
	locale,
	options,
}: GetDateFormatterParams) => {
	const dateFormatter = Intl.DateTimeFormat([locale, Locale.En], {
		year: "numeric",
		month: "long",
		day: "numeric",
		...options,
	});
	return dateFormatter;
};
