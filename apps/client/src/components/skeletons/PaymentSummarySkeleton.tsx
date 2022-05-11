import React from "react";
import Skeleton from "./Skeleton";

interface Props {}

const PaymentSummarySkeleton = ({}: Props) => {
	return (
		<div className="flex flex-wrap sm:flex-nowrap">
			<div className="w-full sm:w-10/12 sm:pr-4 text-sm">
				<div className="h-4 mb-2 w-full sm:w-3/4 md:w-56">
					<Skeleton />
				</div>
				<div className="h-4 mb-1 w-2/4  sm:w-1/4">
					<Skeleton />
				</div>
				<div className="h-4 mb-2 w-3/4 sm:w-2/5">
					<Skeleton />
				</div>
			</div>
			<div className="w-full sm:w-2/12 mt-4 sm:mt-0 flex sm:flex-col sm:items-end">
				<div className="w-16 h-3 mr-4 sm:mb-2 sm:mr-0">
					<Skeleton />
				</div>
				<div className="w-16 h-3">
					<Skeleton />
				</div>
			</div>
		</div>
	);
};

export default PaymentSummarySkeleton;
