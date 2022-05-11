import { Transition } from "@headlessui/react";
import React from "react";
interface Props {
	show?: boolean;
}
const FocusedView = ({ show }: Props) => {
	return (
		<Transition
			show={show}
			enter="transition-opacity ease-in duration-200"
			enterFrom="transform opacity-0 "
			enterTo="transform opacity-100"
			leave="transition-opacity ease-out duration-200"
			leaveFrom="transform opacity-100"
			leaveTo="transform opacity-0"
			className="fixed h-screen w-screen bg-tint-500 top-0 left-0 z-40"
		/>
	);
};

export default FocusedView;
