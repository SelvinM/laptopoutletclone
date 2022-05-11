import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/400-italic.css";
import "@fontsource/rubik/300.css";
import {
	GetCartDocument,
	GetCartQuery,
	useGetCartQuery,
} from "../../libs/graphql/operations/cart.graphql";
import { useMeQuery } from "../../libs/graphql/operations/user.graphql";
import { NextPage } from "next";
import Head from "../../components/common/Head";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleLayoutTwo from "../../components/layouts/SimpleLayouts/SimpleLayoutTwo";
import CartSummary from "../../components/cart/CartSummary";
import CheckoutShipping from "../../components/checkout/CheckoutShipping";
import CartItems from "../../components/cart/CartItems";
import CheckoutPayments from "../../components/checkout/CheckoutPayments";
import { CheckoutState } from "../../types";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import Card from "../../components/common/Card";
import { useGetPaymentCardsQuery } from "../../libs/graphql/operations/paymentCard.graphql";
import {
	GetOrderDocument,
	GetOrderQuery,
	usePlaceOrderMutation,
} from "../../libs/graphql/operations/order.graphql";
import { MessageContext } from "../../contexts/MessageContextProvider";
import OrderPlacedConfirmation from "../../components/checkout/OrderPlacedConfirmation";
import { IPObjectContext } from "../../contexts/IPObjectContextProvider";
import Script from "next/script";
interface Props {}

const orgId =
	process.env.NODE_ENV === "production"
		? process.env.NEXT_PUBLIC_FINGERPRINT_ORG_ID_PROD
		: process.env.NEXT_PUBLIC_FINGERPRINT_ORG_ID;

const fingerprintSessionId = `${Date.now()}${Math.floor(
	Math.pow(10, 3) + Math.random() * (Math.pow(10, 4) - Math.pow(10, 3) - 1)
)}${Math.floor(
	Math.pow(10, 3) + Math.random() * (Math.pow(10, 4) - Math.pow(10, 3) - 1)
)}${Math.floor(
	Math.pow(10, 3) + Math.random() * (Math.pow(10, 4) - Math.pow(10, 3) - 1)
)}${Math.floor(
	Math.pow(10, 3) + Math.random() * (Math.pow(10, 4) - Math.pow(10, 3) - 1)
)}`;

const Checkout: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	const { locale } = useRouter();
	const [orderPlaced, setOrderPlaced] = useState<string>();
	const { setMessage, setMessageType, setMessageVisible } =
		useContext(MessageContext);
	const currentLocale = getCurrentLocale(locale);
	const {
		data: cartData,
		loading: cartDataLoading,
		refetch: refetchCart,
	} = useGetCartQuery({
		variables: { locale: currentLocale },
	});
	const { data: paymentCardsData, loading: paymentCardsLoading } =
		useGetPaymentCardsQuery();
	const [placeOrderErrorMsg, setPlaceOrderErrorMsg] = useState<string>(); //este si bloquea el botón
	const [afterSubmitErrorMsg, setAfterSubmitErrorMsg] = useState<string>(); //este no bloquea el botón
	const [checkoutState, setCheckoutState] = useState<CheckoutState>(
		CheckoutState.BothClosed
	);
	const { data: dataMe, loading: loadingMe } = useMeQuery();
	const [placeOrderClicked, setPlaceOrderClicked] = useState(false);
	const [placeOrder, { loading: loadingPlaceOrder }] = usePlaceOrderMutation();
	const { ipObject } = useContext(IPObjectContext);
	useEffect(() => {
		if (cartData && placeOrderClicked) checkPlaceOrderErrors();
	}, [cartData, placeOrderClicked]);

	const checkPlaceOrderErrors = () => {
		if (!cartData?.getCart) return true;
		const shippingAddress = dataMe?.me?.addresses?.some(
			(address) => address && address.id === dataMe.me?.shippingAddress
		);
		const paymentMethod = paymentCardsData?.getPaymentCards?.paymentCards.some(
			(paymentCard) =>
				paymentCard?.id &&
				paymentCard.id === paymentCardsData.getPaymentCards?.defaultCard
		);
		if (!ipObject?.ipAddress) {
			setPlaceOrderErrorMsg(formatMessage({ id: "generalError" }));
			return true;
		}
		if (!shippingAddress) {
			setPlaceOrderErrorMsg(
				formatMessage({ id: "placeOrder.error.selectAddress" })
			);
			return true;
		}
		if (!paymentMethod) {
			setPlaceOrderErrorMsg(
				formatMessage({ id: "placeOrder.error.selectPayment" })
			);
			return true;
		}
		if (cartData?.getCart?.instaCheckout?.product) {
			if (
				cartData.getCart.instaCheckout.product.quantity === 0 ||
				!cartData.getCart.instaCheckout.product.list
			) {
				setPlaceOrderErrorMsg(
					formatMessage({ id: "placeOrder.error.unavailableProduct" })
				);
				return true;
			}
			if (
				cartData.getCart.instaCheckout.quantity >
				cartData.getCart.instaCheckout.product.quantity
			) {
				setPlaceOrderErrorMsg(
					formatMessage({ id: "placeOrder.error.invalidQuantity" })
				);
				return true;
			}
		} else {
			if (
				cartData.getCart.cartItems.some(
					(item) => item?.product && item.product.quantity === 0
				) ||
				cartData.getCart.cartItems.some(
					(item) => item?.product && !item.product.list
				)
			) {
				setPlaceOrderErrorMsg(
					formatMessage({ id: "placeOrder.error.unavailableProducts" })
				);
				return true;
			}
			if (
				cartData.getCart.cartItems.some(
					(item) => item?.product && item.quantity > item.product.quantity
				)
			) {
				setPlaceOrderErrorMsg(
					formatMessage({ id: "placeOrder.error.invalidQuantity" })
				);
				return true;
			}
		}
		setPlaceOrderErrorMsg(undefined);
		return false;
	};
	useEffect(() => {
		if (placeOrderClicked) checkPlaceOrderErrors();
	}, [
		placeOrderClicked,
		paymentCardsData?.getPaymentCards?.paymentCards,
		dataMe?.me?.addresses,
	]);
	const submitOrder = async () => {
		setPlaceOrderClicked(true);
		if (checkPlaceOrderErrors() || !fingerprintSessionId || !ipObject.ipAddress)
			return;
		const { data: dataOrder, errors } = await placeOrder({
			variables: {
				locale: currentLocale,
				fingerprintSessionId,
				ipAddress: ipObject.ipAddress,
			},
			update: (cache, { data }) => {
				if (data?.placeOrder.__typename === "OrderResult") {
					cache.writeQuery<GetOrderQuery>({
						data: { __typename: "Query", getOrder: data.placeOrder.order },
						query: GetOrderDocument,
						variables: { id: data.placeOrder.order.id, locale: currentLocale },
					});
					cache.writeQuery<GetCartQuery>({
						data: { __typename: "Query", getCart: data.placeOrder.cart },
						query: GetCartDocument,
						variables: { locale: currentLocale },
					});
				}
			},
		});
		if (!dataOrder?.placeOrder || (errors && errors.length > 0)) {
			setMessageType("error");
			setMessage(formatMessage({ id: "generalError" }));
			setMessageVisible(true);
		}
		if (dataOrder?.placeOrder.__typename === "GeneralError") {
			setAfterSubmitErrorMsg(dataOrder.placeOrder.message);
			await refetchCart();
		}
		if (dataOrder?.placeOrder.__typename === "OrderResult")
			setOrderPlaced(dataOrder.placeOrder.order.id);
	};
	const loading =
		cartDataLoading || paymentCardsLoading || loadingMe || ipObject.loading;

	return (
		<SimpleLayoutTwo
			title={
				<span>
					<FormattedMessage id="checkout" />
				</span>
			}
			hideCartLink={!!cartData?.getCart?.instaCheckout}
		>
			<>
				<Head
					title={`${formatMessage(
						{ id: "title.checkout" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)} - ${process.env.NEXT_PUBLIC_APP_NAME}`}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<Script
					type="text/javascript"
					strategy="beforeInteractive"
					src={`https://h.online-metrix.net/fp/tags.js?org_id=${orgId}&session_id=${process.env.NEXT_PUBLIC_CYBERSOURCE_MERCHANT_ID}${fingerprintSessionId}`}
				/>
				<div className="container xl:px-0 xl:max-w-screen-lg mx-auto py-8 lg:pb-44 grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16">
					{orderPlaced ? (
						<div className="lg:col-span-full">
							<OrderPlacedConfirmation orderid={orderPlaced} />
						</div>
					) : (
						<>
							<div className="lg:col-span-7 flex flex-col">
								{(cartData?.getCart?.instaCheckout ||
									(cartData?.getCart?.cartItems &&
										cartData.getCart.cartItems.length > 0)) &&
									!loading && (
										<div className="order-2 lg:order-1">
											<div className="mb-8" id="checkout-shipping">
												<Card
													title={<FormattedMessage id="checkout.shipping" />}
												>
													<CheckoutShipping
														scrollPositionId="checkout-shipping"
														dataMe={dataMe}
														checkoutState={checkoutState}
														setCheckoutState={setCheckoutState}
													/>
												</Card>
											</div>
											<div className="lg:mb-8" id="checkout-payments">
												<Card
													title={<FormattedMessage id="checkout.payment" />}
												>
													<CheckoutPayments
														dataMe={dataMe}
														scrollPositionId="checkout-payments"
														checkoutState={checkoutState}
														setCheckoutState={setCheckoutState}
														paymentCardsData={paymentCardsData}
													/>
												</Card>
											</div>
										</div>
									)}
								<div className="mb-8 lg:mb-0 lg:order-2">
									<CartItems
										isCheckout
										data={cartData}
										loading={loading}
										dataMe={dataMe}
										title={<FormattedMessage id="checkout.itemsInCart" />}
									/>
								</div>
							</div>
							<div className="lg:col-span-5">
								<div className="lg:sticky lg:top-4">
									<CartSummary
										itemsTotalPrice={
											cartData?.getCart?.instaCheckout?.itemsTotalPrice ||
											cartData?.getCart?.itemsTotalPrice
										}
										totalPrice={
											cartData?.getCart?.instaCheckout?.totalPrice ||
											cartData?.getCart?.totalPrice
										}
										shippingTotalPrice={
											cartData?.getCart?.instaCheckout?.shippingTotalPrice ||
											cartData?.getCart?.shippingTotalPrice
										}
										afterSubmitErrorMsg={afterSubmitErrorMsg}
										placeOrderErrorMsg={placeOrderErrorMsg}
										placeOrderAction={submitOrder}
										totalQuantity={
											cartData?.getCart?.instaCheckout?.totalQuantity ||
											cartData?.getCart?.totalQuantity
										}
										loadingPlaceOrder={loadingPlaceOrder}
										hideActionButton={
											(cartData?.getCart?.instaCheckout?.totalQuantity ||
												cartData?.getCart?.totalQuantity ||
												0) <= 0 || loading
										}
									/>
								</div>
							</div>
						</>
					)}
				</div>
			</>
		</SimpleLayoutTwo>
	);
};

export default Checkout;
