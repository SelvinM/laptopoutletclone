import { ErrorMessage } from "@hookform/error-message";
import {
	MeQuery,
	useUpdateUserEmailRequestMutation,
} from "../../libs/graphql/operations/user.graphql";
import React, { useEffect } from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import { MessageContext } from "../../contexts/MessageContextProvider";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import EmailConfirmationForm from "./EmailConfirmationForm";

interface Props {
	dataMe?: MeQuery;
}
type FormFields = {
	pendingEmail: string;
};
const EmailForm = ({ dataMe }: Props) => {
	const { setMessageType, setMessageVisible, setMessage } =
		useContext(MessageContext);
	const [updateUserEmailRequest, { loading: loadingUpdate }] =
		useUpdateUserEmailRequestMutation();
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { formatMessage } = useIntl();
	const {
		register,
		formState: { errors },
		setValue,
		handleSubmit,
	} = useForm<FormFields>({
		defaultValues: { pendingEmail: "" },
	});
	useEffect(() => {
		if (dataMe?.me?.email) {
			setValue("pendingEmail", dataMe.me.email);
		}
	}, [dataMe?.me?.email]);

	const submitEmailChangeRequest = async ({ pendingEmail }: FormFields) => {
		setMessageVisible(false);
		if (pendingEmail === dataMe?.me?.email) {
			setMessageType("info");
			setMessage(
				formatMessage({ id: "settings.account.updateSameValueMessage" })
			);
			setMessageVisible(true);
			return;
		}
		const { data } = await updateUserEmailRequest({
			variables: { pendingEmail, locale: currentLocale },
		});
		if (data?.updateUserEmailRequest.__typename === "GeneralError") {
			setMessageType("error");
			setMessage(data.updateUserEmailRequest.message);
			setMessageVisible(true);
		}
	};
	return (
		<>
			{dataMe?.me?.emailChangeRequest?.pendingEmail ? (
				<div className="md:flex max-w-md mx-auto md:mx-0 md:max-w-none">
					<div className="mb-4 md:mb-0 md:mx-0 md:w-1/4 ">
						<h3 className="font-medium md:text-right">
							<FormattedMessage id="settings.account.email" />
						</h3>
					</div>
					<div className="md:w-3/4 md:ml-8">
						<div className="md:max-w-md">
							<EmailConfirmationForm
								pendingEmail={dataMe.me.emailChangeRequest.pendingEmail}
							/>
						</div>
					</div>
				</div>
			) : (
				<form
					onSubmit={handleSubmit(submitEmailChangeRequest)}
					className="md:flex max-w-md mx-auto md:mx-0 md:max-w-none"
				>
					<div className="mb-4 md:mb-0 md:mx-0 md:w-1/4 ">
						<h3 className="font-medium md:text-right">
							<FormattedMessage id="settings.account.email" />
						</h3>
					</div>
					<div className="md:w-3/4 md:ml-8">
						<div className="md:max-w-md">
							<div>
								<input
									{...register("pendingEmail", {
										required: formatMessage({ id: "form.validation.required" }),
										maxLength: {
											message: formatMessage({ id: "form.validation.email" }),
											value: 255,
										},
										pattern: {
											value:
												/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
											message: formatMessage({ id: "form.validation.email" }),
										},
									})}
									className="input w-full border py-2 px-2"
									type="email"
									maxLength={255}
								/>
								<span className="text-red-600 dark:text-red-500  mt-2 block">
									<ErrorMessage errors={errors} name="pendingEmail" />
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
										<FormattedMessage id="settings.account.changeEmail" />
									</span>
								</button>
							</div>
						</div>
					</div>
				</form>
			)}
		</>
	);
};

export default EmailForm;
