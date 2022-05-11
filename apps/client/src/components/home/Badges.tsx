import React from "react";
import { AiFillSafetyCertificate, AiFillTags } from "react-icons/ai";
import { MdLocalShipping } from "react-icons/md";
import { FormattedMessage } from "react-intl";

interface Props {}

const Badges = ({}: Props) => {
	return (
		<div className="border bg-white dark:bg-gray-900 flex flex-wrap dark:border-gray-600">
			<div className="flex items-center w-full md:w-1/3 border-b md:border-b-0 dark:border-gray-600 md:border-r p-4 md:p-8 text-primary-500 dark:text-gray-200">
				<AiFillSafetyCertificate className="text-2xl sm:text-3xl" />
				<span className="text-sm sm:text-xl ml-3 flex-auto text-center">
					<FormattedMessage id="home.badge.warrantyMessage" />
				</span>
			</div>
			<div className="flex items-center w-full md:w-1/3 border-b dark:border-gray-600 md:border-b-0 md:border-r p-4 md:p-8 text-primary-500 dark:text-gray-200">
				<MdLocalShipping className="text-2xl sm:text-3xl" />
				<span className="text-sm sm:text-xl ml-3 flex-auto text-center">
					<FormattedMessage id="home.badge.shippingMessage" />
				</span>
			</div>
			<div className="flex items-center w-full md:w-1/3 p-4 md:p-8 dark:border-gray-600 text-primary-500 dark:text-gray-200">
				<AiFillTags className="text-2xl sm:text-3xl" />
				<span className="text-sm sm:text-xl ml-3 flex-auto text-center">
					<FormattedMessage id="home.badge.pricesMessage" />
				</span>
			</div>
		</div>
	);
};

export default Badges;
