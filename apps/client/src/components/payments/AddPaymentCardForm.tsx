import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cardValidator from "card-validator";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { ErrorMessage } from "@hookform/error-message";
import { isCardBrand, isCountryCode } from "@laptopoutlet-packages/utils";
import { translateCountry } from "@laptopoutlet-packages/utils";
import ListBox from "../common/ListBox";
import { CardBrand, Country } from "@laptopoutlet-packages/types";
import { Switch, Transition } from "@headlessui/react";
import CardBrandIcon from "./CardBrandIcon";
import ControllerPlus from "../common/ControllerPlus";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { MessageContext } from "../../contexts/MessageContextProvider";
import {
	GetPaymentCardsDocument,
	GetPaymentCardsQuery,
	useAddPaymentCardMutation,
} from "../../libs/graphql/operations/paymentCard.graphql";
import { COUNTRIES } from "@laptopoutlet-packages/constants";
import { UserAddress } from "@laptopoutlet-packages/models";
interface Props {
	cancelAction: () => void;
	shippingAddress?: UserAddress;
	makeDefault: boolean;
	onSuccess?: () => void;
}

type PaymentFormFields = {
	cardNumber: string;
	expiryDate: string;
	nameOnCard: string;
	addressLine1: string;
	addressLine2?: string;
	province: string;
	city: string;
	zipcode: string;
};

const addCardGaps = (oldString: string, gaps: number[]) => {
	let splittedString: string[] = [];
	gaps.sort((a, b) => a - b);
	for (let index = 0; index < gaps.length; index++) {
		const gap = gaps[index];
		if (index === 0 && index === gaps.length - 1) {
			splittedString.push(oldString.substring(0, gap));
			splittedString.push(oldString.substring(gap));
		}
		if (index === 0 && index < gaps.length - 1)
			splittedString.push(oldString.substring(0, gap));

		if (index > 0 && index < gaps.length - 1)
			splittedString.push(oldString.substring(gaps[index - 1], gap));

		if (index > 0 && index === gaps.length - 1) {
			splittedString.push(oldString.substring(gaps[index - 1], gap));
			splittedString.push(oldString.substring(gap));
		}
	}
	return splittedString.join(" ");
};

const PaymentForm = ({
	cancelAction,
	shippingAddress,
	makeDefault,
	onSuccess,
}: Props) => {
	const { formatMessage } = useIntl();
	const [cardBrand, setCardBrand] = useState<CardBrand>();
	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
		setError,
		clearErrors,
	} = useForm<PaymentFormFields>({
		defaultValues: {
			cardNumber: "",
			expiryDate: "",
			nameOnCard: "",
			addressLine1: shippingAddress?.address.addressLine1 || "",
			addressLine2: shippingAddress?.address.addressLine2 || "",
			city: shippingAddress?.address.city || "",
			province: shippingAddress?.address.province || "",
			zipcode: shippingAddress?.address.zipcode || "",
		},
	});
	const [addPaymentCard, { loading: loadingAddPaymentCard }] =
		useAddPaymentCardMutation();
	const [useShippingAddress, setUseShippingAddress] = useState(
		() => !!shippingAddress
	);
	const [countryError, setCountryError] = useState<string>();
	const [countryID, setCountryID] = useState<Country | undefined>(() =>
		shippingAddress && isCountryCode(shippingAddress.address.country)
			? shippingAddress.address.country
			: undefined
	);
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const [cardNumberMaxLength, setCardNumberMaxLength] = useState<number>();
	const [cardNumberGaps, setCardNumberGaps] = useState<number[]>();
	const { setMessage, setMessageVisible, setMessageType } =
		useContext(MessageContext);

	const submit = async ({
		nameOnCard,
		cardNumber,
		expiryDate,
		addressLine1,
		addressLine2,
		city,
		province,
		zipcode,
	}: PaymentFormFields) => {
		const { month: expiryMonth, year: expiryYear } =
			cardValidator.expirationDate(expiryDate);
		if (!expiryMonth || !expiryYear || !countryID) return;
		const { data, errors } = await addPaymentCard({
			variables: {
				input: {
					makeDefault,
					nameOnCard,
					cardNumber,
					expiryMonth,
					expiryYear,
					billingAddress: {
						addressLine1,
						addressLine2,
						city,
						country: countryID,
						province,
						zipcode,
					},
				},
				locale: currentLocale,
			},
			update: (cache, { data: updateData, errors }) => {
				if (
					updateData?.addPaymentCard.__typename === "PaymentCards" &&
					!errors
				) {
					cache.writeQuery<GetPaymentCardsQuery>({
						data: {
							getPaymentCards: {
								__typename: "PaymentCards",
								defaultCard: updateData.addPaymentCard.defaultCard,
								paymentCards: updateData.addPaymentCard.paymentCards,
							},
							__typename: "Query",
						},
						query: GetPaymentCardsDocument,
					});
				}
			},
		});
		if (!data?.addPaymentCard || errors) {
			setMessage(formatMessage({ id: "generalError" }));
			setMessageType("error");
			setMessageVisible(true);
			return;
		}
		if (data.addPaymentCard.__typename === "GeneralError") {
			setMessage(data.addPaymentCard.message);
			setMessageType("error");
			setMessageVisible(true);
			return;
		}
		if (data.addPaymentCard.__typename === "PaymentCards") {
			setMessage(formatMessage({ id: "payments.addSuccess" }));
			setMessageType("success");
			setMessageVisible(true);
			onSuccess ? onSuccess() : cancelAction();
			return;
		}
	};
	const checkCountryError = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!countryID)
			setCountryError(formatMessage({ id: "form.validation.required" }));
	};
	return (
		<form onSubmit={handleSubmit(submit)} onSubmitCapture={checkCountryError}>
			<div className="grid grid-cols-3 gap-4">
				<div className="col-span-full">
					<h3 className="title">
						<FormattedMessage id="settings.payments.addNewPaymentCard" />
					</h3>
				</div>
				<div className="col-span-full ">
					<div className="dark:border-gray-600 w-full flex items-center border rounded-md p-4">
						<span className="dark:text-gray-400 mr-2 text-sm italic text-gray-600">
							<FormattedMessage id="payments.accept" />
						</span>
						<CardBrandIcon showAll />
					</div>
				</div>

				<div className="col-span-full xs:col-span-2">
					<label className="text-sm block mb-2">
						<FormattedMessage id="payments.cardNumber" />
					</label>
					<div className="relative">
						<ControllerPlus
							className="input pl-2 pr-14 xs:pr-20 py-1 focus:outline-none"
							name="cardNumber"
							type="tel"
							rules={{
								required: formatMessage({ id: "form.validation.required" }),
								validate: (val: string) => {
									const { isValid, card } = cardValidator.number(val);
									const isAllowed = card && isCardBrand(card?.type);
									return (
										(isValid && isAllowed) ||
										formatMessage({ id: "payments.cardNumber.invalid" })
									);
								},
							}}
							transform={{
								input: (value) => {
									if (isNaN(Number(value)))
										return value.substring(0, value.length - 1).trim();
									if (cardNumberGaps) {
										value = addCardGaps(value, cardNumberGaps);
									}
									return value.trim();
								},
								output: ({ target: { value } }) => {
									value = value.split(" ").join("");
									if (isNaN(Number(value[value.length - 1])))
										value = value.substring(0, value.length - 1);
									const { card, isPotentiallyValid } =
										cardValidator.number(value);
									if (
										!isPotentiallyValid ||
										(card && !isCardBrand(card.type))
									) {
										setCardBrand(undefined);
										setError("cardNumber", {
											type: "validate",
											message: formatMessage({
												id: "payments.cardNumber.invalid",
											}),
										});
									} else {
										if (card && isCardBrand(card.type)) {
											setCardBrand(card.type);
											const { gaps, lengths } = card;
											setCardNumberMaxLength(
												Math.max(...lengths) + gaps.length
											);
											setCardNumberGaps(gaps);
										} else {
											setCardBrand(undefined);
											setCardNumberMaxLength(undefined);
											setCardNumberGaps(undefined);
										}
										clearErrors("cardNumber");
									}
									return value;
								},
							}}
							control={control}
							maxLength={cardNumberMaxLength || 19}
							autoComplete="cc-number"
						/>
						<div className="absolute inline-flex items-center right-0 h-full mr-2">
							<CardBrandIcon cardBrand={cardBrand} />
						</div>
					</div>
					<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
						<ErrorMessage errors={errors} name="cardNumber" />
					</span>
				</div>
				<div className="col-span-full xs:col-span-1">
					<label className="text-sm block mb-2 ">
						<FormattedMessage id="payments.expiryDate" />
					</label>
					<ControllerPlus
						className="input px-2 py-1 focus:outline-none"
						name="expiryDate"
						autoComplete="cc-exp"
						placeholder={formatMessage({
							id: "payments.expiryDate.placeholder",
						})}
						transform={{
							input: (value) => {
								value = value.split("/").join("");
								if (isNaN(Number(value[value.length - 1]))) {
									value = value.substring(0, value.length - 1);
								}
								if (value.length === 1 && Number(value) > 1) {
									return `0${value}`;
								}
								if (value.length > 2) {
									const splittedValue = [
										value.substring(0, 2),
										value.substring(2),
									];
									return splittedValue.join("/");
								}
								return value;
							},
							output: ({ target: { value } }) => {
								const { isPotentiallyValid } =
									cardValidator.expirationDate(value);
								if (!isPotentiallyValid) {
									setCardBrand(undefined);
									setError("expiryDate", {
										type: "validate",
										message: formatMessage({
											id: "payments.expiryDate.invalid",
										}),
									});
								} else {
									clearErrors("expiryDate");
								}
								return value;
							},
						}}
						maxLength={5}
						control={control}
						type="tel"
						rules={{
							required: formatMessage({ id: "form.validation.required" }),
							validate: (val: string) => {
								const { isValid } = cardValidator.expirationDate(val);
								return (
									isValid ||
									formatMessage({ id: "payments.expiryDate.invalid" })
								);
							},
						}}
					/>
					<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
						<ErrorMessage errors={errors} name="expiryDate" />
					</span>
				</div>
				<div className="col-span-full xs:col-span-2">
					<label className="text-sm block mb-2">
						<FormattedMessage id="payments.nameOnCard" />
					</label>
					<input
						className="input px-2 py-1 focus:outline-none"
						autoComplete="cc-name"
						maxLength={26 * 2}
						{...register("nameOnCard", {
							validate: (val: string) => {
								const { isValid } = cardValidator.cardholderName(val);
								return (
									isValid ||
									formatMessage({ id: "payments.nameOnCard.invalid" })
								);
							},
						})}
						onChange={({ target: { value } }) => {
							const { isPotentiallyValid } =
								cardValidator.cardholderName(value);
							if (!isPotentiallyValid) {
								setError("nameOnCard", {
									type: "validate",
									message: formatMessage({
										id: "payments.nameOnCard.invalid",
									}),
								});
							} else {
								clearErrors("nameOnCard");
							}
						}}
					/>
					<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
						<ErrorMessage errors={errors} name="nameOnCard" />
					</span>
				</div>
			</div>
			<div className="col-span-full">
				<h4 className=" mt-8 mb-4 title text-sm">
					<FormattedMessage id="payments.billingAddress" />
				</h4>
			</div>
			{!!shippingAddress?.id && (
				<div className="col-span-full ">
					<Switch.Group as="div" className="flex items-center space-x-3">
						<Switch
							checked={useShippingAddress}
							onChange={setUseShippingAddress}
							className={`${
								useShippingAddress
									? "bg-primary-500 dark:bg-secondary-200 border-transparent"
									: " bg-gray-200 dark:bg-gray-800 dark:border-gray-600"
							} border relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:ring-1 dark:focus:ring-secondary-200 dark:ring-offset-gray-800 ring-offset-2 dark:ring-opacity-30 focus:ring-primary-500 focus:outline-none`}
						>
							<span
								className={`${
									useShippingAddress
										? "translate-x-6 bg-gray-300 dark:bg-primary-500"
										: "translate-x-1 bg-primary-500 dark:bg-gray-500"
								} inline-block w-4 h-4 transform rounded-full transition-transform`}
							/>
						</Switch>
						<Switch.Label className="cursor-pointer text-sm ">
							<FormattedMessage id="payments.useShippingAddress" />
						</Switch.Label>
					</Switch.Group>
				</div>
			)}
			{useShippingAddress && !!shippingAddress?.id ? (
				<>
					<input type="hidden" {...register("addressLine1")} />
					<input type="hidden" {...register("addressLine2")} />
					<input type="hidden" {...register("city")} />
					<input type="hidden" {...register("province")} />
					<input type="hidden" {...register("zipcode")} />
				</>
			) : (
				<Transition
					show
					enter="transition-opacity ease-in duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					appear
				>
					<div
						className={`${
							!!shippingAddress?.id ? "mt-8" : ""
						} grid grid-cols-2 gap-4`}
					>
						<div className="col-span-2">
							<label className="text-sm block mb-2 ">
								<FormattedMessage id="address.addressLine1" />
							</label>
							<input
								maxLength={255}
								autoComplete="address-line1"
								{...register("addressLine1", {
									required: formatMessage({ id: "form.validation.required" }),
								})}
								className="input px-2 py-1 focus:outline-none"
							/>
							<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
								<ErrorMessage errors={errors} name="addressLine1" />
							</span>
						</div>
						<div className="col-span-2">
							<label className="text-sm block mb-2 ">
								<FormattedMessage id="address.addressLine2" />
							</label>
							<input
								maxLength={255}
								autoComplete="address-line2"
								{...register("addressLine2", {})}
								className="input px-2 py-1 focus:outline-none"
							/>
							<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
								<ErrorMessage errors={errors} name="addressLine2" />
							</span>
						</div>
						<div className="col-span-2 sm:col-span-1">
							<label className="text-sm block mb-2 ">
								<FormattedMessage id="address.country" />
							</label>
							<ListBox
								options={COUNTRIES[currentLocale].map((country) => ({
									label: country.name,
									value: country.code,
									key: country.code,
								}))}
								label={
									translateCountry({
										code: countryID,
										locale: currentLocale,
									}) || (
										<span className="dark:text-gray-400 text-gray-500">
											<FormattedMessage id="address.selectCountry" />
										</span>
									)
								}
								onChange={
									((val: string) => {
										if (val && countryError) {
											setCountryError(undefined);
										}
										if (isCountryCode(val)) setCountryID(val);
									}) as any
								}
							/>
							{countryError && (
								<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
									{countryError}
								</span>
							)}
						</div>
						<div className="col-span-2 sm:col-span-1">
							<label className="text-sm block mb-2 ">
								<FormattedMessage id="address.province2" />
							</label>
							<input
								{...register("province", {
									required: formatMessage({ id: "form.validation.required" }),
								})}
								maxLength={255}
								className="input px-2 py-1 focus:outline-none"
							/>
							<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
								<ErrorMessage errors={errors} name="province" />
							</span>
						</div>
						<div className="col-span-2 sm:col-span-1">
							<label className="text-sm block mb-2 ">
								<FormattedMessage id="address.city" />
							</label>
							<input
								{...register("city", {
									required: formatMessage({ id: "form.validation.required" }),
								})}
								autoComplete="city"
								maxLength={255}
								className="input px-2 py-1 focus:outline-none"
							/>
							<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
								<ErrorMessage errors={errors} name="city" />
							</span>
						</div>
						<div className="col-span-2 sm:col-span-1">
							<label className="text-sm block mb-2 ">
								<FormattedMessage id="address.zipcode" />
							</label>
							<input
								{...register("zipcode", {
									required: formatMessage({ id: "form.validation.required" }),
									validate: (val) => {
										const { isValid } = cardValidator.postalCode(val);
										return (
											isValid ||
											formatMessage({ id: "payments.zipcode.invalid" })
										);
									},
								})}
								autoComplete="postal-code"
								maxLength={255}
								className="input px-2 py-1 focus:outline-none"
							/>
							<span className="text-red-600 dark:text-red-500 mt-1 text-sm">
								<ErrorMessage errors={errors} name="zipcode" />
							</span>
						</div>
					</div>
				</Transition>
			)}

			<Transition
				show={useShippingAddress}
				enter="transition-opacity ease-in duration-300"
				enterFrom="opacity-0"
				enterTo="opacity-100"
			>
				<div className="mt-4 max-w-sm">
					<p className=" text-sm truncate-2-lines overflow-hidden ">
						{shippingAddress?.address.addressLine1}
					</p>
					<span className="text-sm  block truncate">
						{shippingAddress?.address.addressLine2}
					</span>
					<span className="text-sm mb-2 block truncate">{`${
						shippingAddress?.address.city
					}, ${shippingAddress?.address.province}, ${translateCountry({
						code: shippingAddress?.address.country,
						locale: currentLocale,
					})}, ${shippingAddress?.address.zipcode}`}</span>
				</div>
			</Transition>

			<div className="mt-8 flex justify-end items-center">
				<button
					type="button"
					disabled={loadingAddPaymentCard}
					className={`btn ${
						loadingAddPaymentCard ? "btn-default-disabled" : "btn-default"
					} px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-2`}
					onClick={cancelAction}
				>
					<FormattedMessage id="cancel" />
				</button>
				<button
					type="submit"
					disabled={loadingAddPaymentCard || Object.values(errors).length > 0}
					className={`btn ${
						loadingAddPaymentCard || Object.values(errors).length > 0
							? "btn-primary-disabled"
							: "btn-primary"
					} relative px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-2 ml-2 sm:ml-4`}
				>
					{loadingAddPaymentCard && (
						<BiLoaderAlt className="text-xl animate-spin absolute" />
					)}
					<span className={loadingAddPaymentCard ? "invisible" : undefined}>
						<FormattedMessage id="save" />
					</span>
				</button>
			</div>
		</form>
	);
};

export default PaymentForm;
