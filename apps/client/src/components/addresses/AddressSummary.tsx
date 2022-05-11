import React from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { FormattedMessage } from "react-intl";

interface Props {
	id: string;
	firstname: string;
	lastname: string;
	addressLine1: string;
	addressLine2?: string | null;
	country: string;
	phone: string;
	province: string;
	city: string;
	zipcode: string;
	selected?: boolean;
	editAction: () => void;
	removeAction: () => void;
}

const AddressSummary = ({
	addressLine1,
	city,
	country,
	firstname,
	lastname,
	province,
	addressLine2,
	phone,
	selected,
	editAction,
	zipcode,
	removeAction,
}: Props) => {
	return (
		<div className="flex flex-wrap sm:flex-nowrap">
			<div className="w-full sm:w-10/12 sm:pr-4 text-sm">
				<span className="block truncate font-medium mb-2">
					{firstname} {lastname}
				</span>
				<p className="truncate-2-lines overflow-hidden">{addressLine1}</p>
				<span className="block truncate">{addressLine2}</span>
				<span className="truncate">
					{city}, {province}
				</span>
				<span className="block truncate">{country}</span>
				<span className="hidden truncate">{zipcode}</span>
				<span className="block truncate mt-2">{phone}</span>
				{selected && (
					<div className="mt-3">
						<span className="uppercase text-gray-500 dark:text-gray-400">
							<FormattedMessage id="address.selected" />
						</span>
					</div>
				)}
			</div>
			<div className="w-full space-x-2 sm:space-y-2 sm:space-x-0 sm:w-2/12 mt-4 sm:mt-0 flex justify-end sm:justify-start sm:flex-col items-end">
				<button className="btn link" onClick={editAction}>
					<BiEdit className="text-sm" />
					<span className="ml-1 text-sm">
						<FormattedMessage id="edit" />
					</span>
				</button>
				<button className="btn link" onClick={removeAction}>
					<BiTrash className="text-sm" />
					<span className="ml-1 text-sm">
						<FormattedMessage id="remove" />
					</span>
				</button>
			</div>
		</div>
	);
};

export default AddressSummary;
