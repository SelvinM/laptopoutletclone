import { ColumnFilterItem } from "antd/lib/table/interface";
import { TreeNode } from "../types";
import {
	CategoryFullTranslationsDocument,
	ICategoryFullTranslations,
} from "@laptopoutlet-packages/models";

export const getCategoryAncestorsId = (
	categories: ICategoryFullTranslations[] | undefined,
	id: string
) => {
	if (categories) {
		for (let i = 0; i < categories.length; i++) {
			if (categories[i].id === id) return [id];
			if (!!categories[i].children) {
				let ancestry: string[] = getCategoryAncestorsId(
					categories[i].children as ICategoryFullTranslations[],
					id
				);
				ancestry.unshift(categories[i].id);
				if (ancestry[ancestry.length - 1] === id) return ancestry;
			}
		}
	}
	return [];
};

export const sortCategories = (categories?: ICategoryFullTranslations[]) => {
	if (!categories) {
		return [];
	}
	let result: ICategoryFullTranslations[] = [];
	for (let i = 0; i < categories.length; i++) {
		if (
			result.length === 0 ||
			result[result.length - 1].id === categories[i].parent
		) {
			result.push(categories[i]);
			continue;
		}
		if (result[result.length - 1].parent === categories[i].id) {
			result.splice(result.length - 2, 0, categories[i]);
			continue;
		}
		result.push(categories[i]);
	}
	return result;
};

export const transformCategoriesForFilters = (
	categories: ICategoryFullTranslations[] | undefined
) => {
	if (!categories) {
		return;
	}
	return categories.map((category) => {
		if (category.hasChildren) {
			const treeData: ColumnFilterItem = {
				text: category.name.es,
				value: category.id,
				children: transformCategoriesForFilters(
					category.children as ICategoryFullTranslations[]
				),
			};
			return treeData;
		} else {
			const treeData: ColumnFilterItem = {
				text: category.name.es,
				value: category.id,
			};
			return treeData;
		}
	});
};

export const transformCategoriesForTreeSelect = (
	categories: ICategoryFullTranslations[] | undefined
) => {
	if (!categories) {
		return;
	}
	return categories.map((category) => {
		if (category.hasChildren) {
			const treeData: TreeNode = {
				title: category.name.es,
				value: category.id,
				children: transformCategoriesForTreeSelect(
					category.children as ICategoryFullTranslations[]
				),
			};
			return treeData;
		} else {
			const treeData: TreeNode = {
				title: category.name.es,
				value: category.id,
			};
			return treeData;
		}
	});
};

export const unflattenCategories = (
	dataset: CategoryFullTranslationsDocument[]
) => {
	let hashTable = Object.create(null);
	dataset.forEach(
		(item) =>
			(hashTable[item.id] = {
				...item.toJSON(),
				children: item.hasChildren ? [] : undefined,
			})
	);
	let dataTree: CategoryFullTranslationsDocument[] = [];
	dataset.forEach((item) => {
		if (item.parent) hashTable[item.parent].children.push(hashTable[item.id]);
		else dataTree.push(hashTable[item.id]);
	});
	return dataTree;
};
