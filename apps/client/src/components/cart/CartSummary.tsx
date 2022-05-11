import { getPriceFormatter } from "@laptopoutlet-packages/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { AiOutlineSafety } from "react-icons/ai";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import getCurrentLocale from "../../utils/getCurrentLocale";
import Card from "../common/Card";

interface Props {
	totalQuantity?: number;
	itemsTotalPrice?: number;
	shippingTotalPrice?: number;
	totalPrice?: number;
	showCheckoutLink?: boolean;
	placeOrderErrorMsg?: string;
	afterSubmitErrorMsg?: string;
	placeOrderAction?: () => void;
	hideReturnPolicyLink?: boolean;
	hideActionButton?: boolean;
	loadingPlaceOrder?: boolean;
}
const CartSummary = ({
	totalQuantity,
	itemsTotalPrice,
	shippingTotalPrice,
	totalPrice,
	showCheckoutLink,
	placeOrderErrorMsg,
	placeOrderAction,
	hideReturnPolicyLink,
	hideActionButton,
	loadingPlaceOrder,
	afterSubmitErrorMsg,
}: Props) => {
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { currency } = useContext(CurrencyContext);
	const priceFormatter = getPriceFormatter(currentLocale, currency);
	const formattedItemsTotalPrice = priceFormatter.format(itemsTotalPrice || 0);
	const formattedShippingTotalPrice = priceFormatter.format(
		shippingTotalPrice || 0
	);
	const formattedTotalPrice = priceFormatter.format(totalPrice || 0);
	return (
		<Card title={<FormattedMessage id="orderSummary" />}>
			<>
				<div className="p-4 sm:p-8 ">
					<div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
						<span>
							<FormattedMessage
								id="orderSummary.items"
								values={{ total: totalQuantity || 0 }}
							/>
						</span>
						<span className="text-right break-words">
							{formattedItemsTotalPrice}
						</span>
						<span>
							<FormattedMessage id="orderSummary.shipping" />
						</span>
						<span className="text-right break-words">
							{formattedShippingTotalPrice}
						</span>
						<span className="font-medium">
							<FormattedMessage id="orderSummary.total" />
						</span>
						<span className="text-right break-words font-medium">
							{formattedTotalPrice}
						</span>
					</div>
				</div>
				{!hideActionButton && (
					<div>
						{showCheckoutLink ? (
							<div className="p-4 sm:px-8 border-t dark:border-gray-600">
								<Link href="/checkout">
									<a className="btn py-3 w-full justify-center btn-tertiary">
										<FormattedMessage id="checkout" />
									</a>
								</Link>
							</div>
						) : (
							<div className="p-4 sm:px-8 border-t dark:border-gray-600">
								<button
									type="submit"
									disabled={!!placeOrderErrorMsg || loadingPlaceOrder}
									className={`btn relative py-3 w-full justify-center ${
										!!placeOrderErrorMsg || loadingPlaceOrder
											? "btn-tertiary-disabled"
											: "btn-tertiary"
									}`}
									onClick={placeOrderAction}
								>
									{loadingPlaceOrder && (
										<BiLoaderAlt className="absolute text-2xl animate-spin" />
									)}
									<span className={loadingPlaceOrder ? "invisible" : undefined}>
										<FormattedMessage id="placeOrder" />
									</span>
								</button>
								{(placeOrderErrorMsg || afterSubmitErrorMsg) && (
									<div className="mt-2 text-xs xs:text-sm text-red-600 dark:text-red-500">
										{placeOrderErrorMsg || afterSubmitErrorMsg}
									</div>
								)}
								<span className="text-2xs xs:text-xs text-gray-600 dark:text-gray-400 leading-tight block text-center mt-3">
									<FormattedMessage
										id="placeOrder.message"
										values={{
											termsOfUse: (
												<a
													href="/blog/terms-of-use"
													className="hover:text-secondary-500 dark:hover:text-secondary-200 capitalize underline"
													target="_blank"
												>
													<FormattedMessage id="blog.termsOfUse" />
												</a>
											),
											privacyPolicy: (
												<a
													href="/blog/privacy-policy"
													className="hover:text-secondary-500 dark:hover:text-secondary-200 capitalize underline"
													target="_blank"
												>
													<FormattedMessage id="blog.privacyPolicy" />
												</a>
											),
										}}
									/>
								</span>
							</div>
						)}
					</div>
				)}
				{!hideReturnPolicyLink && (
					<div className="px-4 sm:px-8 pt-2 pb-1 border-t dark:border-gray-600 text-center">
						<a
							href="/blog/warranty-and-returns"
							className="btn link"
							target="_blank"
						>
							<AiOutlineSafety className="text-sm" />
							<span className="text-xs ml-1">
								<FormattedMessage id="placeOrder.warrantyMessage" />
							</span>
						</a>
					</div>
				)}
			</>
		</Card>
	);
};

export default CartSummary;
