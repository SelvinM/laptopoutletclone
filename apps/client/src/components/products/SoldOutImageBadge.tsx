import React from "react";
import { FormattedMessage } from "react-intl";
type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

interface Props {
	showDescription?: boolean;
	size?: Size;
	descriptionSize?: Size;
}

const SoldOutImageBadge = ({
	showDescription,
	size = "4xl",
	descriptionSize = "lg",
}: Props) => {
	return (
		<div className="absolute h-full text-center dark:bg-tint-500 bg-white-tint-800  w-full top-0 left-0 flex flex-col justify-center">
			<span className={`text-center block font-medium text-${size}`}>
				<FormattedMessage id="soldOut" />
			</span>
			{showDescription && (
				<span
					className={`font-medium text-red-600 dark:text-red-500 text-${descriptionSize}`}
				>
					<FormattedMessage id="soldOut.message" />
				</span>
			)}
		</div>
	);
};

export default SoldOutImageBadge;
