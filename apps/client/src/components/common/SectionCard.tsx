import React from "react";

interface Props {
	title?: string | JSX.Element;
	children?: string | JSX.Element;
}

const SectionCard = ({ title, children }: Props) => {
	return (
		<div className="bg-white dark:bg-gray-900 xs:rounded-md p-4 sm:p-6 md:p-8 xl:p-12">
			{title && (
				<div className="flex items-center justify-center">
					<div className="flex-auto border-t border-b hidden sm:block h-1 dark:border-gray-600" />
					{title}
					<div className="flex-auto border-t border-b  hidden sm:block h-1 dark:border-gray-600" />
				</div>
			)}
			{children}
		</div>
	);
};

export default SectionCard;
