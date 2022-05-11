import { GetProductsQuery } from "../../../libs/graphql/operations/product.graphql";
import React from "react";
import { BiLoaderAlt, BiSearch } from "react-icons/bi";
import { FormattedMessage } from "react-intl";

import ItemSummary from "../../products/ItemSummary";

interface Props {
	visible?: boolean;
	loading?: boolean;
	getProductsQuery?: GetProductsQuery;
	searchAction: () => void;
	closeDropdown: () => void;
}

const AutocompleteDropdown = ({
	visible,
	loading,
	getProductsQuery,
	searchAction,
	closeDropdown,
}: Props) => {
	return (
		<>
			{visible && (
				<div className="absolute w-full bg-white dark:bg-gray-800 shadow-md z-40">
					{!loading ? (
						getProductsQuery?.getProducts &&
						getProductsQuery.getProducts.products.length === 0 ? (
							<div className="pl-4 pt-4 h-80 sm:h-84">
								<span>
									<FormattedMessage id="search.noResults" />
								</span>
							</div>
						) : (
							<>
								{getProductsQuery?.getProducts.products?.map(
									(product, index) => (
										<ItemSummary
											key={index}
											slug={product?.slug}
											imageUrl={
												product?.images ? product.images[0]?.url : undefined
											}
											isLink
											onClick={closeDropdown}
											condition={product?.condition}
											title={product?.listing.longTitle}
										/>
									)
								)}
								<div className=" hidden sm:flex items-center justify-center h-16">
									<button
										onClick={searchAction}
										className="btn px-3 py-2 btn-primary"
									>
										<BiSearch className="text-xl" />
										<span className="ml-2">
											<FormattedMessage id="search.seeAll" />
										</span>
									</button>
								</div>
							</>
						)
					) : (
						<div className="h-80 sm:h-84 flex justify-center">
							<BiLoaderAlt
								className="dark:text-gray-400 animate-spin text-primary-500 mt-16"
								size={40}
							/>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default AutocompleteDropdown;
