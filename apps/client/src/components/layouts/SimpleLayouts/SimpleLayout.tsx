import Link from "next/link";
import React from "react";
import FooterSimple from "./FooterSimple";
import Image from "next/image";
import logo from "../../../../public/static/logo.png";

interface Props {
	children: JSX.Element | string;
	hideLegalLinksFromFooter?: boolean;
}

const SimpleLayout = ({ children, hideLegalLinksFromFooter }: Props) => {
	return (
		<div className="min-h-screen justify-between flex flex-col">
			<div>
				<div className="bg-white dark:bg-gray-900 py-1.5 shadow-sm">
					<div className="flex items-center justify-center h-16">
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
					</div>
				</div>
				<div className="container">{children}</div>
			</div>
			<FooterSimple hideLegalLinks={hideLegalLinksFromFooter} />
		</div>
	);
};

export default SimpleLayout;
