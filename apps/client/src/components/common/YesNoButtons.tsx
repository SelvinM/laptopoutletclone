import React from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { FormattedMessage } from "react-intl";

interface Props {
	loading?: boolean;
	noAction: () => void;
	yesAction: () => void;
}

const YesNoButtons = ({ loading, noAction, yesAction }: Props) => {
	return (
		<div className="flex justify-end items-center space-x-2">
			<button
				disabled={loading}
				className={`btn px-3 py-1 uppercase ${
					loading ? "btn-default-disabled" : "btn-default"
				}`}
				onClick={noAction}
			>
				<FormattedMessage id="no" />
			</button>
			<button
				className={`btn relative ${
					loading ? "btn-primary-disabled" : "btn-primary"
				} px-3 py-1 uppercase`}
				onClick={yesAction}
				disabled={loading}
			>
				{loading && <BiLoaderAlt className="animate-spin text-lg absolute" />}
				<span className={loading ? "invisible" : undefined}>
					<FormattedMessage id="yes" />
				</span>
			</button>
		</div>
	);
};

export default YesNoButtons;
