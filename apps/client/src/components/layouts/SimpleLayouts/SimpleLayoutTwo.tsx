import Link from "next/link";
import React from "react";
import Image from "next/image";
import logo from "../../../../public/static/logo.png";
import { AiOutlineShoppingCart } from "react-icons/ai";
interface Props {
	children: JSX.Element | string;
	title?: string | JSX.Element;
	hideCartLink?: boolean;
}

const SimpleLayoutTwo = ({ children, title, hideCartLink }: Props) => {
	return (
		<div className="min-h-screen">
			<div className="bg-white dark:bg-gray-900 z-20 py-1.5 shadow-md ">
				<div className="flex items-center justify-between px-3 container h-16 xl:max-w-screen-lg xl:px-0 mx-auto">
					<div className="flex items-center justify-between w-full sm:w-auto">
						<Link href="/">
							<a className="flex items-center relative">
								<div className="w-32 md:w-40 flex items-center relative">
									<div className="absolute w-11/12 h-5 md:h-7 glow m-auto inset-0"></div>
									<Image
										src={logo}
										className="unselectable"
										objectFit="contain"
										width={176}
										height={42}
										priority
										alt={process.env.NEXT_PUBLIC_APP_NAME}
									/>
								</div>
							</a>
						</Link>
						<div className="ml-6 md:ml-8">
							<h1 className="sm:text-xl font-medium">{title}</h1>
						</div>
					</div>
					{!hideCartLink && (
						<Link href="/cart">
							<a className="hidden sm:block ml-3 link" aria-label="Carrito">
								<AiOutlineShoppingCart className="text-4xl" />
							</a>
						</Link>
					)}
				</div>
			</div>
			<div>{children}</div>
		</div>
	);
};

export default SimpleLayoutTwo;
