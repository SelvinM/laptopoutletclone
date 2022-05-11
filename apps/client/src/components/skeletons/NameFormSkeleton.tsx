import React from "react";
import Skeleton from "./Skeleton";

interface Props {}

const NameFormSkeleton = ({}: Props) => {
	return (
		<div className="md:flex max-w-md mx-auto md:mx-0 md:max-w-none">
			<div className="mb-4 md:mb-0 md:mx-0 md:w-1/4 md:flex md:justify-end">
				<div className="h-6 w-2/5 md:w-3/4">
					<Skeleton />
				</div>
			</div>
			<div className="md:w-3/4 md:ml-8">
				<div className="md:max-w-md">
					<div className="mb-2 h-5 w-1/3">
						<Skeleton />
					</div>
					<div className="h-10">
						<Skeleton />
					</div>

					<div className="mt-4">
						<div className="mb-2 h-5 w-1/3">
							<Skeleton />
						</div>
						<div className="h-10">
							<Skeleton />
						</div>
					</div>
					<div className="mt-6 flex justify-end">
						<div className="h-10 w-32">
							<Skeleton />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NameFormSkeleton;
