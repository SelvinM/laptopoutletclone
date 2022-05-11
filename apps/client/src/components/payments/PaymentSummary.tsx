import { CardBrand } from "@laptopoutlet-packages/types";
import React, { FunctionComponent } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import CardBrandIcon from "./CardBrandIcon";

interface Props {
	nameOnCard: string;
	snippet: string;
	brand: CardBrand;
	expiryMonth: string;
	expiryYear: string;
	editAction: () => void;
	removeAction: () => void;
}

const PaymentSummary: FunctionComponent<Props> = ({
	expiryYear,
	expiryMonth,
	nameOnCard,
	brand,
	snippet,
	editAction,
	removeAction,
}) => {
	return (
		<>
			<div className="flex flex-wrap sm:flex-nowrap">
				<div className="w-full sm:w-10/12 sm:pr-4 text-sm">
					<div className="flex items-center space-x-2 font-medium mb-2">
						<CardBrandIcon cardBrand={brand} />
						<span className="capitalize">{brand}</span>
					</div>
					<span className="block">
						<FormattedMessage
							id="order.details.paymentMethod.paymentCard"
							values={{
								snippet: <span className="font-medium">{snippet}</span>,
							}}
						/>
					</span>
					<span className="block">
						<FormattedMessage
							id="payments.cardExpiration"
							values={{
								expiryMonth,
								expiryYear: expiryYear.substring(expiryYear.length - 2),
							}}
						/>
					</span>
					<span className="block truncate">{nameOnCard}</span>
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
		</>
	);
};

export default PaymentSummary;
