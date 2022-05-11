import { Transition } from "@headlessui/react";
import React from "react";

interface Props {
	children?: JSX.Element | string;
	show?: boolean;
}

const DropdownTransition = ({ children, show }: Props) => {
	return (
		<Transition
			show={!!show}
			enter="transition ease-in duration-100"
			enterFrom="transform opacity-0 scale-75"
			enterTo="transform opacity-100 scale-100"
			leave="transition ease-out duration-100"
			leaveFrom="transform opacity-100 scale-100"
			leaveTo="transform opacity-0 scale-75"
		>
			<div className="dark:bg-gray-800 origin-top-right absolute right-0 mt-1 rounded-md shadow-lg z-30 bg-white ">
				<div className="py-1">{children}</div>
			</div>
		</Transition>
	);
};

export default DropdownTransition;
