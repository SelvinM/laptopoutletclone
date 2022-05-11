import { ErrorMessage } from "@hookform/error-message";
import {
	MeQuery,
	useUpdateUserNameMutation,
} from "../../libs/graphql/operations/user.graphql";
import React, { useEffect } from "react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import { MessageContext } from "../../contexts/MessageContextProvider";
import { getNameRules } from "../../utils/formValidationRules";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";

interface Props {
	dataMe?: MeQuery;
}
interface FormFields {
	name: string;
	surname: string;
}
const NameForm = ({ dataMe }: Props) => {
	const {
		register,
		formState: { errors },
		setValue,
		handleSubmit,
	} = useForm<FormFields>({
		defaultValues: { name: "", surname: "" },
	});
	const { setMessageType, setMessage, setMessageVisible } =
		useContext(MessageContext);
	const { formatMessage } = useIntl();
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const [updateUserName, { loading: loadingUpdate }] =
		useUpdateUserNameMutation();

	useEffect(() => {
		dataMe?.me?.name && setValue("name", dataMe?.me?.name);
		dataMe?.me?.surname && setValue("surname", dataMe.me.surname);
	}, [dataMe?.me?.name, dataMe?.me?.surname]);

	const submitNameChange = async ({ name, surname }: FormFields) => {
		setMessageVisible(false);
		if (
			dataMe?.me?.name === name.trim() &&
			dataMe.me.surname === surname.trim()
		) {
			setMessageType("info");
			setMessage(
				formatMessage({ id: "settings.account.updateSameValueMessage" })
			);
			setMessageVisible(true);
			return;
		}
		const { data } = await updateUserName({
			variables: { name, surname, locale: currentLocale },
		});
		if (data?.updateUserName.__typename === "GeneralError") {
			setMessageType("error");
			setMessage(data.updateUserName.message);
			setMessageVisible(true);
		}
		if (data?.updateUserName.__typename === "User") {
			setMessageType("success");
			setMessage(formatMessage({ id: "settings.account.nameChangeSuccess" }));
			setMessageVisible(true);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(submitNameChange)}
			className="md:flex max-w-md mx-auto md:mx-0 md:max-w-none"
		>
			<div className="mb-4 md:mb-0 md:mx-0 md:w-1/4 ">
				<h3 className="font-medium md:text-right">
					<FormattedMessage id="settings.account.name" />
				</h3>
			</div>
			<div className="md:w-3/4 md:ml-8">
				<div className="md:max-w-md">
					<div>
						<label className="mb-2 block text-sm">
							<FormattedMessage id="user.name" />
						</label>

						<input
							className="input border w-full py-2 px-2"
							maxLength={26}
							{...register("name", getNameRules())}
						/>

						<span className="text-red-600 dark:text-red-500  block text-sm">
							<ErrorMessage errors={errors} name="name" />
						</span>
					</div>
					<div className="mt-4">
						<label className="mb-2 block text-sm">
							<FormattedMessage id="user.surname" />
						</label>
						<input
							className="input border w-full py-2 px-2"
							maxLength={26}
							{...register("surname", getNameRules())}
						/>
						<span className="text-red-600 dark:text-red-500  block text-sm">
							<ErrorMessage errors={errors} name="surname" />
						</span>
					</div>
					<div className="mt-6 text-right">
						<button
							type="submit"
							disabled={loadingUpdate}
							className={`btn ${
								loadingUpdate ? "btn-primary-disabled" : "btn-primary"
							} px-3 py-2 justify-center relative`}
						>
							{loadingUpdate && (
								<BiLoaderAlt className=" absolute text-xl animate-spin" />
							)}
							<span className={loadingUpdate ? "invisible" : undefined}>
								<FormattedMessage id="settings.account.changeName" />
							</span>
						</button>
					</div>
				</div>
			</div>
		</form>
	);
};

export default NameForm;
