import React, { useState, useContext } from "react";
import { signIn } from "next-auth/client";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import { ErrorMessage } from "@hookform/error-message";
import { MessageContext } from "../../contexts/MessageContextProvider";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import { useRouter } from "next/router";
const EmailAuthCard = ({}) => {
	const [sent, setSent] = useState(false);
	const [loading, setLoading] = useState(false);
	const { formatMessage } = useIntl();
	const { setMessage, setMessageType, setMessageVisible } =
		useContext(MessageContext);
	type FormFields = {
		email: string;
	};
	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm<FormFields>({
		defaultValues: { email: "" },
	});
	const router = useRouter();
	const callbackUrl =
		getParamAsString(router.query.callbackUrl) || process.env.NEXT_PUBLIC_URL;
	const submitEmailChangeRequest = async ({ email }: FormFields) => {
		setLoading(true);
		const resp = await signIn("email", {
			redirect: false,
			email,
			callbackUrl: callbackUrl,
		});
		setLoading(false);
		if (!resp?.ok || !!resp.error) {
			setMessage(formatMessage({ id: "signIn.email.error" }));
			setMessageType("error");
			setMessageVisible(true);
			return;
		}
		setSent(true);
	};

	return (
		<div className="dark:bg-gray-900 w-full sm:w-auto px-3 py-8 sm:p-12 lg:p-16 bg-white xs:shadow-md mx-auto">
			<div className=" text-center px-8 w-full">
				{sent ? (
					<h1 className="title text-xl">
						<FormattedMessage id="signIn.email.checkInbox" />
					</h1>
				) : (
					<h1 className="title text-xl uppercase">
						<FormattedMessage id="signIn" />
					</h1>
				)}
			</div>
			<div className="mt-8 w-64 sm:w-72 mx-auto">
				<div className="dark:text-gray-400text-gray-600">
					{sent ? (
						<div className="mt-4">
							<p>
								<FormattedMessage
									id="signIn.email.sent"
									values={{
										email: (
											<span className="font-medium">{getValues().email}</span>
										),
									}}
								/>
							</p>
						</div>
					) : (
						<>
							<form
								onSubmit={handleSubmit(submitEmailChangeRequest)}
								className="mb-8"
							>
								<div className="mb-4 text-sm">
									<FormattedMessage id="signIn.email.message" />
								</div>
								<input
									{...register("email", {
										required: formatMessage({
											id: "form.validation.required",
										}),
										maxLength: {
											message: formatMessage({
												id: "form.validation.email",
											}),
											value: 255,
										},
										pattern: {
											value:
												/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
											message: formatMessage({
												id: "form.validation.email",
											}),
										},
									})}
									className="input w-full border py-2 px-4"
									type="email"
									// required
									maxLength={255}
									placeholder={formatMessage({
										id: "signIn.email.placeholder",
									})}
								/>
								<span className="text-red-600 dark:text-red-500  mt-1 block">
									<ErrorMessage errors={errors} name="pendingEmail" />
								</span>
								<div className="mt-5">
									<button
										type="submit"
										disabled={loading}
										className={`btn ${
											loading ? "btn-primary-disabled" : "btn-primary"
										} px-4 w-full py-2`}
									>
										{loading && (
											<BiLoaderAlt className="absolute text-xl animate-spin" />
										)}
										<span className={loading ? "invisible" : undefined}>
											<FormattedMessage id="continue" />
										</span>
									</button>
								</div>
							</form>
							<div className="text-center  text-2xs sm:text-xs ">
								<FormattedMessage
									id="legalWarningMessage"
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
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default EmailAuthCard;
