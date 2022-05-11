import React from "react";
import { FormattedMessage } from "react-intl";
import OrderSummarySkeleton from "../skeletons/OrderSummarySkeleton";

interface Props {
	totalQuantity: number;
	itemsTotalPrice: string;
	shippingTotalPrice: string;
	totalPrice: string;
	returned?: string;
	loading?: boolean;
}

const OrderSummary = ({
	totalQuantity,
	itemsTotalPrice,
	shippingTotalPrice,
	totalPrice,
	returned,
	loading,
}: Props) => {
	if (loading) return <OrderSummarySkeleton />;
	return (
		<div className="grid grid-cols-2 gap-2 text-sm">
			<span>
				<FormattedMessage
					id="orderSummary.items"
					values={{
						total: totalQuantity,
					}}
				/>
			</span>
			<span className="text-right break-words">{itemsTotalPrice}</span>
			<span>
				<FormattedMessage id="orderSummary.shipping" />
			</span>
			<span className="text-right break-words">{shippingTotalPrice}</span>
			{returned && (
				<>
					<span>
						<FormattedMessage id="orderSummary.returned" />
					</span>
					<span className="text-right break-words text-green-600 dark:text-green-300">
						{returned}
					</span>
				</>
			)}
			<div className="col-span-full pt-4 border-t dark:border-gray-600 flex justify-between items-center">
				<span className="font-medium">
					<FormattedMessage id="orderSummary.total" />
				</span>
				<span className="text-right break-words font-medium">{totalPrice}</span>
			</div>
		</div>
	);
};

export default OrderSummary;
