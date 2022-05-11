import { useRouter } from "next/router";
// import { ParsedUrlQuery } from "querystring";
import queryString from "query-string";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Facet, ProductFacet } from "../../types";
import { useForm } from "react-hook-form";
import {
	getParamAsString,
	getParamAsArray,
} from "@laptopoutlet-packages/utils";
import { useEffect } from "react";
import { AiOutlineLine, AiOutlineRight } from "react-icons/ai";
import ProductFiltersCheckboxGroup from "./ProductFiltersCheckboxGroup";
import FacetsGroupSkeleton from "../skeletons/FacetsGroupSkeleton";
import { ArrayFilterType } from "../../types";
import { isArrayFilterType } from "../../utils/enumValidations";
import ProductFiltersSwitches from "./ProductFiltersSwitches";

type FormValues = {
	minPrice?: number;
	maxPrice?: number;
};
interface Props {
	facets?: ProductFacet | null;
	loading?: boolean;
}

const ProductFilters = ({ facets, loading }: Props) => {
	const { formatMessage } = useIntl();
	const router = useRouter();
	const { handleSubmit, setValue, register } = useForm<FormValues>({
		defaultValues: { maxPrice: undefined, minPrice: undefined },
	});
	const categoryid = getParamAsString(router.query.categoryid);
	useEffect(() => {
		const minPrice = Number(getParamAsString(router.query.minPrice));
		const maxPrice = Number(getParamAsString(router.query.maxPrice));
		setValue("minPrice", minPrice || undefined);
		setValue("maxPrice", maxPrice || undefined);
	}, [router.query.minPrice, router.query.maxPrice]);
	const submitPriceRange = (values: Record<string, any>) => {
		let minPrice = Number(values.minPrice) || undefined;
		let maxPrice = Number(values.maxPrice) || undefined;
		if (minPrice && maxPrice && minPrice > maxPrice) {
			const oldMinPrice = minPrice;
			minPrice = maxPrice;
			maxPrice = oldMinPrice;
		}
		const formattedValues = queryString.stringify(
			{
				...router.query,
				categoryid: undefined,
				minPrice,
				maxPrice,
				page: undefined,
			},
			{}
		);
		router.push(
			{ pathname: "/products/[categoryid]", query: formattedValues },
			`/products/${categoryid}?${formattedValues}`,
			{ shallow: true }
		);
	};
	let facetsUI: JSX.Element[] = [];
	for (const key in facets) {
		if (
			facets.hasOwnProperty(key) &&
			key !== "__typename" &&
			isArrayFilterType(key)
		) {
			const selectedValues = getParamAsArray(router.query[key]) || [];
			let filteredValues: Facet[] = [];
			if (
				key !== ArrayFilterType.Brand ||
				(key === ArrayFilterType.Brand &&
					!facets?.["brand"].some((val) => !val.title))
			) {
				filteredValues = facets[key].filter((value) => !!value.title); //si el facet no es de brand o si brand no tiene titles falsy filtramos todos los que tengan valores falsy.
			} else {
				//aquí remplazamos el convetimos los title que son falsy a "undefined". "undefined" es lo que indica que queremos filtrar los productos que no tienen marca
				let undefinedIndex: number | undefined;
				for (let i = 0; i < facets[key].length; i++) {
					const value = facets[key][i];
					if (!!value.title) filteredValues.push(value);
					if (
						!filteredValues.some((val) => val.title === "undefined") &&
						!undefinedIndex
					) {
						undefinedIndex = i;
						filteredValues.push({ count: value.count, title: "undefined" });
					}
					if (undefinedIndex && filteredValues[undefinedIndex])
						filteredValues[undefinedIndex].count =
							filteredValues[undefinedIndex].count + value.count;
				}
			}
			let titles: string[] = [];
			titles = filteredValues.map((value) => value.title as string).sort(); //Ordenamos los titles
			const values = titles; //guardamos los titles antes de modificarlos porque son los valores de los filtros
			if (key === ArrayFilterType.Condition)
				titles = titles.map(
					(title) => formatMessage({ id: `condition.${title}` }) //cambiamos los values de las condiciones a sus traducciones
				);
			if (key === ArrayFilterType.Brand)
				titles = titles.map((title) =>
					title === "undefined" ? formatMessage({ id: "brand.generic" }) : title
				); //cambiamos el value de "undefined" a su traducción
			if (titles.length >= 1) {
				const label =
					key === ArrayFilterType.Brand || key === ArrayFilterType.Condition
						? key
						: `productDetails.${key}`; //Traducimos el label
				facetsUI.push(
					<div key={key} className="pt-6">
						<h4 className="text-sm font-medium uppercase mb-3 ">
							<FormattedMessage id={label} />
						</h4>
						<ProductFiltersCheckboxGroup
							name={key}
							selectedValues={selectedValues}
							labels={titles}
							values={values}
							categoryid={categoryid}
						/>
					</div>
				);
			}
		}
	}

	return (
		<div className="p-6 divide-y space-y-6 dark:divide-gray-600">
			<div>
				<h4 className="font-medium uppercase mb-3 text-sm">
					<FormattedMessage id="filters.price" />
				</h4>
				<form
					onSubmit={handleSubmit(submitPriceRange)}
					className="flex items-center"
				>
					<input
						className="input px-2 py-1 focus:outline-none text-sm"
						{...register("minPrice")}
						min={0}
						type="number"
						name="minPrice"
						placeholder={formatMessage({
							id: "filters.price.minPlaceholder",
						})}
					/>
					<span className="mx-1 text-sm">
						<AiOutlineLine />
					</span>
					<input
						className="input px-2 py-1 focus:outline-none text-sm"
						{...register("maxPrice")}
						min={0}
						type="number"
						name="maxPrice"
						placeholder={formatMessage({
							id: "filters.price.maxPlaceholder",
						})}
					/>

					<button className="btn btn-default p-1 ml-1">
						<AiOutlineRight className="text-lg" />
					</button>
				</form>
			</div>
			<ProductFiltersSwitches facets={facets} />
			{loading ? (
				<>
					<FacetsGroupSkeleton />
					<FacetsGroupSkeleton />
					<FacetsGroupSkeleton />
					<FacetsGroupSkeleton />
				</>
			) : (
				<>{facetsUI}</>
			)}
			<style jsx>
				{`
					input::-webkit-outer-spin-button,
					input::-webkit-inner-spin-button {
						-webkit-appearance: none;
						margin: 0;
					}
					/* Firefox */
					input[type="number"] {
						-moz-appearance: textfield;
					}
				`}
			</style>
		</div>
	);
};

export default ProductFilters;
