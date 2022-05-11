import { ProductCondition } from "@laptopoutlet-packages/types";
import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
interface Props {
	slug?: string;
	title?: string;
	condition?: ProductCondition;
	imageUrl?: string;
	isLink?: boolean;
	onClick?: () => void;
}

const ItemSummary = ({
	title,
	slug,
	condition,
	imageUrl,
	onClick,
	isLink = false,
}: Props) => {
	const content = (
		<>
			<div className="w-24 h-24">
				<Image
					src={
						imageUrl
							? process.env.NEXT_PUBLIC_BUCKET_URL + imageUrl
							: "/static/missing-image.png"
					}
					alt="title"
					key={imageUrl}
					height={150}
					width={150}
					className="product-image dark:hover:opacity-70"
					objectFit="contain"
				/>
			</div>
			<div className="w-8/12 lg:w-10/12 pl-4">
				<h4 className="truncate-2-lines overflow-hidden text-sm lg:text-base">
					{title}
				</h4>
				<div className="mt-1 sm:my-2 text-xs">
					<span className="font-medium">
						<FormattedMessage id="condition" />:
					</span>
					<span className="ml-1">
						<FormattedMessage id={`condition.${condition}`} />
					</span>
				</div>
			</div>
		</>
	);
	if (isLink)
		return (
			<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
				<a
					className="flex border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 cursor-pointer"
					onClick={onClick}
				>
					{content}
				</a>
			</Link>
		);
	return <div className="flex px-3 py-2">{content}</div>;
};

export default ItemSummary;
