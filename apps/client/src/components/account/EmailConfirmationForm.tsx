import React, { RefObject, useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import {
	useCancelEmailChangeRequestMutation,
	useUpdateUserEmailMutation,
} from "../../libs/graphql/operations/user.graphql";
import { MessageContext } from "../../contexts/MessageContextProvider";
import Alert from "../common/Alert";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
interface Props {
	pendingEmail?: string;
}
const EmailConfirmationForm = ({ pendingEmail }: Props) => {
	const { formatMessage } = useIntl();
	const { setMessage, setMessageType, setMessageVisible } =
		useContext(MessageContext);
	const { locale } = useRouter();
	const [data, setData] = useState<string>();
	const currentLocale = getCurrentLocale(locale);
	const initialCodeState = { 0: "", 1: "", 2: "", 3: "", 4: "" };
	const [code, setCode] = useState(initialCodeState);
	const input1 = useRef() as RefObject<HTMLInputElement>;
	const input2 = useRef() as RefObject<HTMLInputElement>;
	const input3 = useRef() as RefObject<HTMLInputElement>;
	const input4 = useRef() as RefObject<HTMLInputElement>;
	const [errorAlert, setErrorAlert] = useState<string>();
	const [updateUserEmail, { loading }] = useUpdateUserEmailMutation();
	const [cancelEmailChangeRequest, { loading: loadingCancel }] =
		useCancelEmailChangeRequestMutation();
	useEffect(() => {
		if (!data) setData(pendingEmail);
		if (data && pendingEmail) setData(pendingEmail);
	}, [pendingEmail]);
	const handleCodeChange = (value: string, index: number) => {
		if (value === "") setCode({ ...code, [index]: value.toUpperCase() });
		if ((value !== "" && value.length > 1) || !/^[a-zA-Z0-9]$/.test(value))
			return;
		setCode({ ...code, [index]: value.toUpperCase() });
		switch (index) {
			case 0:
				if (value !== "") input1.current?.focus();
				return;
			case 1:
				if (value !== "") input2.current?.focus();
				return;
			case 2:
				if (value !== "") input3.current?.focus();
				return;
			case 3:
				if (value !== "") input4.current?.focus();
				return;
			default:
				return;
		}
	};
	const clearFields = () => {
		setCode(initialCodeState);
	};
	const submitCode = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (Object.values(code).some((item) => item === "")) return;
		const codeString = code[0] + code[1] + code[2] + code[3] + code[4];
		const { data: dataUpdate } = await updateUserEmail({
			variables: { code: codeString, locale: currentLocale },
		});
		if (dataUpdate?.updateUserEmail.__typename === "GeneralError")
			setErrorAlert(dataUpdate.updateUserEmail.message);
		if (dataUpdate?.updateUserEmail.__typename === "User") {
			setMessageType("success");
			setMessage(formatMessage({ id: "settings.account.emailChangeSuccess" }));
			setMessageVisible(true);
		}
	};
	const cancelRequest = async () => {
		const { data } = await cancelEmailChangeRequest({
			variables: { locale: currentLocale },
		});
		if (data?.cancelEmailChangeRequest.__typename === "GeneralError")
			setErrorAlert(data.cancelEmailChangeRequest.message);
	};

	return (
		<form onSubmit={submitCode}>
			<h5 className="text-sm">
				<FormattedMessage id="settings.account.emailChangeAlert.message" />
			</h5>
			<p className="mb-4 text-sm text-justify">
				<FormattedMessage
					id="settings.account.emailChangeAlert.description"
					values={{
						newEmail: <span className="font-medium break-words">{data}</span>,
					}}
				/>{" "}
				<FormattedMessage id="emailSpamWarning" />
			</p>
			{errorAlert && (
				<div className="mb-4">
					<Alert
						type="error"
						onClose={() => setErrorAlert(undefined)}
						message={errorAlert}
					/>
				</div>
			)}
			<div className="grid grid-cols-5 max-w-xs gap-1 sm:gap-3">
				<input
					className="input px-3 py-1 focus:border-primary-500 border-2 focus:outline-none text-3xl text-center"
					onChange={({ target: { value: val } }) => {
						handleCodeChange(val, 0);
					}}
					autoFocus
					value={code[0]}
				/>
				<input
					className="input px-3 py-1 focus:border-primary-500 border-2 focus:outline-none text-3xl text-center"
					onChange={({ target: { value: val } }) => {
						handleCodeChange(val, 1);
					}}
					ref={input1}
					value={code[1]}
				/>
				<input
					className="input px-3 py-1 focus:border-primary-500 border-2 focus:outline-none text-3xl text-center"
					onChange={({ target: { value: val } }) => {
						handleCodeChange(val, 2);
					}}
					ref={input2}
					value={code[2]}
				/>
				<input
					className="input px-3 py-1 focus:border-primary-500 border-2 focus:outline-none text-3xl text-center"
					onChange={({ target: { value: val } }) => {
						handleCodeChange(val, 3);
					}}
					ref={input3}
					value={code[3]}
				/>
				<input
					className="input px-3 py-1 focus:border-primary-500 border-2 focus:outline-none text-3xl text-center"
					onChange={({ target: { value: val } }) => {
						handleCodeChange(val, 4);
					}}
					ref={input4}
					value={code[4]}
				/>
			</div>
			<div className="py-2 text-xs">
				<button className="btn link" onClick={clearFields} type="reset">
					<FormattedMessage id="form.clearFields" />
				</button>
			</div>
			<div className="mt-4 flex justify-end items-center">
				<button
					type="button"
					disabled={loadingCancel}
					className={`btn relative px-2 py-1  ${
						loadingCancel ? "btn-default-disabled" : "btn-default"
					}`}
					onClick={cancelRequest}
				>
					{loadingCancel && (
						<BiLoaderAlt className="absolute text-lg animate-spin" />
					)}
					<span className={loadingCancel ? "invisible" : undefined}>
						<FormattedMessage id="settings.account.cancelRequest" />
					</span>
				</button>
				<button
					disabled={loading}
					type="submit"
					className={`btn ml-4 border px-2 py-1 relative ${
						loading ? "btn-primary-disabled" : "btn-primary"
					}`}
				>
					{loading && <BiLoaderAlt className="absolute text-lg animate-spin" />}
					<span className={loading ? "invisible" : undefined}>
						<FormattedMessage id="settings.account.changeEmail" />
					</span>
				</button>
			</div>
		</form>
	);
};

export default EmailConfirmationForm;
