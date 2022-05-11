import { Storage } from "@google-cloud/storage";
import { Image } from "@laptopoutlet-packages/models";
import { getPlaceholder } from "@laptopoutlet-packages/placeholder";
import { Stream } from "stream";
type UploadProductImagesParams = {
	id: string;
	images?: any[] | null;
	startingIndex?: number;
};
async function stream2buffer(stream: Stream): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const _buf = Array<any>();
		stream.on("data", (chunk) => _buf.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(_buf)));
		stream.on("error", (err) => reject(`error converting stream - ${err}`));
	});
}
const bucketname =
	process.env.NODE_ENV === "production" ? "laptopoutlet" : "laptopoutlet-test";
const privateKey = Buffer.from(
	process.env.GOOGLE_PRIVATE_KEY || "",
	"base64"
).toString();
const gc = new Storage({
	credentials: {
		private_key: privateKey,
		client_email: process.env.GOOGLE_CLIENT_EMAIL,
	},
	projectId: process.env.GOOGLE_PROJECT_ID,
});
export const uploadProductImages = async ({
	id,
	images,
}: UploadProductImagesParams) => {
	const imageReferences: Image[] = [];
	try {
		const bucket = gc.bucket(bucketname);
		const promises = images?.map(async (upload) => {
			const { createReadStream, filename } = await upload;
			const stream = createReadStream();
			const imgFile = bucket.file(`product-images/${id}/${filename}`);
			if (!imgFile.id) throw new Error("Error al agregar imágen");
			const buffer = await stream2buffer(createReadStream());
			const { base64 } = await getPlaceholder(buffer, { size: 10 });
			imageReferences.push({
				url: imgFile.id,
				filename,
				placeholder: base64,
			});
			return new Promise((resolve, reject) => {
				stream
					.on("error", (error: any) => {
						console.log("error", JSON.stringify(error, null, 2));
					})
					.pipe(imgFile.createWriteStream({ resumable: false }))
					.on("error", reject)
					.on("finish", resolve);
			});
		});
		await Promise.all(promises || []);
		return imageReferences;
	} catch (error) {
		console.log("error", JSON.stringify(error, null, 2));
		throw new Error("Error al agregar imágen");
	}
};

export const deleteProductImageFromBucket = async (
	id: string,
	filename?: string
) => {
	try {
		const bucket = gc.bucket(bucketname);
		if (!!filename) {
			await bucket.deleteFiles({
				prefix: `product-images/${id}/${filename}`,
			});
		} else {
			await bucket.deleteFiles({
				prefix: `product-images/${id}`,
			});
		}
		return true;
	} catch (error) {
		console.log("error", JSON.stringify(error, null, 2));
		return false;
	}
};

type UploadCategoryImageParams = {
	id: string;
	upload?: any;
};

export const uploadCategoryImage = async ({
	id,
	upload,
}: UploadCategoryImageParams) => {
	if (!!upload) {
		try {
			const bucket = gc.bucket(bucketname);
			let stream: any = null;
			let filename = "";
			const { originFileObj } = upload;
			if (!!originFileObj) {
				const { createReadStream, filename: oldFilename } = await originFileObj;
				filename = oldFilename;
				stream = createReadStream();
			} else {
				const { createReadStream, filename: oldFilename } = await upload;
				filename = oldFilename;
				stream = createReadStream();
			}
			const imgFile = bucket.file(`category-images/${id}/${filename}`);
			if (!imgFile.id) throw new Error("Error al agregar imágen");
			const imageUrl = imgFile.id;
			const uploadStream = new Promise((resolve, reject) => {
				stream
					.on("error", (error: any) => {
						console.log("error", JSON.stringify(error, null, 2));
					})
					.pipe(imgFile.createWriteStream({ resumable: false }))
					.on("error", reject)
					.on("finish", resolve);
			});
			await uploadStream;
			return imageUrl;
		} catch (error) {
			console.log("error", JSON.stringify(error, null, 2));
		}
	}
};

export const deleteCategoryImageFromBucket = async (id: string) => {
	try {
		const bucket = gc.bucket(bucketname);
		await bucket.deleteFiles({
			prefix: `category-images/${id}`,
		});
		return true;
	} catch (error) {
		console.log("error", JSON.stringify(error, null, 2));
		return false;
	}
};

export const deleteHomeBannerImageFromBucket = async () => {
	try {
		const bucket = gc.bucket(bucketname);
		await bucket.deleteFiles({
			prefix: `home-banner`,
		});
		return true;
	} catch (error) {
		console.log("error", JSON.stringify(error, null, 2));
		return false;
	}
};

export const uploadHomeBannerImage = async ({ upload }: { upload: any }) => {
	if (!!upload) {
		try {
			const { originFileObj } = upload;
			let uploadObj: any;
			if (originFileObj) uploadObj = originFileObj;
			else uploadObj = upload;
			const bucket = gc.bucket(bucketname);
			const { createReadStream, filename } = await uploadObj;
			const stream = createReadStream();
			const buffer = await stream2buffer(createReadStream());
			const { base64 } = await getPlaceholder(buffer, { size: 10 });
			const imgFile = bucket.file(`home-banner/${filename}`);
			if (!imgFile.id) throw new Error("Error al agregar imágen");
			const uploadStream = new Promise((resolve, reject) => {
				stream
					.on("error", (error: any) => {
						console.log("error", JSON.stringify(error, null, 2));
					})
					.pipe(imgFile.createWriteStream({ resumable: false }))
					.on("error", reject)
					.on("finish", resolve);
			});
			await uploadStream;
			return { imageUrl: imgFile.id, placeholder: base64 };
		} catch (error) {
			console.log("error", JSON.stringify(error, null, 2));
		}
	}
};
