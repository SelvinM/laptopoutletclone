import React from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BiCaretDown, BiLoaderAlt } from "react-icons/bi";
interface Props {
	onChange: ((event: React.FormEvent<HTMLDivElement>) => void) &
		((value: number) => void);
	value?: number;
	optionsAmount: number;
	loading: boolean;
	allowRemove?: boolean;
}
const CartQuantityListBox = ({
	onChange,
	value = 0,
	optionsAmount,
	loading,
	allowRemove,
}: Props) => {
	let selectQuantityOptions: JSX.Element[] = [];
	const initialValue = allowRemove ? 0 : 1;
	for (let i = initialValue; i <= optionsAmount; i++) {
		selectQuantityOptions.push(
			<Listbox.Option key={i} value={i}>
				{({ selected, active }) => (
					<div
						className={`${
							active ? "bg-gray-100 dark:bg-gray-900" : ""
						} select-none py-2 px-2 `}
					>
						<span
							className={`${
								selected ? "font-medium" : ""
							} block truncate text-center`}
						>
							{i}
						</span>
					</div>
				)}
			</Listbox.Option>
		);
	}
	return (
		<Listbox as="div" value={value} onChange={onChange}>
			{({ open }) => (
				<>
					<Listbox.Button
						disabled={loading}
						className={` w-12 h-8 px-2 btn justify-between text-left ${
							loading ? "btn-default-disabled" : "btn-default"
						}`}
					>
						<span>
							{loading ? <BiLoaderAlt className="animate-spin " /> : value}
						</span>
						<span className="ml-1">
							<BiCaretDown />
						</span>
					</Listbox.Button>
					<div className="relative ">
						<Transition
							show={open}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
							className="absolute w-16 text-sm mt-1 right-0 rounded-md bg-white dark:bg-gray-800 shadow-lg"
						>
							<Listbox.Options
								static
								className="max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
							>
								{selectQuantityOptions}
							</Listbox.Options>
						</Transition>
					</div>
				</>
			)}
		</Listbox>
	);
};
export default CartQuantityListBox;
