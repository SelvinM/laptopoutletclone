import React from "react";
import queryString from "query-string";
import { useRouter } from "next/router";
interface Props {
	name: string;
	categoryid?: string;
	selectedValues: string[];
	values: string[];
	labels: string[];
}

const ProductFiltersCheckboxGroup = ({
	name,
	categoryid = "all",
	selectedValues,
	values,
	labels,
}: Props) => {
	const router = useRouter();
	const handleCheckboxChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLInputElement>) => {
		const newValues = selectedValues.includes(value)
			? selectedValues.filter((item) => item !== value)
			: [...selectedValues, value];
		const formattedValues = queryString.stringify(
			{
				...router.query,
				categoryid: undefined,
				page: undefined,
				[name]: newValues,
			},
			{}
		);
		router.push(
			{ pathname: "/products/[categoryid]", query: formattedValues },
			`/products/${categoryid}?${formattedValues}`,
			{ shallow: true }
		);
	};
	return (
		<div className="space-y-2">
			{values.map((value, index) => (
				<div key={index} className="leading-none">
					<label className="text-xs sm:text-sm inline-flex cursor-pointer items-center ">
						<input
							type="checkbox"
							value={value}
							checked={selectedValues.includes(value)}
							onChange={handleCheckboxChange}
							className="dark:border-gray-600 dark:bg-gray-800 dark:checked:ring-secondary-200 dark:focus:outline-white appearance-none h-3 w-3 border border-gray-600  rounded-sm bg-gray-100 cursor-pointer focus:outline-black checked:ring-2 checked:ring-gray-200 checked:ring-inset checked:bg-primary-500"
						/>
						<span className="ml-2 leading-none block ">{labels[index]}</span>
					</label>
				</div>
			))}
		</div>
	);
};

export default ProductFiltersCheckboxGroup;
