import React from "react";
import { Switch } from "@headlessui/react";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import queryString from "query-string";
import { BooleanFilterType, ProductFacet } from "../../types";

interface Props {
	facets?: ProductFacet | null;
}

const ProductFiltersSwitches = ({ facets }: Props) => {
	const router = useRouter();
	const categoryid = getParamAsString(router.query.categoryid);
	let switchesUI: JSX.Element[] = [];
	Object.values(BooleanFilterType).forEach((key) => {
		const value = getParamAsString(router.query[key]) === "true";
		const disabled =
			!facets?.[key].some(
				(facet) => facet.title === "true" && facet.count > 0
			) && !value;
		switchesUI.push(
			<Switch.Group key={key}>
				<div className="flex items-center justify-end space-x-4">
					<Switch.Label
						className={`text-sm ${
							disabled
								? "cursor-not-allowed text-gray-700 dark:text-gray-400"
								: "cursor-pointer"
						}`}
					>
						<FormattedMessage id={`filters.${key}`} />
					</Switch.Label>
					<Switch
						checked={value}
						disabled={disabled}
						onChange={(newValue) => {
							const formattedValues = queryString.stringify(
								{
									...router.query,
									categoryid: undefined,
									page: undefined,
									[key]: newValue || undefined,
								},
								{}
							);
							router.push(
								{
									pathname: "/products/[categoryid]",
									query: formattedValues,
								},
								`/products/${categoryid}?${formattedValues}`,
								{ shallow: true }
							);
						}}
						className={`border relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:ring-1 dark:focus:ring-secondary-200 dark:ring-offset-gray-800 ring-offset-2 dark:ring-opacity-30 focus:ring-primary-500 focus:outline-none border-transparent ${
							disabled ? "dark:bg-opacity-0 cursor-not-allowed" : ""
						} ${
							value
								? "bg-primary-500 dark:bg-secondary-200 "
								: " bg-gray-200 dark:bg-gray-800 dark:border-gray-600"
						} `}
					>
						<span
							className={`inline-block w-4 h-4 transform rounded-full transition-transform ${
								disabled
									? "dark:bg-opacity-30 bg-opacity-30 cursor-not-allowed"
									: ""
							} ${
								value
									? "translate-x-6 bg-gray-300 dark:bg-primary-500"
									: "translate-x-1 bg-primary-500 dark:bg-gray-500"
							}`}
						/>
					</Switch>
				</div>
			</Switch.Group>
		);
	});

	return <div className="pt-6 space-y-3">{switchesUI}</div>;
};

export default ProductFiltersSwitches;
