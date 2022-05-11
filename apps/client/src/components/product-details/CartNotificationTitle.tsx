import React from "react";
import { FormattedMessage } from "react-intl";
import { AddCartItemMutation } from "../../libs/graphql/operations/cart.graphql";

interface Props {
	cartData?: AddCartItemMutation | null | undefined;
}

const CartNotificationTitle = ({ cartData }: Props) => {
	if (cartData?.addCartItem.__typename === "Cart") {
		return (
			<h3 className="uppercase font-medium text-primary-500 dark:text-gray-200">
				<FormattedMessage id="cart.addSuccess" />
			</h3>
		);
	}
	if (cartData?.addCartItem.__typename === "GeneralError") {
		return <p>{cartData.addCartItem.message}</p>;
	}
	if (cartData?.addCartItem.__typename === "ProductNotAvailableError") {
		return <p>{cartData.addCartItem.message}</p>;
	}
	return <div></div>;
};

export default CartNotificationTitle;
