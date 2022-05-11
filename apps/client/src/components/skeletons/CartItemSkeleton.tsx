import React from "react";
import Skeleton from "./Skeleton";

interface Props {}

const CartItemSkeleton = ({}: Props) => {
	return (
		<>
			<div className="mb-4 sm:hidden">
				<div className="mb-1 h-3">
					<Skeleton />
				</div>
				<div className="mb-1 h-3">
					<Skeleton />
				</div>
				<div className="h-3 w-3/4">
					<Skeleton />
				</div>
			</div>
			<div className="flex">
				<div>
					<div className="w-28 xs:w-40 h-28 xs:h-40">
						<Skeleton />
					</div>
				</div>
				<div className="pl-4 flex-auto">
					<div className="w-full mb-2 hidden sm:block">
						<div className="mb-1 h-5">
							<Skeleton />
						</div>
						<div className="h-5 w-3/4">
							<Skeleton />
						</div>
					</div>
					<div className="h-3 w-2/3 sm:w-1/3 sm:h-4 mb-3">
						<Skeleton />
					</div>
					<div className="flex items-start h-5 sm:h-6 w-3/4 sm:w-1/4">
						<Skeleton />
					</div>
				</div>
			</div>
		</>
	);
};

export default CartItemSkeleton;
