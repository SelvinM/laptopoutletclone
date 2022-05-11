import { useApolloClient } from "@apollo/client";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import signOutWithCacheClean from "../../../utils/signOutWithCacheClean";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { AiOutlineSetting, AiOutlineShoppingCart } from "react-icons/ai";
import { BiClipboard, BiLogOut } from "react-icons/bi";
import { FormattedMessage } from "react-intl";

interface Props {
	isDrawer?: boolean;
	onItemClick?: () => void;
}

const LoggedUserMenu = ({ isDrawer, onItemClick }: Props) => {
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const client = useApolloClient();
	const [signingOut, setSigningOut] = useState(false);
	const signOut = async () => {
		setSigningOut(true);
		await signOutWithCacheClean(currentLocale, client);
	};
	return (
		<div>
			<Link href="/cart">
				<a
					onClick={onItemClick}
					className={`option px-6 ${isDrawer ? "md:px-8 xl:px-10" : ""}`}
				>
					<AiOutlineShoppingCart className="text-gray-600 dark:text-gray-400" />
					<span className="pl-4">
						<FormattedMessage id="cart" />
					</span>
				</a>
			</Link>
			<Link href="/orders">
				<a
					onClick={onItemClick}
					className={`option px-6 ${isDrawer ? "md:px-8 xl:px-10" : ""}`}
				>
					<BiClipboard className="text-gray-600 dark:text-gray-400" />
					<span className="pl-4 capitalize">
						<FormattedMessage id="orders" />
					</span>
				</a>
			</Link>
			<Link href="/settings/account">
				<a
					onClick={onItemClick}
					className={`option px-6 ${isDrawer ? "md:px-8 xl:px-10" : ""}`}
				>
					<AiOutlineSetting className="text-gray-600 dark:text-gray-400" />
					<span className="pl-4">
						<FormattedMessage id="settings" />
					</span>
				</a>
			</Link>
			<div className={isDrawer ? "hidden" : "border-t dark:border-gray-600"}>
				<a
					className={`option relative px-6 cursor-pointer ${
						signingOut
							? "animate-pulse cursor-not-allowed hover:bg-white dark:hover:bg-gray-700"
							: ""
					}`}
					onClick={signOut}
				>
					<BiLogOut className="text-gray-600 dark:text-gray-400" />
					<span className="pl-4">
						{signingOut ? (
							<FormattedMessage id="loggingOut" />
						) : (
							<FormattedMessage id="logout" />
						)}
					</span>
				</a>
			</div>
		</div>
	);
};

export default LoggedUserMenu;
