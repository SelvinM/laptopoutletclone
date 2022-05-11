import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";

interface Props {
	isDrawer?: boolean;
	loading: boolean;
}

const GuestUserMenu = ({ isDrawer, loading }: Props) => {
	return (
		<div>
			{loading ? (
				<div
					className={`option px-6 ${isDrawer ? "px-6 md:px-8 xl:px-10" : ""}`}
				>
					<span className="animate-pulse">
						<FormattedMessage id="loading" />
					</span>
				</div>
			) : (
				<Link href="/signin">
					<a
						className={`option px-6 ${isDrawer ? "px-6 md:px-8 xl:px-10" : ""}`}
					>
						<FormattedMessage id="signIn" />
					</a>
				</Link>
			)}
		</div>
	);
};

export default GuestUserMenu;
