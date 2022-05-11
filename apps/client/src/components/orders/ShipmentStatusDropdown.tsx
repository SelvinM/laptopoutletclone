import React from "react";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import queryString from "query-string";
import {
	isShipmentStatus,
	getParamAsString,
} from "@laptopoutlet-packages/utils";
import DropdownMenu from "../common/DropdownMenu";
import { Menu } from "@headlessui/react";
import { ShipmentStatus } from "@laptopoutlet-packages/types";
interface Props {}

const ShipmentStatusDropdown = ({}: Props) => {
	const router = useRouter();
	const statusQuery = getParamAsString(router.query.status);
	const statusValue = isShipmentStatus(statusQuery) ? statusQuery : "all";
	const handleStatusChange = (value: string) => {
		const formattedValues = queryString.stringify(
			{
				...router.query,
				status: value !== "all" ? value : undefined,
				page: undefined,
			},
			{}
		);
		router.push(
			{ pathname: "/orders", search: formattedValues },
			{
				pathname: "/orders",
				search: formattedValues,
			},
			{ shallow: true }
		);
	};
	return (
		<div className="relative inline-flex items-center text-xs sm:text-sm">
			<DropdownMenu
				buttonText={
					<FormattedMessage id={`order.status.filterLabel.${statusValue}`} />
				}
				label={<FormattedMessage id="filter" />}
			>
				<div className="py-1 w-56 max-h-56 overflow-y-auto">
					<Menu.Item key={"all"}>
						{({ active }) => (
							<a
								className={`option cursor-pointer px-4 h-auto py-2 ${
									active ? "bg-gray-100" : ""
								}`}
								onClick={() => handleStatusChange("all")}
							>
								<FormattedMessage id="order.status.filterLabel.all" />
							</a>
						)}
					</Menu.Item>
					{Object.values(ShipmentStatus).map((value, index) => (
						<Menu.Item key={index}>
							{({ active }) => (
								<a
									className={`option cursor-pointer px-4 h-auto py-2 ${
										active ? "bg-gray-100" : ""
									}`}
									onClick={() => handleStatusChange(value)}
								>
									<FormattedMessage id={`order.status.filterLabel.${value}`} />
								</a>
							)}
						</Menu.Item>
					))}
				</div>
			</DropdownMenu>
		</div>
	);
};

export default ShipmentStatusDropdown;
