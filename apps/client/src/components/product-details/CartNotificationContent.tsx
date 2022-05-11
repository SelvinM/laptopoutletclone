import React from "react";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { GetProductQuery } from "../../libs/graphql/operations/product.graphql";
interface Props {
	productData: GetProductQuery;
}

const CartNotificationContent = ({ productData }: Props) => {
	return (
		<>
			<div className="mb-2 sm:hidden">
				<h4 className="truncate-2-lines text-sm overflow-hidden ">
					{productData.getProduct?.listing.longTitle}
				</h4>
			</div>

			<div className="flex mb-3">
				<div className="w-24 h-24">
					<Image
						src={
							productData.getProduct?.images?.[0]
								? process.env.NEXT_PUBLIC_BUCKET_URL +
								  productData.getProduct.images[0].url
								: "/static/missing-image.png"
						}
						alt="title"
						key={"NotificationImage"}
						height={300}
						width={300}
						className="product-image dark:hover:opacity-70"
						objectFit="contain"
					/>
				</div>
				<div className="w-8/12 lg:w-10/12 pl-4">
					<div className="hidden sm:block">
						<h4 className="truncate-2-lines overflow-hidden ">
							{productData.getProduct?.listing.longTitle}
						</h4>
					</div>

					<div className="mt-2 text-sm flex flex-wrap">
						<span className="font-medium">
							<FormattedMessage id="condition" />:
						</span>
						<span className="ml-1">
							<FormattedMessage
								id={`condition.${productData.getProduct?.condition}`}
							/>
						</span>
					</div>
				</div>
			</div>
			<div className="text-right">
				<Link href="/cart">
					<a className="btn btn-primary uppercase px-4 py-2 ">
						<AiOutlineShoppingCart className="text-lg" />
						<span className="ml-2">
							<FormattedMessage id="cart.view" />
						</span>
					</a>
				</Link>
			</div>
		</>
	);
};

export default CartNotificationContent;
