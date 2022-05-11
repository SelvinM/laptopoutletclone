import React from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BiCheck } from "react-icons/bi";
type ListboxOption = {
	label: string;
	value: string;
	key: string;
};
interface Props {
	onChange: ((event: React.FormEvent<HTMLDivElement>) => void) &
		((value: string) => void);
	value?: string;
	options: ListboxOption[];
	disabled?: boolean;
	label: string | JSX.Element;
}

const ListBox = ({ onChange, value, label, disabled, options }: Props) => {
	if (disabled)
		return (
			<input
				disabled={true}
				className="dark:bg-gray-900 border dark:border-gray-600 dark:placeholder-gray-300 cursor-not-allowed py-1 px-2 input bg-gray-50 placeholder-gray-400"
			/>
		);

	return (
		<Listbox as="div" value={value || ""} onChange={onChange}>
			{({ open }) => (
				<>
					<Listbox.Button className=" py-1 pl-2 pr-6 input text-left relative">
						<span className="block truncate">{label}</span>
						<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
							<svg
								className="dark:text-gray-400 h-5 w-5 text-gray-500"
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor"
							>
								<path
									d="M7 7l3-3 3 3m0 6l-3 3-3-3"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					</Listbox.Button>
					<div className="absolute">
						<Transition
							show={open}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
							className="dark:bg-gray-800 w-full text-sm mt-1 left-0 rounded-md bg-white shadow-lg"
						>
							<Listbox.Options
								static
								className="max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
							>
								{options.map((option) => (
									<Listbox.Option
										key={option.key}
										value={option.value}
										className="focus:outline-none"
									>
										{({ selected, active }) => (
											<div
												className={`${
													active ? "dark:bg-gray-900 bg-gray-100" : ""
												} select-none relative py-2 px-8 `}
											>
												<span
													className={`${selected ? "font-medium" : ""} block`}
												>
													{option.label}
												</span>
												{selected && (
													<span className="dark:text-secondary-200 absolute inset-y-0 text-secondary-500 left-0 flex items-center ml-2">
														<BiCheck className="text-base" />
													</span>
												)}
											</div>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</>
			)}
		</Listbox>
	);
};
export default ListBox;
