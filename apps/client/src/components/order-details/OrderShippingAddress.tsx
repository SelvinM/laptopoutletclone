import { Locale } from "@laptopoutlet-packages/types";
import React from "react";
import { translateCountry } from "@laptopoutlet-packages/utils";

interface Props {
	firstname: string;
	lastname: string;
	addressLine1: string;
	addressLine2?: string | null;
	country: string;
	city: string;
	province: string;
	zipcode: string;
	currentLocale: Locale;
}

const OrderShippingAddress = ({
	addressLine1,
	city,
	country,
	firstname,
	lastname,
	province,
	zipcode,
	addressLine2,
	currentLocale,
}: Props) => {
	return (
		<div className="p-4 sm:px-8 sm:py-6 text-sm">
			<span className="font-medium block">{`${firstname} ${lastname}`}</span>
			<p>{addressLine1}</p>
			<span className="block">{addressLine2}</span>
			<span className="block">{`${city}, ${province}, ${zipcode}`}</span>
			<span className="block">
				{translateCountry({
					code: country,
					locale: currentLocale,
				}) || country}
			</span>
		</div>
	);
};

export default OrderShippingAddress;
