import React from "react";
import { Upload, message } from "antd";
import { UploadFile, RcFile } from "antd/lib/upload/interface";
import { PlusOutlined } from "@ant-design/icons";
import {
	useDeleteProductImageMutation,
	useAddProductImagesMutation,
} from "../../libs/graphql/operations/product.graphql";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import { Image } from "@laptopoutlet-packages/models";
interface Props {
	images: Image[];
	id: string;
}
const ProductImagesForm = ({ id, images }: Props) => {
	const [deleteProductImage] = useDeleteProductImageMutation();
	const [addProductImages] = useAddProductImagesMutation();
	const submit = async (requestOptions: any) => {
		message.loading({ key: "add", content: "Subiendo imagen..." });
		const { data, errors } = await addProductImages({
			variables: { id, images: [requestOptions.file] },
		});
		if (!data || errors) {
			message.error({
				key: "add",
				content: "Ocurrio un error al agregar la imágen.",
				duration: DEFAULT_MESSAGE_DURATION,
			});
			return false;
		} else {
			message.success({
				key: "add",
				content: "Imagen agregada con exito.",
				duration: DEFAULT_MESSAGE_DURATION,
			});
			return true;
		}
	};
	const validateImage = (file: RcFile) => {
		if (images.some((item) => item.filename === file.name)) {
			message.error(
				"Una imágen con este nombre ya existe para este producto.",
				DEFAULT_MESSAGE_DURATION
			);
			return false;
		} else {
			return true;
		}
	};
	const onRemove = async (file: UploadFile<any>) => {
		message.loading({ key: "delete", content: "Borrando imagen..." });
		const { data, errors } = await deleteProductImage({
			variables: { filename: file.name, id },
		});
		if (!data || errors) {
			message.error({
				key: "delete",
				content: "Ocurrió un error al borrar la imágen.",
				duration: DEFAULT_MESSAGE_DURATION,
			});
			return false;
		} else {
			message.success({
				key: "delete",
				content: "Imagen borrada con exito.",
				duration: DEFAULT_MESSAGE_DURATION,
			});
			return true;
		}
	};

	return (
		<div>
			<Upload
				fileList={images.map(
					(image) =>
						({
							size: 0,
							type: "image/*",
							uid: image.url,
							url: process.env.NEXT_PUBLIC_BUCKET_BASE_URL + image.url,
							status: "done",
							name: image.filename,
						} as UploadFile<any>)
				)}
				listType="picture-card"
				onRemove={onRemove}
				accept="image/*"
				progress={{ successPercent: 50 }}
				beforeUpload={validateImage}
				customRequest={submit}
			>
				<div>
					<PlusOutlined />
					<div className="ant-upload-text">Subir</div>
				</div>
			</Upload>
		</div>
	);
};

export default ProductImagesForm;
