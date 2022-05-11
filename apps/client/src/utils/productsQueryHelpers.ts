import { Locale } from "@laptopoutlet-packages/types";
import { Types } from "mongoose";
import {
	ArrayFilterType,
	ProductSort,
	PriceRangeFilterType,
	BooleanFilterType,
} from "../types";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { ProductsOptions } from "../types/index";
export const getProductsSort = (
	sortCriteria: ProductSort | null | undefined
) => {
	let $sort: any = {};
	switch (sortCriteria) {
		case ProductSort.BrandAsc:
			$sort = { "manufacturer.brand": 1 };
			break;
		case ProductSort.BrandDesc:
			$sort = { "manufacturer.brand": -1 };
			break;
		case ProductSort.NewArrivals:
			$sort = { createdAt: -1 };
			break;
		case ProductSort.PriceAsc:
			$sort = { appliedPrice: 1 };
			break;
		case ProductSort.PriceDesc:
			$sort = { appliedPrice: -1 };
			break;
		default:
			$sort = undefined;
			break;
	}
	return $sort;
};
export const getProductsMatchBeforeApplyingFilters = (
	options?: ProductsOptions | null
) => {
	let $match: any = { list: true, quantity: { $gt: 0 } };
	if (options?.categories && options.categories.length > 0)
		$match = {
			...$match,
			categories: {
				$in: options.categories,
			},
		};
	if (options?.applyDiscount !== null && options?.applyDiscount !== undefined)
		$match = {
			...$match,
			applyDiscount: options.applyDiscount,
		};
	if (options?.freeShipping !== null && options?.freeShipping !== undefined)
		$match = {
			...$match,
			freeShipping: options.freeShipping,
		};
	if (
		options?.excludeItem !== null &&
		options?.excludeItem !== undefined &&
		Types.ObjectId.isValid(options.excludeItem)
	)
		$match = {
			...$match,
			$nor: [{ _id: new Types.ObjectId(options.excludeItem) }],
		};
	if (options?.type !== null && options?.type !== undefined)
		$match = {
			...$match,
			type: { $in: options.type },
		};
	return $match;
};

type Filter = ArrayFilterType | PriceRangeFilterType | BooleanFilterType;
type ProductsMatchAfterApplyingFiltersParams = {
	options?: ProductsOptions | null;
	$match: any;
	filtersToIgnore?: Filter[];
};
export const getProductsMatchAfterApplyingFilters = ({
	options,
	$match,
	filtersToIgnore,
}: ProductsMatchAfterApplyingFiltersParams) => {
	if (options?.minPrice || options?.maxPrice) {
		if (
			options.minPrice &&
			!options.maxPrice &&
			!filtersToIgnore?.includes(PriceRangeFilterType.MinPrice)
		)
			$match = {
				...$match,
				$or: [
					{
						applyDiscount: false,
						"pricing.price": { $gte: options.minPrice },
					},
					{
						applyDiscount: true,
						"pricing.discountPrice": { $gte: options.minPrice },
					},
				],
			};

		if (
			!options.minPrice &&
			options.maxPrice &&
			!filtersToIgnore?.includes(PriceRangeFilterType.MaxPrice)
		)
			$match = {
				...$match,
				$or: [
					{
						applyDiscount: false,
						"pricing.price": { $lte: options.maxPrice },
					},
					{
						applyDiscount: true,
						"pricing.discountPrice": { $lte: options.maxPrice },
					},
				],
			};

		if (
			options.minPrice &&
			options.maxPrice &&
			!filtersToIgnore?.includes(PriceRangeFilterType.MinPrice) &&
			!filtersToIgnore?.includes(PriceRangeFilterType.MaxPrice)
		)
			$match = {
				...$match,
				$or: [
					{
						applyDiscount: false,
						"pricing.price": {
							$gte: options.minPrice,
							$lte: options.maxPrice,
						},
					},
					{
						applyDiscount: true,
						"pricing.discountPrice": {
							$gte: options.minPrice,
							$lte: options.maxPrice,
						},
					},
				],
			};
	}

	if (
		options?.applyDiscount !== null &&
		options?.applyDiscount !== undefined &&
		!filtersToIgnore?.includes(BooleanFilterType.ApplyDiscount)
	)
		$match = {
			...$match,
			applyDiscount: options.applyDiscount,
		};
	if (
		options?.freeShipping !== null &&
		options?.freeShipping !== undefined &&
		!filtersToIgnore?.includes(BooleanFilterType.FreeShipping)
	)
		$match = {
			...$match,
			freeShipping: options.freeShipping,
		};
	if (
		options?.condition !== null &&
		options?.condition !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.Condition)
	)
		$match = {
			...$match,
			condition: { $in: options.condition },
		};

	if (
		options?.brand !== null &&
		options?.brand !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.Brand)
	) {
		const brandOptions = options.brand.reduce((acc, val) => {
			if (val === "undefined") return [...acc, null, "", undefined];
			return [...acc, val];
		}, [] as (string | undefined | null)[]); //hacemos esto porque en la bd pueden existir los campos "", null, y undefined para brand y esto representa a los productos sin marca
		$match = {
			...$match,
			"manufacturer.brand": { $in: brandOptions },
		};
	}

	if (
		options?.screenSize !== null &&
		options?.screenSize !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.ScreenSize)
	)
		$match = {
			...$match,
			"details.screenSize": { $in: options.screenSize },
		};

	if (
		options?.graphicsProcessor !== null &&
		options?.graphicsProcessor !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.GraphicsProcessor)
	)
		$match = {
			...$match,
			"details.graphicsProcessor": { $in: options.graphicsProcessor },
		};

	if (
		options?.hdd !== null &&
		options?.hdd !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.Hdd)
	)
		$match = {
			...$match,
			"details.hdd": { $in: options.hdd },
		};

	if (
		options?.processor !== null &&
		options?.processor !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.Processor)
	)
		$match = {
			...$match,
			"details.processor": { $in: options.processor },
		};

	if (
		options?.ram !== null &&
		options?.ram !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.Ram)
	)
		$match = {
			...$match,
			"details.ram": { $in: options.ram },
		};

	if (
		options?.ssd !== null &&
		options?.ssd !== undefined &&
		!filtersToIgnore?.includes(ArrayFilterType.Ssd)
	)
		$match = {
			...$match,
			"details.ssd": { $in: options.ssd },
		};

	return $match;
};

type GetFinalPipeline = ({
	pipeline,
	locale,
	$sort,
	options,
}: {
	pipeline: any[];
	locale: Locale;
	$sort: any;
	options: any;
}) => any[];

export const getFinalPipeline: GetFinalPipeline = ({
	pipeline,
	locale,
	$sort,
	options,
}) => {
	pipeline = [
		...pipeline,
		{
			$addFields: {
				id: {
					$toString: "$_id",
				},
				"listing.longTitle": {
					$cond: {
						if: { $ifNull: [`$listing.longTitle.${locale}`, false] },
						then: `$listing.longTitle.${locale}`,
						else: "$listing.longTitle.es",
					},
				},
				"listing.shortTitle": {
					$cond: {
						if: { $ifNull: [`$listing.shortTitle.${locale}`, false] },
						then: `$listing.shortTitle.${locale}`,
						else: "$listing.shortTitle.es",
					},
				},
				"listing.description": {
					$cond: {
						if: { $ifNull: [`$listing.description.${locale}`, false] },
						then: `$listing.description.${locale}`,
						else: "$listing.description.es",
					},
				},
				appliedPrice: {
					$switch: {
						branches: [
							{
								case: {
									$and: [
										{ $eq: ["$applyDiscount", true] },
										{ $eq: ["$freeShipping", true] },
									],
								},
								then: "$pricing.discountPrice",
							},
							{
								case: {
									$and: [
										{ $eq: ["$applyDiscount", true] },
										{ $eq: ["$freeShipping", false] },
									],
								},
								then: { $add: ["$pricing.discountPrice", "$pricing.shipping"] },
							},
						],
						default: { $add: ["$pricing.price", "$pricing.shipping"] },
					},
				},
				categories: null,
			},
		},
	];
	if ($sort) {
		pipeline = [
			...pipeline,
			{
				$sort,
			},
			{
				$skip: options?.skip || 0,
			},
			{
				$limit: options?.limit || DEFAULT_PAGE_SIZE,
			},
		];
	} else {
		pipeline = [
			...pipeline,
			{
				$skip: options?.skip || 0,
			},
			{
				$limit: options?.limit || DEFAULT_PAGE_SIZE,
			},
		];
	}
	return pipeline;
};
