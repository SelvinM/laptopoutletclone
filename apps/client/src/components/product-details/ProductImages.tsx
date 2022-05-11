import { Transition } from "@headlessui/react";
import React, { useState } from "react";
import { RemoveScrollBar } from "react-remove-scroll-bar";
import { TImage } from "../../types";
import Image from "next/image";
import ImageViewer from "./ImageViewer";
import { GetProductQuery } from "../../libs/graphql/operations/product.graphql";
import SoldOutImageBadge from "../products/SoldOutImageBadge";
import ReactFocusLock from "react-focus-lock";
import { getRgbDataUrl } from "../../utils/getRgbDataUrl";
import { RGB_PLACEHOLDER } from "../../constants";
interface Props {
	productData: GetProductQuery;
}

const ProductImages = ({ productData }: Props) => {
	const images = productData?.getProduct?.images;
	const [show, setShow] = useState(false);
	const [currentImage, setCurrentImage] = useState<TImage | undefined>(() => {
		if (images) return images[0];
	});

	if (!productData.getProduct) {
		return <></>;
	}

	const openImageViewer = () => {
		setShow(true);
	};

	const closeImageViewer = () => {
		setShow(false);
	};
	const changeImage = (image: TImage) => {
		if (image?.url !== currentImage?.url) {
			setCurrentImage(image);
		}
	};
	return (
		<>
			<Transition
				show={show}
				enter="transition ease-in duration-200"
				enterFrom="transform opacity-0 "
				enterTo="transform opacity-100 "
				leave="transition ease-out duration-200"
				leaveFrom="transform opacity-100 "
				leaveTo="transform opacity-0 "
				className="fixed z-50 top-0 left-0 h-screen w-screen bg-tint-700"
			>
				<ReactFocusLock autoFocus={false}>
					<ImageViewer
						changeImage={changeImage}
						images={images}
						currentImage={currentImage}
						close={closeImageViewer}
					/>
				</ReactFocusLock>
				<RemoveScrollBar />
			</Transition>
			<div className="flex flex-wrap lg:flex-nowrap">
				<div className="lg:order-2 w-full sm:w-72 sm:h-72 md:h-84 md:w-84 lg:w-98 lg:h-98 xl:w-112 xl:h-112 relative">
					{images?.map(
						(image, index) =>
							currentImage?.url === image.url && (
								<Transition
									key={index}
									appear={true}
									show={currentImage?.url === image.url}
									enter="transition ease-in duration-200"
									enterFrom="transform opacity-0 "
									enterTo="transform opacity-100 "
								>
									<Image
										src={
											image.url
												? process.env.NEXT_PUBLIC_BUCKET_URL + image.url
												: "/static/missing-image.png"
										}
										width={620}
										height={620}
										blurDataURL={
											image.placeholder || getRgbDataUrl(RGB_PLACEHOLDER)
										}
										placeholder="blur"
										onClick={() => openImageViewer()}
										alt={productData?.getProduct?.listing.shortTitle}
										className="cursor-zoom-in product-image"
										objectFit="cover"
										objectPosition="top"
									/>
								</Transition>
							)
					)}
					{productData.getProduct.quantity <= 0 && (
						<SoldOutImageBadge showDescription />
					)}
				</div>
				<div className="overflow-x-scroll grid grid-flow-col overflow-y-hidden hide-scroll my-2 lg:w-16 lg:h-98 xl:h-112 lg:overflow-y-scroll lg:block lg:overflow-x-hidden md:my-3 lg:my-0 lg:mr-8 lg:order-1">
					{images?.map((image, index) => (
						<div
							className={`border-2 p-px rounded-md focus:outline-none dark:focus:border-secondary-200 focus:border-primary-500 border-transparent w-12 h-12 lg:w-16 lg:h-16   ${
								index > 0 ? "ml-2 lg:ml-0 lg:mt-2" : ""
							}`}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									changeImage(image);
								}
							}}
							key={index}
						>
							<Image
								width={80}
								height={80}
								objectFit="cover"
								className={`cursor-pointer rounded-md hover:opacity-100 transition-opacity unselectable ${
									currentImage?.url !== image?.url ? "opacity-40" : ""
								} `}
								onClick={() => {
									changeImage(image);
								}}
								src={
									image
										? process.env.NEXT_PUBLIC_BUCKET_URL + image.url
										: "/static/missing-image.png"
								}
								alt={productData.getProduct?.listing.shortTitle}
							/>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default ProductImages;
