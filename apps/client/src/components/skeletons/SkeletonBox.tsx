import React from "react";
import Skeleton from "./Skeleton";

interface Props {}

const SkeletonBox = ({}: Props) => {
	return (
		<div className="inline-block relative w-full">
			<div className="mt-full" />
			<div className="inset-0 absolute h-full">
				<Skeleton />
			</div>
		</div>
	);
};

export default SkeletonBox;
