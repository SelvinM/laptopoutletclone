import React, { useState } from "react";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import { BiCaretDown } from "react-icons/bi";
import OutsideClickListener from "./OutsideClickListener";
import { Locale } from "@laptopoutlet-packages/types";
import DropdownTransition from "./DropdownTransition";
import getCurrentLocale from "../../utils/getCurrentLocale";

interface Props {
	buttonTextDark?: boolean;
}

const LanguageDropdown = ({ buttonTextDark }: Props) => {
	const [show, setShow] = useState(false);
	const router = useRouter();
	const currentLocale = getCurrentLocale(router.locale);
	const handleLocaleChange = (localeItem: Locale) => {
		setShow(false);
		router.push(router.pathname, router.asPath, { locale: localeItem });
	};
	return (
		<div className="relative inline-block text-left">
			<OutsideClickListener
				onOutsideClick={() => {
					show && setShow(false);
				}}
			>
				<div>
					<button
						type="button"
						onClick={() => {
							setShow(!show);
						}}
						className={`inline-flex justify-center items-center text-xs sm:text-sm focus:outline-none  hover:underline ${
							buttonTextDark ? "" : "text-gray-200"
						}`}
					>
						<FormattedMessage id={`locale.${currentLocale}`} />
						<BiCaretDown size={12} className="ml-1" />
					</button>
				</div>
				<DropdownTransition show={show}>
					<>
						{Object.values(Locale).map((localeItem, index) => (
							<a
								className="option px-4"
								key={index}
								onClick={() => handleLocaleChange(localeItem)}
							>
								<FormattedMessage id={`locale.${localeItem}`} />
							</a>
						))}
					</>
				</DropdownTransition>
			</OutsideClickListener>
		</div>
	);
};

export default LanguageDropdown;
