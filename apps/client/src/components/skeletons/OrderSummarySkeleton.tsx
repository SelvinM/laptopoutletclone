import React from "react";
import Skeleton from "./Skeleton";

interface Props {}

const InvoiceSummarySkeleton = ({}: Props) => {
	return (
		<>
			<div className="flex justify-between items-center mb-2">
				<div className="h-4 w-24">
					<Skeleton />
				</div>
				<div className="h-4 w-20">
					<Skeleton />
				</div>
			</div>
			<div className="flex justify-between items-center mb-2">
				<div className="h-4 w-24">
					<Skeleton />
				</div>
				<div className="h-4 w-16">
					<Skeleton />
				</div>
			</div>

			<div className="dark:border-gray-600 pt-4 border-t flex justify-between items-center">
				<div className="h-4 w-28">
					<Skeleton />
				</div>
				<div className="h-4 w-24">
					<Skeleton />
				</div>
			</div>
		</>
	);
};

export default InvoiceSummarySkeleton;
