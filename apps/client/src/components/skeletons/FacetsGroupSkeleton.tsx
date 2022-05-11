import React from "react";
import Skeleton from "./Skeleton";

interface Props {}

const FacetsGroupSkeleton = ({}: Props) => {
	return (
		<div className="pt-6">
			<div className="w-1/2 h-3 mb-4">
				<Skeleton />
			</div>
			<div className="w-2/3 h-3 mb-1">
				<Skeleton />
			</div>
			<div className="w-3/4 h-3 mb-1">
				<Skeleton />
			</div>
			<div className="w-1/2 h-3 mb-1">
				<Skeleton />
			</div>
			<div className="w-1/2 h-3">
				<Skeleton />
			</div>
		</div>
	);
};

export default FacetsGroupSkeleton;
