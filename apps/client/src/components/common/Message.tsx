import { Transition } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { fullWidthClassName } from "react-remove-scroll-bar";
import { NotificationType } from "../../types";
import { getTextClassName } from "../../utils/notificationClassNames";
import { NotificationIcon } from "./NotificationIcon";
interface Props {
	message?: string;
	visible?: boolean;
	type?: NotificationType;
	closeAction?: () => void;
}
const Message = ({
	message,
	visible,
	closeAction,
	type = "default",
}: Props) => {
	const iconClassName = getTextClassName(type);
	const [progress, setProgress] = useState<number>(100);
	useEffect(() => {
		if (!visible) setProgress(100);
	}, [visible]);
	useEffect(() => {
		if (visible && closeAction) {
			const myInterval = setInterval(() => {
				if (progress > 0) setProgress((progress) => progress - 1);
				if (progress === 0) {
					clearInterval();
					closeAction();
				}
			}, 10);
			return () => {
				clearInterval(myInterval);
			};
		}
	});

	return (
		<Transition
			show={visible || false}
			enter="transition ease-in duration-200"
			enterFrom="transform opacity-0  -translate-y-full"
			enterTo="transform opacity-100  translate-y-0"
			leave="transition ease-in duration-200"
			leaveFrom="transform opacity-100"
			leaveTo="transform opacity-0"
			className="fixed z-50 top-0 text-center w-full mt-48 sm:mt-32 left-0"
		>
			<div
				className={`dark:bg-gray-800 inline-flex justify-between ${fullWidthClassName} items-center leading-none shadow-md p-2 rounded-md bg-white`}
			>
				<span className={`${iconClassName} text-xl`}>
					<NotificationIcon type={type} />
				</span>
				<div className="mx-4">
					<span>{message}</span>
				</div>
			</div>
		</Transition>
	);
};

export default Message;
