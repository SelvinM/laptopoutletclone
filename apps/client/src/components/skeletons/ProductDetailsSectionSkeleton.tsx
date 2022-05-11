import React from "react";
import Skeleton from "./Skeleton";

interface Props {}

const ProductDetailsSectionSkeleton = ({}: Props) => {
	return (
		<div className="flex flex-col justify-between sm:h-78 md:h-auto lg:min-h-98 xl:min-h-112">
			<div>
				<div className="hidden md:block h-5 w-16 mb-4">
					<Skeleton />
				</div>
				<div className="hidden md:block w-full ">
					<div className=" h-4 lg:h-5 xl:h-6 mb-1">
						<Skeleton />
					</div>
					<div className=" h-4 lg:h-5 xl:h-6 mb-1">
						<Skeleton />
					</div>
					<div className=" h-4 lg:h-5 xl:h-6 mb-1">
						<Skeleton />
					</div>
					<div className=" h-4 lg:h-5 xl:h-6 w-2/3">
						<Skeleton />
					</div>
				</div>
			</div>
			<div className="mt-4 md:hidden h-5 w-16 mb-4">
				<Skeleton />
			</div>
			<div className="md:mt-6 lg:mt-10">
				<div className="w-24 h-4 mb-1">
					<Skeleton />
				</div>
				<div className="w-28 h-4">
					<Skeleton />
				</div>
			</div>
			<div className="mt-10 md:mt-6 lg:mt-10 text-sm lg:text-sm xl:text-base">
				<div className="w-32 h-7">
					<Skeleton />
				</div>
				<div className="h-4 mt-2 w-20">
					<Skeleton />
				</div>
			</div>

			<div className="w-full grid-cols-1 grid lg:grid-cols-2 gap-2  xl:gap-10 mt-8 lg:mt-10 ">
				<div className="w-full h-11 sm:h-8 lg:h-11">
					<Skeleton />
				</div>
				<div className="w-full h-11 sm:h-8 lg:h-11">
					<Skeleton />
				</div>
			</div>
		</div>
	);
};

export default ProductDetailsSectionSkeleton;
