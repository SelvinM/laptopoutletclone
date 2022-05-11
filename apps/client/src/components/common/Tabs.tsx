import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Tab } from "../../types";

interface Props {
	children?: JSX.Element | string;
	tabs: Tab[];
}

const Tabs = ({ children, tabs }: Props) => {
	const { pathname } = useRouter();
	return (
		<div className="flex rounded-md">
			<ul className="dark:bg-gray-950 bg-gray-50 w-1/4 z-20 ">
				{tabs.map((tab, index) => (
					<li
						className={` border-b border-l border-t ${
							pathname === tab.href
								? "dark:border-gray-600 -mr-px border-gray-300"
								: "border-transparent "
						}`}
						key={index}
					>
						<Link href={tab.href}>
							<a
								className={`${
									pathname === tab.href
										? "dark:bg-gray-900 dark:text-secondary-200 bg-white  text-secondary-500 mr-px"
										: " dark:text-gray-200 text-primary-500 hover:text-secondary-500 dark:hover:text-secondary-200 "
								} text-right p-4 inline-block w-full font-medium`}
							>
								<span className={pathname === tab.href ? "mr-px" : undefined}>
									{tab.label}
								</span>
							</a>
						</Link>
					</li>
				))}
			</ul>
			<div className="dark:border-gray-600 dark:bg-gray-900 w-3/4 border-b rounded-b-md rounded-r-md rounded-bl-md bg-white border-l border-r border-t">
				{children}
			</div>
		</div>
	);
};

export default Tabs;
