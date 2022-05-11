import React from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";

interface Props {
	children: JSX.Element | string;
	wide?: boolean;
}

const StoreLayout = ({ children, wide }: Props) => {
	return (
		<div className="min-h-screen flex flex-col justify-between">
			<div>
				<NavBar />
				<div className={wide ? "" : "container"}>{children}</div>
			</div>
			<div>
				<Footer />
			</div>
		</div>
	);
};

export default StoreLayout;
