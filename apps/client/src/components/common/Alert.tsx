import React from "react";
import { BiX } from "react-icons/bi";
import { NotificationType } from "../../types";
import {
	getBackgroundClassName,
	getBorderClassName,
	getLinkClassName,
	getTextClassName,
} from "../../utils/notificationClassNames";
import { NotificationIcon } from "./NotificationIcon";

interface Props {
	onClose?: () => void;
	message?: string | JSX.Element;
	type: NotificationType;
}

const Alert = ({ onClose, message, type }: Props) => {
	const borderClassName = getBorderClassName(type);
	const backgroundClassName = getBackgroundClassName(type);
	const textClassName = getTextClassName(type);
	const linkClassName = getLinkClassName(type);
	return (
		<div
			className={`w-full border ${borderClassName} ${backgroundClassName} rounded-md p-2`}
		>
			<div className="flex items-start">
				<div className="w-1/12">
					<span className={`${textClassName} text-lg`}>
						<NotificationIcon type={type} />
					</span>
				</div>
				<p className={`flex-auto mx-2  ${textClassName} text-sm`}>{message}</p>
				{onClose && (
					<a
						className={`${linkClassName} text-right cursor-pointer w-1/12`}
						onClick={onClose}
					>
						<BiX size={20} />
					</a>
				)}
			</div>
		</div>
	);
};

export default Alert;
