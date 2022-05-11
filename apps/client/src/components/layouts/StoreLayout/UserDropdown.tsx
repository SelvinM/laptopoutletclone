import React, { FunctionComponent, useState } from "react";

import { BiCaretDown } from "react-icons/bi";
import OutsideClickListener from "../../common/OutsideClickListener";
import LoggedUserMenu from "./LoggedUserMenu";
import DropdownTransition from "../../common/DropdownTransition";

interface Props {
	name: string;
}
const UserDropdown: FunctionComponent<Props> = ({ name }) => {
	const [show, setShow] = useState(false);
	const toggle = () => {
		setShow(!show);
	};
	return (
		<div className="relative inline-block text-left">
			<OutsideClickListener
				onOutsideClick={() => {
					show && setShow(false);
				}}
			>
				<button
					type="button"
					onClick={toggle}
					aria-label="Menú de la cuenta"
					className="btn link"
				>
					<span className="truncate  text-lg max-w-40 xl:max-w-56 text-right">
						{name}
					</span>
					<BiCaretDown size={12} className="ml-1" />
				</button>
				<DropdownTransition show={show}>
					<LoggedUserMenu />
				</DropdownTransition>
			</OutsideClickListener>
		</div>
	);
};

export default UserDropdown;
