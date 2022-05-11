import { useCategoriesQuery } from "../../libs/graphql/operations/category.graphql";
import { useGetProductsQuery } from "../../libs/graphql/operations/product.graphql";
import React from "react";
import { useIntl } from "react-intl";
import { getCategoryAncestry } from "../../utils/categoryDataHelpers";
import ProductGridItem from "../products/ProductGridItem";
import SectionCard from "../common/SectionCard";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { ICategory } from "@laptopoutlet-packages/models";

interface Props {
	categoryid: string;
}

const ProductsGrid = ({ categoryid }: Props) => {
	const { formatMessage } = useIntl();
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { data: categoryData } = useCategoriesQuery({
		variables: { locale: currentLocale },
	});
	const { data } = useGetProductsQuery({
		variables: {
			limit: 12,
			categories: [categoryid],
			getFacets: false,
			getTotal: false,
			locale: currentLocale,
		},
	});
	const categoryAncestry = getCategoryAncestry({
		categories: categoryData?.categories as ICategory[] | undefined,
		id: categoryid,
		allProductsDescription: formatMessage({ id: "allDescription" }),
		allProductsTitle: formatMessage({ id: "allProducts" }),
	});
	const { name: title } =
		categoryAncestry && categoryAncestry.length > 0
			? categoryAncestry[categoryAncestry.length - 1]
			: { name: undefined };

	return (
		<SectionCard
			title={
				<h2 className="text-xl sm:w-auto md:text-2xl title inline-block sm:px-4">
					{title}
				</h2>
			}
		>
			<div className="grid grid-cols-1 sm:border-t-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 sm:gap-6 mt-6 sm:mt-10 ">
				{data?.getProducts.products.map((product, index) => (
					<div
						key={index}
						className={`dark:border-gray-600 sm:rounded-xl sm:border py-4 sm:p-4 flex flex-wrap ${
							index > 0 ? "border-t" : ""
						}`}
					>
						{product && (
							<ProductGridItem
								applyDiscount={product.applyDiscount}
								title={product.listing.longTitle}
								condition={product.condition}
								price={product.pricing.price}
								discountPrice={product.pricing.discountPrice}
								freeShipping={product.freeShipping}
								slug={product.slug}
								imageUrl={product.images?.[0]?.url}
								imagePlaceholder={product.images?.[0]?.placeholder}
								shipping={product.pricing.shipping}
							/>
						)}
					</div>
				))}
			</div>
		</SectionCard>
	);
};

export default ProductsGrid;
