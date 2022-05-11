import { Listbox, Transition } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { BiCaretUp, BiDesktop, BiMoon, BiSun } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import { Theme } from "../../types";
import { useTheme } from "next-themes";

interface Props {
	hideButtonText?: boolean;
	optionsPosition?: "rightBottom" | "rightTop" | "leftBottom" | "leftTop";
}

const values: Theme[] = Object.values(Theme).reverse();

const ThemeToggle = ({
	hideButtonText,
	optionsPosition = "leftBottom",
}: Props) => {
	const { theme, setTheme } = useTheme();
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);
	const switchTheme = (value: Theme) => {
		if (!isMounted) return;
		setTheme(value);
	};
	if (!isMounted) return null;
	return (
		<Listbox value={theme} as="div" onChange={switchTheme}>
			{({ open }) => (
				<div className="relative ">
					<Listbox.Button className="btn btn-default space-x-2 p-2 flex items-center">
						{theme === Theme.Dark ? (
							<BiMoon />
						) : theme === Theme.Light ? (
							<BiSun />
						) : (
							<BiDesktop />
						)}
						{!hideButtonText && (
							<span>
								<FormattedMessage id={`theme.${theme}`} />
							</span>
						)}
						<BiCaretUp />
					</Listbox.Button>
					<Transition
						show={open}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
						className={`absolute ${
							optionsPosition === "leftBottom"
								? "mt-1"
								: optionsPosition === "rightBottom"
								? "mt-1 right-0"
								: optionsPosition === "leftTop"
								? "mb-10 bottom-0"
								: "mb-10 right-0 bottom-0"
						} w-24 text-sm rounded-md bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-600`}
					>
						<Listbox.Options>
							{values.map((value) => (
								<Listbox.Option key={value} value={value}>
									{({ active }) => (
										<div
											className={`${
												active ? "bg-gray-100 dark:bg-gray-900" : ""
											} select-none p-2 flex items-center space-x-2 `}
										>
											{value === Theme.Dark ? (
												<BiMoon />
											) : value === Theme.Light ? (
												<BiSun />
											) : (
												<BiDesktop />
											)}
											<span className="block truncate">
												<FormattedMessage id={`theme.${value}`} />
											</span>
										</div>
									)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</Transition>
				</div>
			)}
		</Listbox>
	);
};

export default ThemeToggle;
