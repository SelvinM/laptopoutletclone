import { useCategoriesQuery } from "../../../libs/graphql/operations/category.graphql";
import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { ICategory } from "@laptopoutlet-packages/models";

interface Props {
	onItemClick?: () => void;
}

const CategoriesMenu = ({ onItemClick }: Props) => {
	const { locale } = useRouter();
	const { data } = useCategoriesQuery({
		variables: { locale: getCurrentLocale(locale) },
	});
	const getCategories = (categories?: ICategory[] | null) => {
		if (Array.isArray(categories)) {
			return categories.map((category: ICategory) => {
				if (category.hasChildren) {
					return (
						<div key={category.id}>
							<span className="option px-6 md:px-8 xl:px-10">
								{category.name}
							</span>
						</div>
					);
				} else {
					return (
						<div
							key={category.id}
							className={`${!category.showInMenu ? "hidden" : ""}`}
						>
							<Link
								href="/products/[categoryid]"
								as={`/products/${category.id}`}
							>
								<a
									className="option px-6 md:px-8 xl:px-10"
									onClick={onItemClick}
								>
									{category.name}
								</a>
							</Link>
						</div>
					);
				}
			});
		}
	};
	return (
		<>
			<div>
				{getCategories(
					data?.categories.filter(
						(category) => !category?.isOptional
					) as ICategory[]
				)}
				<div key="all products">
					<Link href="/products/[categoryid]" as="/products/all">
						<a className="option px-6 md:px-8 xl:px-10" onClick={onItemClick}>
							<FormattedMessage id="allProducts" />
						</a>
					</Link>
				</div>
			</div>
		</>
	);
};

export default CategoriesMenu;
