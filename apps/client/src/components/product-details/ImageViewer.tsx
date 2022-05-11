import { Transition } from "@headlessui/react";
import React from "react";
import { BiCollapse, BiX, BiZoomIn, BiZoomOut } from "react-icons/bi";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Image from "next/image";
import { TImage } from "../../types";
import { getRgbDataUrl } from "../../utils/getRgbDataUrl";
import { RGB_PLACEHOLDER } from "../../constants";
interface Props {
	currentImage?: TImage;
	images?: TImage[] | null;
	close: () => void;
	changeImage: (image: TImage) => void;
}

interface ImageViewerButtonsProps {
	scale: number;
	zoomOut: () => void;
	zoomIn: () => void;
	resetTransform: () => void;
	close: () => void;
}

const ImageViewerButtons = ({
	scale,
	zoomIn,
	zoomOut,
	resetTransform,
	close,
}: ImageViewerButtonsProps) => (
	<>
		<div className="space-x-4 ml-1 mt-1">
			<button
				disabled={scale === 1}
				className={`btn p-1 ${
					scale === 1 ? "btn-default-disabled" : "btn-default"
				}`}
				onClick={zoomOut}
			>
				<BiZoomOut className="text-3xl" />
			</button>
			<button
				disabled={scale === 8}
				className={`btn p-1 ${
					scale === 8 ? "btn-default-disabled" : "btn-default"
				}`}
				onClick={zoomIn}
			>
				<BiZoomIn className="text-3xl" />
			</button>
			<button
				disabled={scale === 1}
				className={`btn p-1 ${
					scale === 1 ? "btn-default-disabled" : "btn-default"
				}`}
				onClick={resetTransform}
			>
				<BiCollapse className="text-3xl" />
			</button>
		</div>

		<button
			className="text-gray-800 focus:ring-1 focus:ring-red-200 mr-1 mt-1 h-8 w-8 btn bg-red-500 hover:bg-red-400 active:bg-red-300 ml-4"
			onClick={close}
		>
			<BiX className="text-2xl" />
		</button>
	</>
);

const ImageViewer = ({ currentImage, images, close, changeImage }: Props) => {
	return (
		<TransformWrapper
			centerOnInit={true}
			centerZoomedOut={true}
			limitToBounds={true}
			initialScale={1}
			initialPositionX={0}
			initialPositionY={0}
			velocityAnimation={{ disabled: true }}
		>
			{({ zoomIn, zoomOut, resetTransform, scale }: any) => {
				return (
					<>
						<div className="h-screen top-0 left-0 flex justify-center overflow-auto">
							<div className="grid grid-cols-4 md:grid-cols-3 gap-8 p-4 sm:p-8 ">
								<div className="col-span-full sm:col-span-3 md:col-span-2">
									<div className="md:hidden justify-between items-center flex pb-4 sm:pb-8">
										<ImageViewerButtons
											close={close}
											resetTransform={() => resetTransform()}
											scale={scale}
											zoomIn={() => zoomIn()}
											zoomOut={() => zoomOut()}
										/>
									</div>
									<div className="mb-8">
										<TransformComponent>
											{images?.map(
												(image, index) =>
													currentImage?.url === image?.url && (
														<Transition
															key={index}
															appear={true}
															show={currentImage?.url === image?.url}
															enter="transition ease-in duration-200"
															enterFrom="transform opacity-0 "
															enterTo="transform opacity-100 "
														>
															<div className="cursor-move">
																<Image
																	src={
																		image?.url
																			? process.env.NEXT_PUBLIC_BUCKET_URL +
																			  image?.url
																			: "/static/missing-image.png"
																	}
																	key={image?.url}
																	width={2048}
																	height={2048}
																	objectFit="contain"
																	objectPosition="top"
																	blurDataURL={
																		image.placeholder ||
																		getRgbDataUrl(RGB_PLACEHOLDER)
																	}
																	placeholder="blur"
																	alt="Product Image"
																	quality={100}
																	className="unselectable"
																/>
															</div>
														</Transition>
													)
											)}
										</TransformComponent>
									</div>
								</div>

								<div className="hidden sm:block">
									<div className="sticky top-8 sm:h-screen overflow-auto">
										<div className="pb-4 hidden justify-between md:flex items-center">
											<ImageViewerButtons
												close={close}
												resetTransform={() => resetTransform()}
												scale={scale}
												zoomIn={() => zoomIn()}
												zoomOut={() => zoomOut()}
											/>
										</div>
										<div className="mx-1 inline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
											{images?.map(
												(image, index) =>
													image && (
														<div
															key={index}
															className="dark:bg-transparent p-0.5 rounded-md overflow-hidden flex items-center dark:focus:ring-secondary-200 ring ring-transparent bg-white focus:outline-none focus:ring-primary-500 "
															onClick={() => {
																if (image?.url !== currentImage?.url) {
																	resetTransform();
																	changeImage(image);
																}
															}}
															tabIndex={1}
														>
															<Image
																objectFit="cover"
																src={
																	image?.url
																		? process.env.NEXT_PUBLIC_BUCKET_URL +
																		  image?.url
																		: "/static/missing-image.png"
																}
																className={` cursor-pointer hover:opacity-100 rounded-md dark:hover:opacity-100 unselectable transition-opacity ${
																	currentImage?.url !== image?.url
																		? "dark:opacity-60 opacity-40 "
																		: ""
																} `}
																alt="Image Thumbnail"
																width={100}
																height={100}
															/>
														</div>
													)
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				);
			}}
		</TransformWrapper>
	);
};

export default ImageViewer;
