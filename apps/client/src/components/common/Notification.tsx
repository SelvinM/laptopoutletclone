import { Transition } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { BiX } from "react-icons/bi";
import { zeroRightClassName } from "react-remove-scroll-bar";
import { NotificationType } from "../../types";
import {
	getBackgroundBarClassName,
	getBorderClassName,
	getLinkClassName,
	getTextClassName,
} from "../../utils/notificationClassNames";
import { NotificationIcon } from "./NotificationIcon";
interface Props {
	children?: string | JSX.Element;
	visible?: boolean;
	type?: NotificationType;
	closeAction?: () => void;
	title: string | JSX.Element;
}
const Notification = ({
	children,
	visible,
	closeAction,
	type = "default",
	title,
}: Props) => {
	const containerClassName = getBorderClassName(type);
	const closeClassName = getLinkClassName(type);
	const progressBarClassName = getBackgroundBarClassName(type);
	const iconClassName = getTextClassName(type);
	const [progress, setProgress] = useState<number>(100);
	useEffect(() => {
		if (!visible) setProgress(100);
	}, [visible]);
	useEffect(() => {
		if (visible && closeAction) {
			const myInterval = setInterval(() => {
				if (progress > 0) setProgress((progress) => progress - 0.22);
				if (progress <= 0) {
					clearInterval();
					closeAction();
				}
			}, 7);
			return () => {
				clearInterval(myInterval);
			};
		}
	});
	return (
		<Transition
			show={visible || false}
			enter="transition ease-in duration-300"
			enterFrom="transform opacity-0  translate-x-full"
			enterTo="transform opacity-100  translate-x-0"
			leave="transition ease-in duration-300"
			leaveFrom="transform opacity-100 translate-x-0"
			leaveTo="transform opacity-0 translate-x-full"
			className={`dark:bg-gray-900 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ml-2 mr-2 fixed top-0 mt-40 sm:mt-32 shadow-md sm:mr-4 md:mr-6 lg:mr-16 z-30 right-0 ${containerClassName} ${zeroRightClassName} bg-white border rounded-md`}
		>
			<div className="w-full px-3 pt-3 sm:px-4 sm:pt-4 xl:px-6">
				<div className="bg-gray-100 dark:bg-gray-700" style={{ height: 2 }}>
					{progress < 100 && (
						<div
							className={`${progressBarClassName} h-full`}
							style={{ width: `${progress}%` }}
						/>
					)}
				</div>
			</div>
			<div className="p-3 sm:px-4 sm:pb-4 xl:px-6">
				<div className="flex justify-between items-start">
					<span
						className={`mr-4 ${iconClassName} text-2xl ${
							type === "default" ? "hidden" : ""
						}`}
					>
						<NotificationIcon type={type} />
					</span>
					<div className={!!children ? "pb-3" : undefined}>{title}</div>
					{closeAction && (
						<button
							className={`ml-4 ${closeClassName} focus:outline-none`}
							onClick={closeAction}
						>
							<BiX className="text-2xl" />
						</button>
					)}
				</div>
				<div>{children}</div>
			</div>
		</Transition>
	);
};

export default Notification;
