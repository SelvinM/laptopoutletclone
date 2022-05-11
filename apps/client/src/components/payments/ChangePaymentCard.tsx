import { RadioGroup } from "@headlessui/react";
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
	GetPaymentCardsDocument,
	GetPaymentCardsQuery,
	useChangeDefaultPaymentCardMutation,
} from "../../libs/graphql/operations/paymentCard.graphql";
import { PaymentCard } from "../../types";
import CardBrandIcon from "./CardBrandIcon";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { MessageContext } from "../../contexts/MessageContextProvider";
import { BiCheck, BiLoaderAlt } from "react-icons/bi";

interface Props {
	paymentCardsData?: GetPaymentCardsQuery;
	switchPaymentStateToEdit: (id: string) => void;
	onRemoveClick: (id: string) => void;
}

interface CustomRadioGroupOptionProps {
	paymentCard: PaymentCard;
	switchPaymentStateToEdit: (id: string) => void;
	loading?: boolean;
	selected?: boolean;
	onRemoveClick: (id: string) => void;
}

const CustomRadioGroupOption = ({
	paymentCard,
	switchPaymentStateToEdit,
	loading,
	selected,
	onRemoveClick,
}: CustomRadioGroupOptionProps) => {
	return (
		<div
			className={`dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:divide-gray-600 flex border items-stretch divide-x justify-between relative rounded-lg overflow-hidden ${
				selected
					? " dark:border-secondary-200 dark:divide-secondary-200 bg-gray-50 dark:bg-gray-800"
					: ""
			}`}
		>
			<RadioGroup.Option
				key={paymentCard.id}
				value={paymentCard.id}
				className={({}) =>
					`rounded-l-lg duration-200 w-8/12 sm:w-9/12 md:w-10/12 lg:w-9/12 px-2 xs:px-4 py-2  xs:py-4 cursor-pointer`
				}
			>
				{({ checked }) => (
					<div className="flex focus:outline-none">
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center">
								<div className="text-2xs xs:text-sm pl-7 xs:pl-8">
									<RadioGroup.Label
										as="div"
										className="flex items-center space-x-2"
									>
										<>
											<CardBrandIcon cardBrand={paymentCard.brand} />
											<span className="capitalize hidden md:inline">
												{paymentCard.brand}
											</span>
											<span className="hidden md:inline">
												x-{paymentCard.snippet}
											</span>
											<span className="md:hidden">
												<FormattedMessage
													id="order.details.paymentMethod.paymentCard"
													values={{
														snippet: (
															<span className="font-medium">
																{paymentCard.snippet}
															</span>
														),
													}}
												/>
											</span>
										</>
									</RadioGroup.Label>
									<RadioGroup.Description
										as="div"
										className="dark:text-gray-400 inline text-gray-500"
									>
										<span>
											<FormattedMessage
												id="payments.cardExpiration"
												values={{
													expiryMonth: paymentCard.expiryMonth,
													expiryYear: paymentCard.expiryYear.substr(
														paymentCard.expiryYear.length - 2
													),
												}}
											/>
										</span>
									</RadioGroup.Description>
								</div>
							</div>
							<div className="dark:text-secondary-200 absolute h-full flex items-center left-2 xs:left-3 text-secondary-500">
								{loading ? (
									<BiLoaderAlt className="sm:text-xl animate-spin" />
								) : (
									checked && <BiCheck className="text-lg sm:text-2xl" />
								)}
							</div>
						</div>
					</div>
				)}
			</RadioGroup.Option>
			<div className="pr-2 xs:pr-4 w-4/12 sm:w-3/12 md:w-2/12 lg:w-3/12 flex-col flex space-y-2 justify-center items-end">
				<button
					onClick={() => switchPaymentStateToEdit(paymentCard.id)}
					className="btn link text-2xs xs:text-sm"
				>
					<FormattedMessage id="edit" />
				</button>
				<button
					onClick={() => onRemoveClick(paymentCard.id)}
					className="btn link text-2xs xs:text-sm"
				>
					<FormattedMessage id="remove" />
				</button>
			</div>
		</div>
	);
};

const ChangePaymentCard = ({
	paymentCardsData,
	switchPaymentStateToEdit,
	onRemoveClick,
}: Props) => {
	const [changeDefaultPaymentCard, { loading }] =
		useChangeDefaultPaymentCardMutation();
	const { setMessage, setMessageVisible, setMessageType } =
		useContext(MessageContext);
	const [lastClicked, setLastClicked] = useState<string>();
	const selectedPaymentCard =
		paymentCardsData?.getPaymentCards?.paymentCards.find(
			(paymentCard) =>
				paymentCard?.id &&
				paymentCard.id === paymentCardsData.getPaymentCards?.defaultCard
		);
	const { locale } = useRouter();
	const { formatMessage } = useIntl();
	const handleChange = async (value: string) => {
		if (value === selectedPaymentCard?.id) {
			return;
		}
		setLastClicked(value);
		const { data, errors } = await changeDefaultPaymentCard({
			variables: { paymentCardID: value, locale: getCurrentLocale(locale) },
			update: (cache, { data: updateData, errors }) => {
				if (
					updateData?.changeDefaultPaymentCard.__typename === "PaymentCards" &&
					!errors
				) {
					cache.writeQuery<GetPaymentCardsQuery>({
						data: {
							getPaymentCards: {
								__typename: "PaymentCards",
								defaultCard: updateData.changeDefaultPaymentCard.defaultCard,
								paymentCards: updateData.changeDefaultPaymentCard.paymentCards,
							},
							__typename: "Query",
						},
						query: GetPaymentCardsDocument,
					});
				}
			},
		});
		if (!data?.changeDefaultPaymentCard || errors) {
			setMessage(formatMessage({ id: "generalError" }));
			setMessageType("error");
			setMessageVisible(true);
			return;
		}
		if (data.changeDefaultPaymentCard.__typename === "GeneralError") {
			setMessage(data.changeDefaultPaymentCard.message);
			setMessageType("error");
			setMessageVisible(true);
			return;
		}
	};
	return (
		<RadioGroup value={selectedPaymentCard?.id} onChange={handleChange}>
			<RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
			<div className="space-y-2">
				{paymentCardsData?.getPaymentCards?.paymentCards.map(
					(paymentCard) =>
						paymentCard && (
							<CustomRadioGroupOption
								key={paymentCard.id}
								paymentCard={paymentCard}
								switchPaymentStateToEdit={switchPaymentStateToEdit}
								loading={loading && lastClicked === paymentCard.id}
								selected={selectedPaymentCard?.id === paymentCard.id}
								onRemoveClick={onRemoveClick}
							/>
						)
				)}
			</div>
		</RadioGroup>
	);
};

export default ChangePaymentCard;
