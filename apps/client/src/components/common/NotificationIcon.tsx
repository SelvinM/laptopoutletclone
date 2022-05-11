import React from "react";
import { BiCheckCircle, BiError, BiInfoCircle } from "react-icons/bi";
import { NotificationType } from "../../types";

type Props = {
	type: NotificationType;
};

export const NotificationIcon = ({ type }: Props) => {
	switch (type) {
		case "error":
			return <BiError />;
		case "success":
			return <BiCheckCircle />;
		case "warning":
			return <BiError />;
		case "info":
			return <BiInfoCircle />;
		default:
			return <></>;
	}
};
