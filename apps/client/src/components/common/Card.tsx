import React from "react";

interface Props {
	title?: string | JSX.Element;
	children?: string | JSX.Element;
}

const Card = ({ title, children }: Props) => {
	return (
		<div>
			{title && (
				<div className="border p-4 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 sm:px-8">
					<h3 className="uppercase font-medium">{title}</h3>
				</div>
			)}
			<div
				className={`bg-white dark:bg-gray-900 dark:border-gray-600 ${
					title ? "border-l border-r border-b" : "border"
				}`}
			>
				{children}
			</div>
		</div>
	);
};

export default Card;
