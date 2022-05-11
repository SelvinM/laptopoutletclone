import React from "react";
import { BiRightArrowAlt } from "react-icons/bi";
import Skeleton from "./Skeleton";

interface Props {}

const OrderDetailsPackageItemSkeleton = ({}: Props) => {
	return (
		<div className="divide-y dark:divide-gray-600">
			<div>
				<div className="dark:border-gray-600 p-4 sm:px-8 sm:py-6 border-b items-center grid gap-4 grid-cols-4">
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
								<div className="w-5/12 h-32 sm:w-32 sm:h-32">
									<Skeleton />
								</div>
								<div className="w-7/12 sm:flex-auto">
									<div className="hidden sm:block mb-4">
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
									<div className="space-y-2 sm:space-y-3">
										<div>
											<div className="h-4 w-24">
												<Skeleton />
											</div>
										</div>
										<div className="space-y-1">
											<div className="h-3 w-28">
												<Skeleton />
											</div>
											<div className="h-3 w-24">
												<Skeleton />
											</div>
											<div className="h-3 w-20">
												<Skeleton />
											</div>
											<div className="h-3 w-16">
												<Skeleton />
											</div>
											<div className="h-3 w-20">
												<Skeleton />
											</div>
											<div className="h-3 w-24">
												<Skeleton />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="space-y-2 sm:flex sm:flex-row-reverse sm:items-end sm:space-y-0 sm:space-x-2 sm:space-x-reverse  sm:col-span-full space-x-reverse md:block md:space-x-0 md:space-y-2 md:col-span-1">
								<div className="h-8 w-full sm:w-24 md:w-full">
									<Skeleton />
								</div>
								<div className="h-8 w-full sm:w-24 md:w-full">
									<Skeleton />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailsPackageItemSkeleton;
