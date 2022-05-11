import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

interface Props {
	title?: string | JSX.Element;
	isOpen?: boolean;
	onClose: () => void;
	children?: JSX.Element | JSX.Element[] | string;
	closeDisabled?: boolean;
	hidden?: boolean;
}

const Modal = ({
	title,
	isOpen,
	onClose,
	children,
	closeDisabled,
	hidden,
}: Props) => {
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog
				open={isOpen}
				onClose={closeDisabled ? () => {} : onClose}
				as="div"
				hidden={hidden}
				className={`fixed font-body h-screen w-screen top-0 left-0 z-40 overflow-y-auto flex justify-center items-center`}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<Dialog.Overlay className="absolute h-full w-full bg-tint-500" />
				</Transition.Child>
				<Transition.Child
					as="div"
					enter="transition ease-in duration-200"
					enterFrom="transform opacity-0 "
					enterTo="transform opacity-100"
					leave="transition ease-out duration-200"
					leaveFrom="transform opacity-100"
					leaveTo="transform opacity-0"
					className="z-10 inline-block w-full max-w-md md:max-w-lg lg:max-w-xl p-6 my-8 overflow-hidden bg-white dark:bg-gray-900 rounded-md transform align-middle"
				>
					{title && (
						<Dialog.Title as="h3" className="title text-lg mb-2">
							{title}
						</Dialog.Title>
					)}
					<div className="dark:text-gray-300">{children}</div>
				</Transition.Child>
			</Dialog>
		</Transition>
	);
};

export default Modal;
