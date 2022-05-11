import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cardValidator from "card-validator";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { ErrorMessage } from "@hookform/error-message";
import { isCountryCode } from "@laptopoutlet-packages/utils";
import { translateCountry } from "@laptopoutlet-packages/utils";
import ListBox from "../common/ListBox";
import { CardBrand, Country } from "@laptopoutlet-packages/types";
import CardBrandIcon from "./CardBrandIcon";
import ControllerPlus from "../common/ControllerPlus";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { MessageContext } from "../../contexts/MessageContextProvider";
import {
	GetPaymentCardsDocument,
	GetPaymentCardsQuery,
	useUpdatePaymentCardMutation,
} from "../../libs/graphql/operations/paymentCard.graphql";
import { COUNTRIES } from "@laptopoutlet-packages/constants";

interface Props {
	cancelAction: () => void;
	onSuccess?: () => void;
	nameOnCard: string;
	expiryMonth: string;
	expiryYear: string;
	addressLine1: string;
	addressLine2?: string | null;
	country: string;
	province: string;
	city: string;
	zipcode: string;
	id: string;
	brand: CardBrand;
	snippet: string;
}

interface FormFields {
	nameOnCard: string;
	expiryDate: string;
	addressLine1: string;
	addressLine2?: string;
	country: string;
	province: string;
	city: string;
	zipcode: string;
}

const EditPaymentForm = ({
	cancelAction,
	country,
	zipcode,
	province,
	nameOnCard,
	expiryYear,
	expiryMonth,
	addressLine1,
	addressLine2,
	city,
	id,
	onSuccess,
	brand,
	snippet,
}: Props) => {
	const { formatMessage } = useIntl();
	// const [cvvDescription, setCvvDescription] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
		setError,
		clearErrors,
		setValue,
	} = useForm<FormFields>({
		defaultValues: {
			expiryDate: "",
			nameOnCard: "",
			addressLine1: "",
			addressLine2: "",
			city: "",
			province: "",
			zipcode: "",
		},
	});
	const [updatePaymentCard, { loading: loadingUpdatePaymentCard }] =
		useUpdatePaymentCardMutation();
	const [countryError, setCountryError] = useState<string>();
	const [countryID, setCountryID] = useState<Country | undefined>(() =>
		country && isCountryCode(country) ? country : undefined
	);
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { setMessage, setMessageVisible, setMessageType } =
		useContext(MessageContext);
	const submit = async ({
		nameOnCard,
		expiryDate,
		addressLine1,
		addressLine2,
		city,
		province,
		zipcode,
	}: FormFields) => {
		const { month: expiryMonth, year: expiryYear } =
			cardValidator.expirationDate(expiryDate);
		if (!expiryMonth || !expiryYear || !countryID || !id) {
			return;
		}
		const { data, errors } = await updatePaymentCard({
			variables: {
				input: {
					id,
					makeDefault: false,
					nameOnCard,
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
					updateData?.updatePaymentCard.__typename === "PaymentCards" &&
					!errors
				) {
					cache.writeQuery<GetPaymentCardsQuery>({
						data: {
							getPaymentCards: {
								__typename: "PaymentCards",
								defaultCard: updateData.updatePaymentCard.defaultCard,
								paymentCards: updateData.updatePaymentCard.paymentCards,
							},
							__typename: "Query",
						},
						query: GetPaymentCardsDocument,
					});
				}
			},
		});
		if (!data?.updatePaymentCard || errors) {
			setMessage(formatMessage({ id: "generalError" }));
			setMessageType("error");
			setMessageVisible(true);
			return;
		}
		if (data.updatePaymentCard.__typename === "GeneralError") {
			setMessage(data.updatePaymentCard.message);
			setMessageType("error");
			setMessageVisible(true);
			return;
		}
		if (data.updatePaymentCard.__typename === "PaymentCards") {
			setMessage(formatMessage({ id: "payments.editSuccess" }));
			setMessageType("success");
			setMessageVisible(true);
			onSuccess ? onSuccess() : cancelAction();
			return;
		}
	};
	useEffect(() => {
		nameOnCard && setValue("nameOnCard", nameOnCard);
		expiryMonth &&
			expiryYear &&
			setValue(
				"expiryDate",
				`${expiryMonth}/${expiryYear.substr(expiryYear.length - 2)}`
			);
		addressLine1 && setValue("addressLine1", addressLine1);
		addressLine2 && setValue("addressLine2", addressLine2);
		// country && setValue("country", country);
		province && setValue("province", province);
		city && setValue("city", city);
		zipcode && setValue("zipcode", zipcode);
	}, []);
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
						<FormattedMessage id="settings.payments.editPaymentCard" />
					</h3>
				</div>
				<div className="col-span-full">
					<div className="dark:border-gray-600 w-full text-sm font-medium flex items-center space-x-2 border rounded-md p-4">
						<CardBrandIcon cardBrand={brand} />
						<span className="capitalize">{brand}</span>
						<span>x-{snippet}</span>
					</div>
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
			</div>

			<div className="col-span-full">
				<h4 className=" mt-8 title text-sm">
					<FormattedMessage id="payments.billingAddress" />
				</h4>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-4">
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
									isValid || formatMessage({ id: "payments.zipcode.invalid" })
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

			<div className="mt-8 flex justify-end items-center">
				<button
					type="button"
					className={`btn ${
						false ? "btn-default-disabled" : "btn-default"
					} px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-2`}
					onClick={cancelAction}
				>
					<FormattedMessage id="cancel" />
				</button>
				<button
					type="submit"
					disabled={loadingUpdatePaymentCard}
					className={`btn ${
						loadingUpdatePaymentCard ? "btn-primary-disabled" : "btn-primary"
					} relative px-2 py-1 text-sm sm:text-base sm:px-4 sm:py-2 ml-2 sm:ml-4`}
				>
					{loadingUpdatePaymentCard && (
						<BiLoaderAlt className="text-xl animate-spin absolute" />
					)}
					<span className={loadingUpdatePaymentCard ? "invisible" : undefined}>
						<FormattedMessage id="save" />
					</span>
				</button>
			</div>
		</form>
	);
};

export default EditPaymentForm;
