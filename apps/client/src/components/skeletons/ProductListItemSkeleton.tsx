import React from "react";
import Skeleton from "./Skeleton";
import SkeletonBox from "./SkeletonBox";
interface Props {}

const ProductListItemSkeleton = ({}: Props) => {
	return (
		<div className="dark:border-gray-600 border-b py-4 px-8">
			<div className="mb-2 xs:hidden">
				<div className="mb-1 h-4">
					<Skeleton />
				</div>
				<div className="mb-1 h-4">
					<Skeleton />
				</div>
				<div className="h-4 w-3/4">
					<Skeleton />
				</div>
			</div>
			<div className="flex">
				<div className="w-2/5 sm:pt-0 sm:w-48 sm:h-48 xl:w-56 xl:h-56">
					<SkeletonBox />
				</div>
				<div className="w-3/5 sm:w-auto pl-4 md:pl-10 lg:pl-8 flex-auto ">
					<div className="w-16 h-4 xs:mb-2">
						<Skeleton />
					</div>
					<div className="w-full mb-2 hidden xs:block">
						<div className="mb-1 h-6">
							<Skeleton />
						</div>
						<div className="h-6 w-3/4">
							<Skeleton />
						</div>
					</div>
					<div className="h-4 w-24 md:w-32 my-2 xl:my-3">
						<Skeleton />
					</div>

					<div className="h-5 sm:h-6 md:h-7 lg:h-6 xl:h-7 w-24 mb-1">
						<Skeleton />
					</div>
					<div className="h-3 md:h-4 w-20 ">
						<Skeleton />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductListItemSkeleton;
