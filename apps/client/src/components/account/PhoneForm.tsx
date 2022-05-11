import {
	MeQuery,
	useUpdateUserPhoneMutation,
} from "../../libs/graphql/operations/user.graphql";
import { parsePhoneNumber } from "libphonenumber-js/mobile";
import React, { useEffect } from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import { MessageContext } from "../../contexts/MessageContextProvider";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";

interface Props {
	dataMe?: MeQuery;
	loading?: boolean;
}
type FormFields = {
	phoneCountryCode: string;
	phoneNumber: string;
};

const PhoneForm = ({ dataMe }: Props) => {
	const { setMessage, setMessageType, setMessageVisible } =
		useContext(MessageContext);
	const { formatMessage } = useIntl();
	const {
		handleSubmit,
		register,
		formState: { errors },
		clearErrors,
		getValues,
		setValue,
	} = useForm<FormFields>({
		defaultValues: { phoneCountryCode: "", phoneNumber: "" },
	});
	const [updateUserPhone, { loading: loadingUpdate }] =
		useUpdateUserPhoneMutation();
	useEffect(() => {
		if (dataMe?.me?.phone) {
			try {
				const parsedPhone = parsePhoneNumber(dataMe.me.phone);
				if (parsedPhone.isValid()) {
					setValue(
						"phoneCountryCode",
						parsedPhone.countryCallingCode.toString()
					);
					setValue("phoneNumber", parsedPhone.nationalNumber.toString());
				}
			} catch {}
		}
	}, [dataMe?.me?.phone]);
	const { locale } = useRouter();
	const submitPhone = async ({ phoneCountryCode, phoneNumber }: FormFields) => {
		setMessageVisible(false);
		const newPhone = `+${phoneCountryCode} ${phoneNumber}`;
		let oldPhone = "";
		try {
			const parsedPhone = parsePhoneNumber(dataMe?.me?.phone || "");
			if (parsedPhone.isValid()) {
				oldPhone = `+${parsedPhone?.countryCallingCode} ${parsedPhone?.nationalNumber}`;
			}
		} catch {}
		if (newPhone === oldPhone) {
			setMessageType("info");
			setMessage(
				formatMessage({ id: "settings.account.updateSameValueMessage" })
			);
			setMessageVisible(true);
			return;
		}

		const { data } = await updateUserPhone({
			variables: { phone: newPhone, locale: getCurrentLocale(locale) },
		});
		if (data?.updateUserPhone.__typename === "GeneralError") {
			setMessageType("error");
			setMessage(data.updateUserPhone.message);
			setMessageVisible(true);
		}
		if (data?.updateUserPhone.__typename === "User") {
			setMessageType("success");
			setMessage(formatMessage({ id: "account.settings.phoneChangeSuccess" }));
			setMessageVisible(true);
		}
	};
	return (
		<form
			onSubmit={handleSubmit(submitPhone)}
			className="md:flex max-w-md mx-auto md:mx-0 md:max-w-none"
		>
			<div className="mb-4 md:mb-0 md:mx-0 w-full md:w-1/4 ">
				<h3 className="font-medium md:text-right">
					<FormattedMessage id="settings.account.phone" />
				</h3>
			</div>
			<div className="md:w-3/4 md:ml-8 md:max-w-md">
				<div>
					<div className="mb-2">
						<span className="italic text-sm text-gray-500 dark:text-gray-400">
							<FormattedMessage id="settings.account.phoneMessage" />
						</span>
					</div>
					<div className="flex">
						<div
							className="flex items-center justify-between w-20 px-2 input border border-transparent dark:focus-within:border-secondary-200 focus-within:border-primary-500"
							id="country-code-input"
						>
							<span>(+</span>
							<input
								className="py-2 w-8 bg-transparent focus:outline-none"
								type="tel"
								maxLength={3}
								{...register("phoneCountryCode", {
									required: formatMessage({
										id: "address.countryCodeRequired",
									}),
									validate: (value: string) => {
										try {
											const parsedNewPhone = parsePhoneNumber(
												`+${value} ${getValues().phoneNumber}`
											);
											if (parsedNewPhone.isValid()) {
												clearErrors("phoneNumber");
												return true;
											} else {
												return formatMessage({ id: "form.validation.phone" });
											}
										} catch {
											return formatMessage({ id: "form.validation.phone" });
										}
									},
								})}
							/>
							<span>)</span>
						</div>
						<div className="flex-auto ml-4">
							<input
								className="input border py-2 px-2"
								type="tel"
								{...register("phoneNumber", {
									required: formatMessage({
										id: "form.validation.required",
									}),
									validate: (value: string) => {
										try {
											const parsedNewPhone = parsePhoneNumber(
												`+${getValues().phoneCountryCode} ${value}`
											);
											if (parsedNewPhone.isValid()) {
												clearErrors("phoneCountryCode");
												return true;
											} else {
												return formatMessage({ id: "form.validation.phone" });
											}
										} catch {
											return formatMessage({ id: "form.validation.phone" });
										}
									},
								})}
								maxLength={16}
							/>
						</div>
					</div>
					<span className="text-red-600 dark:text-red-500  mt-2 block">
						{errors.phoneCountryCode?.message || errors.phoneNumber?.message}
					</span>
				</div>

				<div className="mt-6 text-right">
					<button
						type="submit"
						disabled={loadingUpdate}
						className={`btn ${
							loadingUpdate ? "btn-primary-disabled" : "btn-primary"
						} px-3 py-2 relative`}
					>
						{loadingUpdate && (
							<BiLoaderAlt className="absolute text-xl animate-spin" />
						)}
						<span className={loadingUpdate ? "invisible" : undefined}>
							<FormattedMessage id="settings.account.changePhone" />
						</span>
					</button>
				</div>
			</div>
		</form>
	);
};

export default PhoneForm;
