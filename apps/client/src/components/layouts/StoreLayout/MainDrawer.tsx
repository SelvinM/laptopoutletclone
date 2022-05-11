import { Transition } from "@headlessui/react";
import { MeQuery } from "../../../libs/graphql/operations/user.graphql";
import React, { useState } from "react";
import { BiLogOut, BiMenu, BiX } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import { RemoveScrollBar } from "react-remove-scroll-bar";
import CategoriesMenu from "./CategoriesMenu";
import FocusedView from "../../common/FocusedView";
import GuestUserMenu from "./GuestUserMenu";
import LoggedUserMenu from "./LoggedUserMenu";
import OutsideClickListener from "../../common/OutsideClickListener";
import ReactFocusLock from "react-focus-lock";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import signOutWithCacheClean from "../../../utils/signOutWithCacheClean";
import ThemeToggle from "../../common/ThemeToggle";

interface Props {
	meQuery?: MeQuery;
	loading: boolean;
}

const MainDrawer = ({ meQuery, loading }: Props) => {
	const [hidden, setHidden] = useState(true);
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const client = useApolloClient();
	const [signingOut, setSigningOut] = useState(false);
	const signOut = () => {
		setSigningOut(true);
		signOutWithCacheClean(currentLocale, client);
	};

	return (
		<>
			<button
				className="sm:px-1 xl:px-4 btn link"
				onClick={() => setHidden(!hidden)}
				aria-label="Menú principal"
			>
				<BiMenu className="text-4xl" />
			</button>
			<OutsideClickListener onOutsideClick={() => setHidden(true)}>
				<ReactFocusLock autoFocus={false}>
					<Transition
						show={!hidden}
						enter="transition ease-in duration-200"
						enterFrom="transform opacity-0 -translate-x-full"
						enterTo="transform opacity-100 translate-x-0"
						leave="transition ease-out duration-200"
						leaveFrom="transform opacity-100 translate-x-0"
						leaveTo="transform opacity-0 -translate-x-full"
						className="fixed top-0 left-0 z-50 h-screen opacity-100 w-72 lg:w-84 md:w-78 h sm:w-72 bg-white dark:bg-gray-950  flex flex-col justify-between"
					>
						<div className="overflow-y-auto">
							<RemoveScrollBar />
							<div className="p-4 px-6 md:px-8 xl:px-10 pt-10 bg-gray-100 dark:bg-gray-900">
								<h3 className="text-xl font-medium uppercase dark:text-gray-400">
									<FormattedMessage id="menu" />
								</h3>
								<button
									onClick={() => setHidden(true)}
									className="text-3xl focus:outline-none link absolute top-4 right-4"
									aria-label="Cerrar Menú"
								>
									<BiX />
								</button>
							</div>
							<div>
								<h4 className="text-lg px-6 md:px-8 xl:px-10 pt-6 title">
									<FormattedMessage id="categories" />
								</h4>
								<CategoriesMenu onItemClick={() => setHidden(true)} />
							</div>
							<div className="pb-6 lg:hidden">
								<h4 className="text-lg px-6 md:px-8 xl:px-10 pt-6 title">
									{meQuery?.me ? (
										<span className="w-40 lg:w-72 text-right struncate">
											<FormattedMessage
												id="accountTitle"
												values={{ name: meQuery.me.name }}
											/>
										</span>
									) : (
										<span className="w-40 text-right truncate">
											<FormattedMessage id="account" />
										</span>
									)}
								</h4>
								{meQuery?.me ? (
									<LoggedUserMenu
										isDrawer
										onItemClick={() => setHidden(true)}
									/>
								) : (
									<GuestUserMenu isDrawer loading={loading} />
								)}
							</div>
						</div>
						<div className="sticky bg-white dark:bg-gray-950 bottom-0 dark:border-gray-600 h-16 lg:h-20 border-t flex items-center justify-end px-6 md:px-8 xl:px-10">
							{meQuery?.me ? (
								<>
									<div className="hidden lg:block">
										<ThemeToggle hideButtonText optionsPosition="rightTop" />
									</div>
									<div className="lg:hidden w-full flex items-center justify-between">
										<ThemeToggle hideButtonText optionsPosition="leftTop" />
										<a
											className={`"dark:focus-visible:outline-white btn focus-visible:outline-black flex items-center py-2 h-full cursor-pointer xl:px-10 ${
												signingOut ? "animate-pulse cursor-not-allowed" : ""
											}`}
											onClick={signOut}
											tabIndex={0}
										>
											<BiLogOut className="text-gray-600 dark:text-gray-400" />
											<span className="ml-3">
												{signingOut ? (
													<FormattedMessage id="loggingOut" />
												) : (
													<FormattedMessage id="logout" />
												)}
											</span>
										</a>
									</div>
								</>
							) : (
								<ThemeToggle hideButtonText optionsPosition="rightTop" />
							)}
						</div>
					</Transition>
				</ReactFocusLock>
			</OutsideClickListener>
			<FocusedView show={!hidden} />
		</>
	);
};
export default MainDrawer;
