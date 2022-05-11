import React from "react";
import { Space, Tag } from "antd";
import { sortCategories } from "../../utils/categoryDataHelpers";
import { ICategoryFullTranslations } from "@laptopoutlet-packages/models";

interface Props {
	categories?: ICategoryFullTranslations[];
}

const CategoryTags = ({ categories }: Props) => {
	const sortedCategories = sortCategories(categories);
	return (
		<Space direction="vertical" size="small">
			{sortedCategories?.map((category, index) => (
				<Tag key={index} color={!category.isOptional ? "blue" : "green"}>
					{category?.name.es}
				</Tag>
			))}
		</Space>
	);
};

export default CategoryTags;
