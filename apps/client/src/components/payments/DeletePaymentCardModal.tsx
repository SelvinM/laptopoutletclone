import { CardBrand } from "@laptopoutlet-packages/types";
import CardBrandIcon from "./CardBrandIcon";
import Modal from "../common/Modal";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
	GetPaymentCardsDocument,
	GetPaymentCardsQuery,
	useDeletePaymentCardMutation,
} from "../../libs/graphql/operations/paymentCard.graphql";
import { useRouter } from "next/router";
import { MessageContext } from "../../contexts/MessageContextProvider";
import getCurrentLocale from "../../utils/getCurrentLocale";
import YesNoButtons from "../common/YesNoButtons";
interface Props {
	snippet?: string;
	brand?: CardBrand;
	closeAction: () => void;
	id?: string;
	visible?: boolean;
}
type Data = {
	brand?: CardBrand;
	snippet?: string;
};
const DeletePaymentCardModal = ({
	brand,
	snippet,
	closeAction,
	id,
	visible,
}: Props) => {
	const { setMessageType, setMessage, setMessageVisible } =
		useContext(MessageContext);
	const [deletePaymentCard, { loading: loadingDelete }] =
		useDeletePaymentCardMutation();
	const [data, setData] = useState<Data>();
	useEffect(() => {
		const newData = { brand, snippet };
		if (!data?.brand) setData(newData);
		if (data?.brand && brand) setData(newData);
	}, [brand]);
	const { formatMessage } = useIntl();
	const { locale } = useRouter();
	const handleDelete = async () => {
		if (!id) return;
		const { data: dataDelete } = await deletePaymentCard({
			variables: {
				paymentCardID: id,
				locale: getCurrentLocale(locale),
			},
			update: (cache, { data: updateData, errors }) => {
				if (
					updateData?.deletePaymentCard.__typename === "PaymentCards" &&
					!errors
				) {
					cache.writeQuery<GetPaymentCardsQuery>({
						data: {
							getPaymentCards: {
								__typename: "PaymentCards",
								defaultCard: updateData.deletePaymentCard.defaultCard,
								paymentCards: updateData.deletePaymentCard.paymentCards,
							},
							__typename: "Query",
						},
						query: GetPaymentCardsDocument,
					});
				}
			},
		});
		if (dataDelete?.deletePaymentCard.__typename === "GeneralError") {
			setMessageType("error");
			setMessage(dataDelete.deletePaymentCard.message);
			setMessageVisible(true);
		}
		if (dataDelete?.deletePaymentCard.__typename === "PaymentCards") {
			setMessage(formatMessage({ id: "payments.deleteSuccess" }));
			setMessageType("success");
			setMessageVisible(true);
		}
		closeAction();
	};
	return (
		<Modal
			title={<FormattedMessage id="payment.removeConfirmation.message" />}
			isOpen={visible}
			onClose={closeAction}
			closeDisabled={loadingDelete}
		>
			<>
				<div className="sm:mb-4">
					<div className="w-full text-sm">
						<div className="flex items-center font-medium space-x-2 truncate">
							<CardBrandIcon cardBrand={data?.brand} />
							<span className="capitalize">{data?.brand}</span>
						</div>
						<span>
							<FormattedMessage
								id="order.details.paymentMethod.paymentCard"
								values={{
									snippet: <span className="font-medium">{data?.snippet}</span>,
								}}
							/>
						</span>
					</div>
				</div>
				<YesNoButtons
					loading={loadingDelete}
					yesAction={handleDelete}
					noAction={closeAction}
				/>
			</>
		</Modal>
	);
};

export default DeletePaymentCardModal;
