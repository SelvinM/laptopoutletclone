import React from "react";
import Card from "../common/Card";
import OrdersListPackageItemSkeleton from "./OrdersListPackageItemSkeleton";
import Skeleton from "./Skeleton";

interface Props {}

const OrderListItemSkeleton = ({}: Props) => {
	return (
		<Card
			title={
				<div className="grid gap-4 grid-cols-4 grid-rows-4">
					<div className="flex flex-col justify-center col-start-1 col-end-5 sm:col-end-3 row-start-1 row-end-2 sm:row-end-3 lg:row-span-full lg:col-span-1">
						<div className="h-5 w-32 mb-1 relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
						<div className="h-5 w-32 relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
					</div>
					<div className="flex flex-col justify-center col-start-1 col-end-5 sm:col-end-3 row-start-2 row-end-3 sm:row-start-3 sm:row-end-5 lg:row-span-full lg:col-span-1">
						<div className="h-5 w-24 mb-1 relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
						<div className="h-5 w-28 relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
					</div>
					<div className="flex flex-col justify-center col-span-full sm:col-span-1 row-start-3 row-end-4 sm:row-start-1 sm:row-end-5 ">
						<div className="h-5 w-24 mb-1 relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
						<div className="h-5 w-28 relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
					</div>
					<div className="row-start-4 row-end-5 sm:row-start-1 sm:row-end-5 col-span-full sm:col-span-1 sm:space-y-2 flex items-center sm:flex-col">
						<div className="h-8 w-1/2 sm:w-full relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
						<div className="h-8 w-1/2 sm:w-full relative">
							<Skeleton />
							<div className="h-full w-full top-0 absolute dark:bg-white-tint-50"></div>
						</div>
					</div>
				</div>
			}
		>
			<div className="divide-y dark:divide-gray-600">
				<OrdersListPackageItemSkeleton />
				<OrdersListPackageItemSkeleton />
			</div>
		</Card>
	);
};

export default OrderListItemSkeleton;
