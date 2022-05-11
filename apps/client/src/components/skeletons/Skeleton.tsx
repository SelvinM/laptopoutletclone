import React from "react";

interface Props {}
const Skeleton = ({}: Props) => {
	return (
		<span
			className={`w-full h-full block bg-gray-200 dark:bg-gray-800 skeleton-box dark:skeleton-box-dark`}
		/>
	);
};

export default Skeleton;
