import Modal from "../common/Modal";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useRouter } from "next/router";
import { MessageContext } from "../../contexts/MessageContextProvider";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useDeleteUserAddressMutation } from "../../libs/graphql/operations/user.graphql";
import { translateCountry } from "@laptopoutlet-packages/utils";
import YesNoButtons from "../common/YesNoButtons";
interface Props {
	id?: string;
	addressLine1?: string;
	city?: string;
	country?: string;
	firstname?: string;
	lastname?: string;
	province?: string;
	addressLine2?: string | null;
	phone?: string;
	zipcode?: string;
	closeAction: () => void;
	visible?: boolean;
}
type Data = {
	addressLine1?: string;
	city?: string;
	country?: string;
	firstname?: string;
	lastname?: string;
	province?: string;
	addressLine2?: string | null;
	phone?: string;
	zipcode?: string;
};
const DeleteAddressModal = ({
	closeAction,
	id,
	visible,
	addressLine1,
	addressLine2,
	city,
	country,
	firstname,
	lastname,
	phone,
	province,
	zipcode,
}: Props) => {
	const { setMessageType, setMessage, setMessageVisible } =
		useContext(MessageContext);
	const [deleteUserAddress, { loading: loadingDelete }] =
		useDeleteUserAddressMutation();
	const [data, setData] = useState<Data>({});
	const { formatMessage } = useIntl();
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	useEffect(() => {
		const newData = {
			addressLine1,
			addressLine2,
			city,
			country,
			firstname,
			lastname,
			phone,
			province,
			zipcode,
		};
		if (!data.addressLine1) setData(newData);
		if (data?.addressLine1 && addressLine1) setData(newData);
	}, [addressLine1]);
	const handleDelete = async () => {
		if (!id) return;
		const { data: dataDelete } = await deleteUserAddress({
			variables: {
				addressID: id,
				locale: currentLocale,
			},
		});
		if (dataDelete?.deleteUserAddress.__typename === "GeneralError") {
			setMessageType("error");
			setMessage(dataDelete.deleteUserAddress.message);
			setMessageVisible(true);
		}
		if (dataDelete?.deleteUserAddress.__typename === "User") {
			setMessage(formatMessage({ id: "address.deleteSuccess" }));
			setMessageType("success");
			setMessageVisible(true);
		}
		closeAction();
	};
	return (
		<Modal
			title={
				<FormattedMessage id="settings.addresses.removeConfirmation.message" />
			}
			isOpen={visible}
			onClose={closeAction}
			closeDisabled={loadingDelete}
		>
			<>
				<div className="sm:mb-4">
					<span>{`${data?.firstname} ${data?.lastname}`}</span>
					<p className=" text-sm truncate-2-lines overflow-hidden ">
						{data?.addressLine1}
					</p>
					<span className="text-sm  block truncate">{data?.addressLine2}</span>
					<span className="text-sm mb-1 block truncate">{`${data?.city}, ${
						data?.province
					}, ${translateCountry({
						code: data?.country,
						locale: currentLocale,
					})}, ${data?.zipcode}`}</span>
					<span className="text-sm block truncate">{data?.phone}</span>
				</div>
				<YesNoButtons
					loading={loadingDelete}
					noAction={closeAction}
					yesAction={handleDelete}
				/>
			</>
		</Modal>
	);
};

export default DeleteAddressModal;
