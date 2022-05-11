import { Transition } from "@headlessui/react";
import { MeQuery } from "../../libs/graphql/operations/user.graphql";
import React, { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import AddPaymentCardForm from "../payments/AddPaymentCardForm";
import { CheckoutState } from "../../types";
import { scroller } from "react-scroll";
import { DEFAULT_SCROLL_DURATION } from "../../constants";
import ChangePaymentCard from "../payments/ChangePaymentCard";
import EditPaymentCardForm from "../payments/EditPaymentCardForm";
import DeletePaymentCardModal from "../payments/DeletePaymentCardModal";
import { GetPaymentCardsQuery } from "../../libs/graphql/operations/paymentCard.graphql";
import { UserAddress } from "@laptopoutlet-packages/models";
interface Props {
	dataMe?: MeQuery;
	paymentCardsData?: GetPaymentCardsQuery;
	checkoutState: CheckoutState;
	setCheckoutState: React.Dispatch<React.SetStateAction<CheckoutState>>;
	scrollPositionId: string;
}
type paymentStates = "change" | "add" | "edit";

const CheckoutPayments = ({
	dataMe,
	checkoutState,
	setCheckoutState,
	scrollPositionId,
	paymentCardsData,
}: Props) => {
	const [paymentState, setPaymentState] = useState<paymentStates>(() => {
		return "change";
	});
	const [editPaymentCardId, setEditPaymentCardId] = useState<string>();
	const [showDeleteModal, setShowDeleteModal] = useState<string>();
	const shippingAddress = dataMe?.me?.addresses?.find(
		(address) => address?.id === dataMe.me?.shippingAddress
	);
	const scrollPosition = () => {
		if (checkoutState !== CheckoutState.ShippingFormOpen)
			scroller.scrollTo(scrollPositionId, {
				smooth: true,
				duration: DEFAULT_SCROLL_DURATION,
				isDynamic: true,
				offset: -20,
			});
	};
	const switchpaymentStateToAdd = () => {
		scrollPosition();
		setCheckoutState(CheckoutState.PaymentFormOpen);
		setPaymentState("add");
	};
	const switchPaymentStateToChange = () => {
		setCheckoutState(CheckoutState.BothClosed);
		setPaymentState("change");
	};
	const switchPaymentStateToEdit = (editPaymentCardId: string | undefined) => {
		scrollPosition();
		setCheckoutState(CheckoutState.PaymentFormOpen);
		setPaymentState("edit");
		setEditPaymentCardId(editPaymentCardId);
	};
	const switchPaymentStateToDefault = () => {
		switchPaymentStateToChange();
	};
	useEffect(() => {
		if (checkoutState === CheckoutState.ShippingFormOpen)
			switchPaymentStateToChange();
	}, [checkoutState]);
	const editPaymentCard = paymentCardsData?.getPaymentCards?.paymentCards.find(
		(paymentCard) => paymentCard?.id && paymentCard.id === editPaymentCardId
	);
	const paymentCardForDelete =
		paymentCardsData?.getPaymentCards?.paymentCards.find(
			(paymentCard) => paymentCard?.id && paymentCard.id === showDeleteModal
		);
	const onRemoveClick = (id: string) => {
		setShowDeleteModal(id);
	};
	const closeModal = () => {
		setShowDeleteModal(undefined);
	};

	return (
		<>
			<DeletePaymentCardModal
				brand={paymentCardForDelete?.brand}
				snippet={paymentCardForDelete?.snippet}
				closeAction={closeModal}
				visible={!!showDeleteModal}
				id={paymentCardForDelete?.id}
			/>
			<Transition
				show={
					!!(paymentState === "edit" && !!editPaymentCard) &&
					checkoutState !== CheckoutState.PaymentFormOpen
				}
				enter="transition-height ease-in duration-300"
				enterFrom="h-0"
				enterTo="h-124"
				leave="transition-height ease-out duration-300"
				leaveFrom="h-124"
				leaveTo="h-0"
				className="overflow-hidden"
			>
				<div className="p-4 sm:p-8">
					{!!editPaymentCard && (
						<EditPaymentCardForm
							cancelAction={() => {
								scrollPosition();
								switchPaymentStateToChange();
							}}
							onSuccess={switchPaymentStateToChange}
							nameOnCard={editPaymentCard?.nameOnCard}
							expiryMonth={editPaymentCard?.expiryMonth}
							expiryYear={editPaymentCard?.expiryYear}
							addressLine1={editPaymentCard?.billingAddress.addressLine1}
							addressLine2={editPaymentCard?.billingAddress.addressLine2}
							zipcode={editPaymentCard?.billingAddress.zipcode}
							country={editPaymentCard.billingAddress.country}
							city={editPaymentCard?.billingAddress.city}
							province={editPaymentCard?.billingAddress.province}
							brand={editPaymentCard.brand}
							id={editPaymentCard.id}
							snippet={editPaymentCard.snippet}
						/>
					)}
				</div>
			</Transition>
			<Transition
				show={paymentState === "add"}
				enter="transition-height ease-in duration-300"
				enterFrom="h-0"
				enterTo={shippingAddress ? "h-92" : "h-138"}
				leave="transition-height ease-out duration-300"
				leaveFrom={shippingAddress ? "h-92" : "h-138"}
				leaveTo="h-0"
				className="overflow-hidden"
			>
				<div className="p-4 sm:p-8">
					<AddPaymentCardForm
						shippingAddress={shippingAddress as UserAddress}
						cancelAction={() => {
							scrollPosition();
							switchPaymentStateToDefault();
						}}
						makeDefault
					/>
				</div>
			</Transition>
			<Transition
				show={!!(paymentState === "change")}
				enter="transition ease-in duration-200"
				enterFrom="transform opacity-0"
				enterTo="transform opacity-100"
			>
				<div className="p-4 sm:p-8">
					<div
						className={
							paymentCardsData?.getPaymentCards?.paymentCards &&
							paymentCardsData?.getPaymentCards?.paymentCards.length > 0
								? "mb-8"
								: undefined
						}
					>
						<ChangePaymentCard
							paymentCardsData={paymentCardsData}
							switchPaymentStateToEdit={switchPaymentStateToEdit}
							onRemoveClick={onRemoveClick}
						/>
					</div>
					<div className="text-right lg:text-left">
						<button className="link btn" onClick={switchpaymentStateToAdd}>
							<BiPlus className="sm:text-lg" />
							<span className="ml-1 text-sm sm:text-base">
								<FormattedMessage id="settings.payments.addNewPaymentCard" />
							</span>
						</button>
					</div>
				</div>
			</Transition>
		</>
	);
};

export default CheckoutPayments;
