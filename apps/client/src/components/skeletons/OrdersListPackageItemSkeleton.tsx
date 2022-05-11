import React from "react";
import { BiRightArrowAlt } from "react-icons/bi";
import Skeleton from "./Skeleton";
import SkeletonBox from "./SkeletonBox";

interface Props {}

const OrdersListPackageItemSkeleton = ({}: Props) => {
	return (
		<div className="divide-y dark:divide-gray-600">
			<div>
				<div className=" p-4 sm:px-8 sm:py-6 items-center grid gap-4 grid-cols-4">
					<div className="col-span-full sm:col-span-3 flex items-center space-x-4">
						<span className="h-5 w-20">
							<Skeleton />
						</span>
						<BiRightArrowAlt className="text-xl" />
						<div className="ml-2 h-5 w-20">
							<Skeleton />
						</div>
					</div>
				</div>
				<div className="divide-y dark:divide-gray-600 divide-dashed">
					<div className="p-4 sm:px-8 sm:py-6">
						<div className="grid gap-4 sm:grid-cols-4">
							<div className="sm:hidden col-span-full">
								<div className="h-4 mb-1">
									<Skeleton />
								</div>
								<div className="h-4 mb-1">
									<Skeleton />
								</div>
								<div className="w-3/4 h-4">
									<Skeleton />
								</div>
							</div>
							<div className="flex space-x-4 sm:space-x-8 col-span-full md:col-span-3">
								<div className="w-5/12 sm:w-52 sm:h-52">
									<SkeletonBox />
								</div>
								<div className="w-7/12 sm:flex-auto">
									<div className="hidden sm:block mb-4">
										<div className="h-4 mb-1">
											<Skeleton />
										</div>
										<div className="w-3/4 h-4">
											<Skeleton />
										</div>
									</div>
									<div className="space-y-2 sm:space-y-3">
										<div>
											<div className="mb-1 h-4 w-24">
												<Skeleton />
											</div>
											<div className="h-4 w-20">
												<Skeleton />
											</div>
										</div>
										<div>
											<div className="hidden sm:block h-5 w-28">
												<Skeleton />
											</div>
											<div className="h-6 mt-1 w-20">
												<Skeleton />
											</div>
										</div>
										<div className="h-8 sm:h-6 w-24 md:hidden mt-1">
											<Skeleton />
										</div>
									</div>
								</div>
							</div>
							<div className="hidden md:block  h-8 w-full">
								<Skeleton />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrdersListPackageItemSkeleton;
