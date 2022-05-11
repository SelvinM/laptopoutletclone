import React, { useContext } from "react";
import { useRouter } from "next/router";
import { FormattedMessage, useIntl } from "react-intl";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import queryString from "query-string";
import {
	isProductCondition,
	getParamAsString,
} from "@laptopoutlet-packages/utils";
import { ArrayFilterType, PriceRangeFilterType } from "../../types";
import { BiX } from "react-icons/bi";
import getCurrentLocale from "../../utils/getCurrentLocale";
import {
	isPriceRangeFilterType,
	isBooleanFilterType,
	isArrayFilterType,
} from "../../utils/enumValidations";

interface TagProps {
	onClose: () => void;
	children?: JSX.Element | string;
}

const Tag = ({ onClose, children }: TagProps) => (
	<button
		className="dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-600 p-1 px-2 btn bg-white hover:bg-gray-100 active:bg-gray-300 border focus:border-gray-500 text-xs mr-1"
		onClick={onClose}
	>
		{children}
		<span className="ml-1 text-lg">
			<BiX />
		</span>
	</button>
);

type Value = string | undefined;

const FilterTags = () => {
	const router = useRouter();
	const currentLocale = getCurrentLocale(router.locale);
	const { currency } = useContext(CurrencyContext);
	const { formatMessage } = useIntl();
	const priceFormatter = new Intl.NumberFormat(`${currentLocale}-HN`, {
		style: "currency",
		currency,
	});
	let tags: JSX.Element[] = [];

	let index = 0;

	let minPrice =
		Number(getParamAsString(router.query[PriceRangeFilterType.MinPrice])) ||
		false;
	let maxPrice =
		Number(getParamAsString(router.query[PriceRangeFilterType.MaxPrice])) ||
		false;

	if (minPrice && maxPrice) {
		let priceRange = [minPrice, maxPrice];
		tags.push(
			<Tag
				key={`${index} pricetag`}
				onClose={() => {
					removeFilter(PriceRangeFilterType.MinPrice);
				}}
			>
				<FormattedMessage
					id="filters.price.tag"
					values={{
						minPrice: priceFormatter.format(priceRange[0]),
						maxPrice: priceFormatter.format(priceRange[1]),
					}}
				/>
			</Tag>
		);
	}

	if (minPrice && !maxPrice) {
		tags.push(
			<Tag
				key={`${index} pricetag`}
				onClose={() => {
					removeFilter(PriceRangeFilterType.MinPrice);
				}}
			>
				<FormattedMessage
					id="filters.price.moreThan"
					values={{
						minPrice: priceFormatter.format(minPrice),
					}}
				/>
			</Tag>
		);
	}

	if (!minPrice && maxPrice) {
		tags.push(
			<Tag
				key={`${index} pricetag`}
				onClose={() => {
					removeFilter(PriceRangeFilterType.MaxPrice);
				}}
			>
				<FormattedMessage
					id="filters.price.lessThan"
					values={{
						maxPrice: priceFormatter.format(maxPrice),
					}}
				/>
			</Tag>
		);
	}

	const categoryid = getParamAsString(router.query.categoryid);
	for (const prop in router.query) {
		index++;
		if (
			(isArrayFilterType(prop) || isBooleanFilterType(prop)) &&
			!isPriceRangeFilterType(prop)
		) {
			if (Array.isArray(router.query[prop]) && !isBooleanFilterType(prop)) {
				let values: Value[] = router.query[prop] as string[];
				const unmodifiedValues = values;
				if (prop === ArrayFilterType.Condition)
					values = values.map((value) =>
						isProductCondition(value || "")
							? formatMessage({ id: `condition.${value}` })
							: undefined
					);
				if (prop === ArrayFilterType.Brand)
					values = values.map((value) =>
						value === "undefined"
							? formatMessage({ id: "brand.generic" })
							: value
					);
				values.map((value, subindex) => {
					value &&
						tags.push(
							<Tag
								key={`${index} ${subindex} ${unmodifiedValues[subindex]}`}
								onClose={() => {
									removeFilter(
										prop,
										getParamAsString(unmodifiedValues[subindex])
									);
								}}
							>
								{value}
							</Tag>
						);
				});
			} else {
				let value: Value = getParamAsString(router.query[prop]);
				if (prop === ArrayFilterType.Condition)
					isProductCondition(value)
						? (value = formatMessage({ id: `condition.${value}` }))
						: (value = undefined);

				if (isBooleanFilterType(prop))
					value =
						value === "true"
							? formatMessage({ id: `filters.${prop}` })
							: undefined;
				if (prop === ArrayFilterType.Brand)
					value =
						value === "undefined"
							? formatMessage({ id: "brand.generic" })
							: value;

				if (!!value)
					tags.push(
						<Tag
							key={`${index} ${router.query[prop]}`}
							onClose={() => removeFilter(prop)}
						>
							{value}
						</Tag>
					);
			}
		}
	}

	const removeFilter = (key: string, value?: string) => {
		let replacement;
		if (value) {
			const values = router.query[key] as string[];
			const index = values.indexOf(value);
			replacement = values;
			delete replacement[index];
		}
		const formattedValues = isPriceRangeFilterType(key)
			? queryString.stringify(
					{
						...router.query,
						minPrice: undefined,
						maxPrice: undefined,
						categoryid: undefined,
						page: undefined,
					},
					{}
			  )
			: queryString.stringify(
					{
						...router.query,
						categoryid: undefined,
						page: undefined,
						[key]: replacement,
					},
					{}
			  );

		router.push(
			{ pathname: "/products/[categoryid]", search: formattedValues },
			{
				pathname: `/products/${categoryid}`,
				search: formattedValues,
			},
			{ shallow: true }
		);
	};

	const clearAllFilters = () => {
		const sort =
			router.query.sort && router.query.sort !== ""
				? "?sort=" + router.query.sort
				: undefined;
		router.push(
			{
				pathname: `/products/[categoryid]`,
				search: sort,
			},
			{
				pathname: `/products/${categoryid}`,
				search: sort,
			},
			{ shallow: true }
		);

		!sort && delete router.query.sort;
	};
	return (
		<div className="flex flex-wrap items-center justify-between">
			<div className="flex flex-auto flex-wrap items-center space-y-1">
				<span className="text-sm font-medium mr-2 mt-1">
					<FormattedMessage id="filters" />:
				</span>
				{tags}
			</div>

			<a
				onClick={clearAllFilters}
				className="text-xs cursor-pointer hover:text-secondary-500 dark:hover:text-secondary-200 my-2"
			>
				<FormattedMessage id="filters.clearAll" />
			</a>
		</div>
	);
};

export default FilterTags;
