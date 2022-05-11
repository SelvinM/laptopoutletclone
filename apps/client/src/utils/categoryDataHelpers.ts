import { CategoryDocument, ICategory } from "@laptopoutlet-packages/models";
import { CategorySummary } from "../types";
import { Crumb } from "../types";

export const unflattenCategories = (dataset: CategoryDocument[]) => {
	let hashTable = Object.create(null);
	dataset.forEach(
		(item) =>
			(hashTable[item.id] = {
				...item.toJSON(),
				children: item.hasChildren ? [] : undefined,
			})
	);
	let dataTree: CategoryDocument[] = [];
	dataset.forEach((item) => {
		if (item.parent) hashTable[item.parent].children.push(hashTable[item.id]);
		else dataTree.push(hashTable[item.id]);
	});
	return dataTree;
};

type GetCategoryAncestryParams = {
	categories?: ICategory[] | undefined;
	id?: string;
	allProductsTitle: string;
	allProductsDescription: string;
};
type GetCategoryAncestry = (
	...args: GetCategoryAncestryParams[]
) => CategorySummary[] | undefined;

export const getCategoryAncestry: GetCategoryAncestry = ({
	allProductsTitle,
	allProductsDescription,
	id,
	categories,
}) => {
	if (!id) return;
	if (id === "all")
		return [
			{
				id: id,
				description: allProductsDescription,
				name: allProductsTitle,
			},
		];
	if (categories) {
		if (typeof id === "string") {
			for (let i = 0; i < categories.length; i++) {
				if (categories[i].id === id)
					return [
						{
							name: categories[i].name,
							id,
							description: categories[i].description,
						},
					];
				let ancestry: CategorySummary[] | undefined = getCategoryAncestry({
					categories: categories[i].children as ICategory[] | undefined,
					id,
					allProductsTitle,
					allProductsDescription,
				});
				if (ancestry && ancestry[0].id !== "all") {
					ancestry?.unshift({
						name: categories[i].name,
						id: categories[i].id,
						description: categories[i].description,
					});
					return ancestry;
				}
			}
		}
	}
};

export const getCategoryCrumbs = (
	initialCrumbs: ICategory[] | null | undefined
) => {
	let crumbs: Crumb[] = [];
	initialCrumbs?.forEach((crumb, index) => {
		if (index < initialCrumbs.length - 1) {
			crumbs.push({
				name: crumb.name,
				href: "/products/[categoryid]",
				as: `/products/${crumb.id}`,
			});
		} else {
			crumbs.push({
				name: crumb.name,
				href: "/products/[categoryid]",
				as: `/products/${crumb.id}`,
			});
		}
	});
	return crumbs;
};

export const sortCategories = (categories?: ICategory[]) => {
	if (!categories) {
		return [];
	}
	let result: ICategory[] = [];
	for (let i = 0; i < categories.length; i++) {
		if (
			result.length === 0 ||
			result[result.length - 1].id === categories[i].parent
		) {
			result.push(categories[i]);
		}
		if (result[result.length - 1].parent === categories[i].id) {
			result.splice(result.length - 2, 0, categories[i]);
		}
	}
	return result;
};
