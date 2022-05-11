import { getBase64, TGetBase64Return } from "./src/base64";
import {
	getImage,
	TGetImageSrc,
	IGetImageOptions,
	IGetImageReturn,
} from "./src/get-image";

export type TGetPlaiceholderSrc = TGetImageSrc;
export interface IGetPlaiceholderOptions extends IGetImageOptions {}
export interface IGetPlaiceholderReturn extends Pick<IGetImageReturn, "img"> {
	base64: TGetBase64Return;
}

export interface IGetPlaiceholder {
	(
		src: TGetPlaiceholderSrc,
		options?: IGetPlaiceholderOptions
	): Promise<IGetPlaiceholderReturn>;
}

export const getPlaceholder: IGetPlaiceholder = async (src, options) => {
	const imageData = await getImage(src, options);
	const base64 = getBase64(imageData);
	return {
		img: imageData.img,
		base64,
	};
};
