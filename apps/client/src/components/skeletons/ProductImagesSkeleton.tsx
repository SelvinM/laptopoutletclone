import React from "react";
import Skeleton from "./Skeleton";
import SkeletonBox from "./SkeletonBox";

interface Props {}

const ProductImagesSkeleton = ({}: Props) => {
	return (
		<div className="flex flex-wrap lg:flex-nowrap">
			<div className="lg:order-2 w-full">
				<div className="sm:w-72 sm:h-72 md:h-84 md:w-84 lg:w-98 lg:h-98 xl:w-112 xl:h-112">
					<SkeletonBox />
				</div>
			</div>
			<div className="grid grid-flow-col gap-1 overflow-y-hidden hide-scroll my-2 lg:w-24 lg:h-98 xl:h-112 lg:block md:my-3 lg:my-0 lg:order-1">
				<div className="p-px lg:mb-1 w-12 h-12 lg:w-16 lg:h-16">
					<Skeleton />
				</div>
				<div className="p-px lg:mb-1 w-12 h-12 lg:w-16 lg:h-16">
					<Skeleton />
				</div>
				<div className="p-px w-12 h-12 lg:w-16 lg:h-16">
					<Skeleton />
				</div>
			</div>
		</div>
	);
};

export default ProductImagesSkeleton;
