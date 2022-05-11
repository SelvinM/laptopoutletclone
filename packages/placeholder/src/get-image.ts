import path from "path";
import NodeCache from "node-cache";
import fetch from "node-fetch";
import sizeOf from "image-size";
import sharp from "sharp";

const arrayChunk: any = (arr: any[], size: number) =>
	arr.length > size
		? [arr.slice(0, size), ...arrayChunk(arr.slice(size), size)]
		: [arr];

type TImage = Buffer | string;

/* getImageSize
   =========================================== */

type TGetImageSizeParam = TImage;
interface IGetImageSizeReturn {
	height: number;
	width: number;
	type?: string;
}

interface IGetImageSize {
	(file: TGetImageSizeParam): IGetImageSizeReturn;
}

const getImageSize: IGetImageSize = (file) => {
	const { width, height, type } = sizeOf(file);
	if (!width || !height) throw new Error("Width o height es undefined");
	return {
		width,
		height,
		type,
	};
};

/* loadImage
   =========================================== */

const remoteImageCache = new NodeCache();

interface ILoadRemoteImage {
	(src: string): Promise<Buffer>;
}

const loadRemoteImage: ILoadRemoteImage = async (src) => {
	const cachedImage = remoteImageCache.get(src);

	if (typeof cachedImage === "undefined") {
		const response = await fetch(src);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		remoteImageCache.set(src, buffer);
		return buffer;
	}

	if (!Buffer.isBuffer(cachedImage))
		throw Error(`Cached value for ${src} is invalid.`);

	return cachedImage;
};

interface ILoadImageImg extends IGetImageSizeReturn {
	src: string | null;
}
interface ILoadImageReturn {
	img: ILoadImageImg;
	file: TImage;
}

interface ILoadImage {
	(imagePath: TImage): Promise<ILoadImageReturn>;
}

const loadImage: ILoadImage = async (imagePath) => {
	if (Buffer.isBuffer(imagePath)) {
		const imageSize = getImageSize(imagePath);

		return {
			file: imagePath,
			img: {
				src: null,
				...imageSize,
			},
		};
	}

	if (imagePath.startsWith("http")) {
		const buffer = await loadRemoteImage(imagePath);
		const imageSize = getImageSize(buffer);

		return {
			file: buffer,
			img: {
				src: imagePath,
				...imageSize,
			},
		};
	}

	if (!imagePath.startsWith("/"))
		throw new Error(
			`Failed to parse src \"${imagePath}\", if using relative image it must start with a leading slash "/"`
		);

	const file = path.join("./public/", imagePath);
	const imageSize = getImageSize(file);

	return {
		file,
		img: {
			src: imagePath,
			...imageSize,
		},
	};
};

/* optimizeImage
   =========================================== */

interface IOptimizeImageOptions {
	size?: number;
}
interface IOptimizeImageReturn {
	data: Buffer;
	info: sharp.OutputInfo;
	rawBuffer: number[];
	rows: number[][][];
}

interface IOptimizeImage {
	(src: TImage, options?: IOptimizeImageOptions): Promise<IOptimizeImageReturn>;
}

const optimizeImage: IOptimizeImage = async (src, options = { size: 4 }) => {
	if (!options.size) throw Error("size no existe");
	const sizeMin = 4;
	const sizeMax = 64;

	const isSizeValid = sizeMin <= options.size && options.size <= sizeMax;
	!isSizeValid &&
		console.error(
			["Please enter a `size` value between", sizeMin, "and", sizeMax].join(" ")
		);

	const size = isSizeValid ? options.size : 4;

	const base64data = await sharp(src)
		.resize(size, size, {
			fit: "inside",
		})
		.rotate()
		.clone()
		.normalise()
		.modulate({ saturation: 1.2, brightness: 1 })
		.removeAlpha()
		.toBuffer({ resolveWithObject: true });

	const { channels, width } = base64data.info;
	const rawBuffer = [].concat(...(base64data.data as any)) as number[];
	const pixels = arrayChunk(rawBuffer, channels);
	const rows = arrayChunk(pixels, width);
	return {
		...base64data,
		rawBuffer,
		rows,
	};
};

/* getImage
   =========================================== */

export type TGetImageSrc = TImage;
export interface IGetImageOptions extends IOptimizeImageOptions {}
export interface IGetImageReturn
	extends Omit<ILoadImageReturn, "file">,
		IOptimizeImageReturn {}

export interface IGetImage {
	(src: TGetImageSrc, options?: IGetImageOptions): Promise<IGetImageReturn>;
}

export const getImage: IGetImage = async (src, options) => {
	const { file, img } = await loadImage(src);
	const optimized = await optimizeImage(file, options);
	return {
		img,
		...optimized,
	};
};
