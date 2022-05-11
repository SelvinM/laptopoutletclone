import { Transition } from "@headlessui/react";
import React, { useState } from "react";
import ReactFocusLock from "react-focus-lock";
import { BiFilter, BiX } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import { RemoveScrollBar, zeroRightClassName } from "react-remove-scroll-bar";
import FocusedView from "../common/FocusedView";
import OutsideClickListener from "../common/OutsideClickListener";

interface Props {
	children?: JSX.Element;
}

const FiltersDrawer = ({ children }: Props) => {
	const [hidden, setHidden] = useState(true);
	return (
		<>
			<button
				type="button"
				onClick={() => setHidden(!hidden)}
				className="btn btn-default px-2 py-1 text-xs sm:text-sm"
			>
				<BiFilter />
				<span className="ml-2">
					<FormattedMessage id="filters" />
				</span>
			</button>
			<OutsideClickListener onOutsideClick={() => setHidden(true)}>
				<ReactFocusLock autoFocus={false}>
					<Transition
						show={!hidden}
						enter="transition ease-in duration-200"
						enterFrom="transform opacity-0 translate-x-full"
						enterTo="transform opacity-100 translate-x-0"
						leave="transition ease-out duration-200"
						leaveFrom="transform opacity-100 translate-x-0"
						leaveTo="transform opacity-0 translate-x-full"
						className={`fixed right-0 ${zeroRightClassName} top-0 z-50 h-screen w-64 lg:w-84 md:w-78 sm:w-72 bg-white dark:bg-gray-950 opacity-100`}
					>
						<div className="max-h-screen overflow-y-auto">
							<RemoveScrollBar noRelative />
							<div className="p-4 px-6 md:px-8 xl:px-10 pt-10 flex items-center bg-gray-100 dark:bg-gray-900 justify-between ">
								<h3 className="text-lg md:text-xl">
									<FormattedMessage id="filters" />
								</h3>
								<button
									onClick={() => setHidden(true)}
									className="text-3xl focus:outline-none link absolute top-4 right-4"
								>
									<BiX />
								</button>
							</div>
							<div className="text-left">{children}</div>
						</div>
					</Transition>
				</ReactFocusLock>
			</OutsideClickListener>
			<FocusedView show={!hidden} />
		</>
	);
};

export default FiltersDrawer;
