import React from "react";
import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import {
	useDeleteCategoryImageMutation,
	useUpdateCategoryImageMutation,
} from "../../libs/graphql/operations/category.graphql";
import { UploadFile } from "antd/lib/upload/interface";

interface Props {
	imageUrl?: string | null;
	id: string;
}
const CategoryImageForm = ({ id, imageUrl }: Props) => {
	const [deleteCategoryImage] = useDeleteCategoryImageMutation();
	const [updateCategoryImage] = useUpdateCategoryImageMutation();
	const submit = async (requestOptions: any) => {
		message.loading({ key: "add", content: "Subiendo imagen..." });
		const { data, errors } = await updateCategoryImage({
			variables: { id, image: requestOptions.file },
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

	const onRemove = async () => {
		message.loading({ key: "delete", content: "Borrando imagen..." });
		const { data, errors } = await deleteCategoryImage({
			variables: { id },
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
				listType="picture-card"
				onRemove={onRemove}
				customRequest={submit}
				accept="image/*"
				className="upload-list-inline"
				fileList={
					imageUrl
						? [
								{
									size: 0,
									type: "image/*",
									uid: imageUrl,
									url: process.env.NEXT_PUBLIC_BUCKET_BASE_URL + imageUrl,
									thumbUrl: process.env.NEXT_PUBLIC_BUCKET_BASE_URL + imageUrl,
									status: "done",
									name: imageUrl,
								} as UploadFile<any>,
						  ]
						: undefined
				}
			>
				<div>
					<UploadOutlined />
					<div className="ant-upload-text">Subir</div>
				</div>
			</Upload>
		</div>
	);
};

export default CategoryImageForm;
