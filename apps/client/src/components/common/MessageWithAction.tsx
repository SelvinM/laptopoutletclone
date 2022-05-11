import Link from "next/link";
import React from "react";

type TLink = {
	href: string;
	as?: string;
};

interface Props {
	message: JSX.Element | string;
	action?: () => void;
	buttonLabel: JSX.Element | string;
	link?: TLink;
	icon?: JSX.Element;
}

const MessageWithLink = ({
	message,
	icon,
	action,
	link,
	buttonLabel,
}: Props) => {
	return (
		<div className="p-4 sm:p-8 h-56 sm:h-72 flex flex-col items-center justify-center">
			<span className="flex items-center">
				{icon && (
					<span className="hidden sm:block text-xl sm:text-2xl mr-3">
						{icon}
					</span>
				)}
				<span className="text-center sm:text-lg md:text-xl">{message}</span>
			</span>
			<div className="mt-4">
				{link ? (
					<Link href={link.href} as={link.as}>
						<a className="btn btn-primary capitalize px-4 py-2 text-sm sm:text-base ">
							{buttonLabel}
						</a>
					</Link>
				) : (
					<button
						onClick={action}
						className="btn btn-primary capitalize px-4 py-2 text-sm sm:text-base "
					>
						{buttonLabel}
					</button>
				)}
			</div>
		</div>
	);
};

export default MessageWithLink;
