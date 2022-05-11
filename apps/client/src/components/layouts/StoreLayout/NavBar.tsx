import React, { FunctionComponent } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FormattedMessage } from "react-intl";
import MainDrawer from "./MainDrawer";
import SearchBar from "./SearchBar";
import UserDropdown from "./UserDropdown";
import Link from "next/link";
import Image from "next/image";
import { useGetCartQuery } from "../../../libs/graphql/operations/cart.graphql";
import { useMeQuery } from "../../../libs/graphql/operations/user.graphql";
import getCurrentLocale from "apps/client/src/utils/getCurrentLocale";
import { useRouter } from "next/router";
import { getSignInCallbackUrl } from "apps/client/src/utils/goToSignIn";
import logo from "../../../../public/static/logo.png";
interface Props {}

const NavBar: FunctionComponent<Props> = ({}) => {
	const { locale } = useRouter();
	const { data, loading, error } = useMeQuery();
	const { data: cartData } = useGetCartQuery({
		variables: { locale: getCurrentLocale(locale) },
	});
	error && console.error("meQuery error", error);
	const totalCartItems = cartData?.getCart?.totalQuantity || 0;
	return (
		<>
			{/* <div className="bg-primary-500 dark:bg-gray-950 px-4 md:px-8 flex h-7 justify-center items-center">
				<span className="text-xs sm:text-sm text-gray-200 dark:text-gray-400">
					<FormattedMessage
						id="defaultHeaderMessage"
						values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
					/>
				</span>
			</div> */}
			<div className="md:sticky top-0 md:-mt-px z-30">
				<nav className=" bg-white dark:bg-gray-900 p-3 md:px-8 shadow-md">
					<ul className="flex justify-between flex-wrap">
						<li className="w-1/12 flex items-center">
							<MainDrawer meQuery={data} loading={loading} />
						</li>
						<li className="w-10/12 sm:w-3/12 lg:w-2/12 flex items-center justify-center sm:justify-start">
							<Link href="/">
								<a>
									<div className="w-32 md:w-40 flex items-center relative">
										<div className="absolute w-11/12 h-5 md:h-7 glow m-auto inset-0"></div>
										<Image
											src={logo}
											className="unselectable"
											width={176}
											objectFit="contain"
											height={42}
											priority
											alt={process.env.NEXT_PUBLIC_APP_NAME}
										/>
									</div>
								</a>
							</Link>
						</li>
						<li className="w-1/12 lg:w-3/12  sm:order-3 flex items-center justify-end">
							<div className="hidden lg:block">
								{data?.me ? (
									<UserDropdown name={data.me.name} />
								) : loading ? (
									<span className=" text-lg ml-2 animate-pulse">
										<FormattedMessage id="loading" />
									</span>
								) : (
									<Link href={getSignInCallbackUrl().href}>
										<a className="link text-lg  ml-2">
											<FormattedMessage id="signIn" />
										</a>
									</Link>
								)}
							</div>
							<Link href="/cart">
								<a
									className="px-1 ml-1 md:ml-3 lg:px-4 py-2 relative link"
									aria-label="Carrito"
								>
									<AiOutlineShoppingCart className="text-4xl" />
									<span
										className={`${
											!data?.me ? "hidden" : ""
										} absolute right-0  h-4 text-xs -mr-1 mt-1 lg:mr-1 text-center top-0 rounded-full bg-tertiary-500 text-primary-500 font-medium ${
											totalCartItems < 10 ? "w-5" : "w-6"
										} text-center`}
									>
										{totalCartItems < 100 ? totalCartItems : "+99"}
									</span>
								</a>
							</Link>
						</li>
						<li className="flex w-full items-center mt-2 sm:order-2 sm:w-7/12 lg:w-6/12 sm:mt-0">
							<div className="w-full sm:mx-4">
								<SearchBar />
							</div>
						</li>
					</ul>
				</nav>
			</div>
		</>
	);
};

export default NavBar;
