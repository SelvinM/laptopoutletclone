import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { BiCaretDown } from "react-icons/bi";

interface Props {
	buttonText: string | JSX.Element;
	children: JSX.Element;
	label: string | JSX.Element;
}

const DropdownMenu = ({ buttonText, children, label }: Props) => {
	return (
		<Menu>
			{({ open }) => (
				<div className="relative">
					<div className="inline-flex flex-wrap justify-end items-center">
						<span className="mr-2">{label}:</span>
						<Menu.Button className="btn btn-default shadow-sm px-2 py-1">
							<span>{buttonText}</span>
							<BiCaretDown size={12} className="ml-1" />
						</Menu.Button>
					</div>
					<Transition
						show={open}
						enter="transition ease-in duration-100"
						enterFrom="transform opacity-0 scale-75"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-out duration-100"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-75"
					>
						<Menu.Items
							static
							className="origin-top-right absolute right-0 mt-1 rounded-md shadow-lg z-30 bg-white dark:bg-gray-800 focus:outline-none"
						>
							{children}
						</Menu.Items>
					</Transition>
				</div>
			)}
		</Menu>
	);
};

export default DropdownMenu;
