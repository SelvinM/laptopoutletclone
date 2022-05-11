import React from "react";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import queryString from "query-string";
import { ProductSort } from "../../types";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import { DEFAULT_PRODUCT_SORT } from "../../constants";
import DropdownMenu from "../common/DropdownMenu";
import { Menu } from "@headlessui/react";
import { isProductSort } from "../../utils/enumValidations";
interface Props {}

const SortByDropdown = ({}: Props) => {
	const router = useRouter();
	const categoryid = getParamAsString(router.query.categoryid);
	const sortValue = getParamAsString(router.query.sort);
	const handleSortChange = (value: string) => {
		const formattedValues = queryString.stringify(
			{
				...router.query,
				categoryid: undefined,
				sort: value !== ProductSort.BestMatch ? value : undefined,
				page: undefined,
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
	return (
		<div className="relative inline-flex items-center text-xs sm:text-sm">
			<DropdownMenu
				buttonText={
					<FormattedMessage
						id={`sortBy.${
							isProductSort(sortValue) ? sortValue : DEFAULT_PRODUCT_SORT
						}`}
					/>
				}
				label={<FormattedMessage id="sortBy" />}
			>
				<div className="py-1 w-48">
					{Object.values(ProductSort).map((value, index) => (
						<Menu.Item key={index}>
							{({ active }) => (
								<a
									className={`option px-4 h-auto py-2 ${
										active ? "bg-gray-100 dark:bg-gray-900" : ""
									}`}
									onClick={() => handleSortChange(value)}
								>
									<FormattedMessage id={`sortBy.${value}`} />
								</a>
							)}
						</Menu.Item>
					))}
				</div>
			</DropdownMenu>
		</div>
	);
};

export default SortByDropdown;
