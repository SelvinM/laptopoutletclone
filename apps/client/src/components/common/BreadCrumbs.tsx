import Link from "next/link";
import React from "react";
import { Crumb } from "../../types";

interface Props {
	crumbs?: Crumb[];
}

const BreadCrumbs = ({ crumbs }: Props) => {
	return (
		<div className="flex text-2xs sm:text-xs md:text-sm flex-wrap ">
			<div>
				<Link href="/">
					<a className="link">{process.env.NEXT_PUBLIC_APP_NAME}</a>
				</Link>
				<div className="mx-2 inline">/</div>
			</div>
			{crumbs?.map((crumb: Crumb, index) => {
				if (index < crumbs.length - 1) {
					return (
						<div key={index}>
							<Link href={crumb.href || ""} as={crumb.as}>
								<a className="link">{crumb.name}</a>
							</Link>
							<div className="mx-2 inline">/</div>
						</div>
					);
				} else {
					return (
						<div key={index} className="font-medium dark:text-gray-400">
							{crumb.name}
						</div>
					);
				}
			})}
		</div>
	);
};

export default BreadCrumbs;
