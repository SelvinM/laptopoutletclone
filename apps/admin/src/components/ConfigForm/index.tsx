import { UploadOutlined } from "@ant-design/icons";
import { ErrorMessage } from "@hookform/error-message";
import {
	Col,
	Form,
	Input,
	message,
	Modal,
	Row,
	Typography,
	Upload,
} from "antd";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import { getBase64 } from "../../utils/getBase64";
const { Title, Text } = Typography;
interface Props {
	control: Control<any>;
	errors: any;
	imageUrl?: string | null;
	setImage: React.Dispatch<React.SetStateAction<UploadFile<any> | undefined>>;
	image?: UploadFile<any> | undefined;
}
const ConfigForm = ({ control, errors, imageUrl, image, setImage }: Props) => {
	const [previewImage, setPreviewImage] = useState<string>();
	const [previewTitle, setPreviewTitle] = useState<string>();
	const [previewVisible, setPreviewVisible] = useState(false);
	const handleCancel = () => {
		setPreviewVisible(false);
	};
	const handlePreview = async (file: UploadFile<any>) => {
		if (!file.url && !file.preview) {
			file.preview = (await getBase64(file.originFileObj as Blob)) as string;
		}
		setPreviewImage(file.url || file.preview);
		setPreviewVisible(true);
		setPreviewTitle(
			file.name || file?.url?.substring(file.url.lastIndexOf("/") + 1)
		);
	};
	const validateImage = (file: RcFile) => {
		if (image?.fileName === file.name) {
			message.error(
				"Una imágen con este nombre ya existe para este producto.",
				DEFAULT_MESSAGE_DURATION
			);
			return false;
		} else {
			return true;
		}
	};
	return (
		<div>
			<Title level={4}>Banner de inicio</Title>
			<Form.Item label="Imagen">
				<Upload
					listType="picture-card"
					accept="image/*"
					onPreview={handlePreview}
					onRemove={() => {
						if (!image) {
							message.destroy();
							message.error(
								"No puedes remover la imagen existente. Solo puedes reemplazarla.",
								DEFAULT_MESSAGE_DURATION
							);
						}
						setImage(undefined);
					}}
					onChange={(e) => {
						setImage(e.fileList[e.fileList.length - 1]);
					}}
					beforeUpload={validateImage}
					fileList={
						image
							? [image]
							: imageUrl
							? [
									{
										size: 0,
										type: "image/*",
										uid: imageUrl,
										url: process.env.NEXT_PUBLIC_BUCKET_BASE_URL + imageUrl,
										thumbUrl:
											process.env.NEXT_PUBLIC_BUCKET_BASE_URL + imageUrl,
										status: "done",
										name: imageUrl,
										// originFileObj: undefined as any,
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
				<Modal
					visible={previewVisible}
					title={previewTitle}
					footer={null}
					onCancel={handleCancel}
				>
					<img alt="example" className="w-100" src={previewImage} />
				</Modal>
			</Form.Item>
			<Row justify="space-between">
				<Col xs={24} md={11}>
					<Form.Item
						required
						label="Título (español)"
						validateStatus={errors.homeBannerTitleEs ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="homeBannerTitleEs"
							rules={{
								required: "Campo requerido",
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="homeBannerTitleEs" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} md={11}>
					<Form.Item
						label="Título (inglés)"
						validateStatus={errors.homeBannerTitleEn ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="homeBannerTitleEn"
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="homeBannerTitleEn" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} md={11}>
					<Form.Item
						required
						label="Mensaje (español)"
						validateStatus={errors.homeBannerMessageEs ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="homeBannerMessageEs"
							rules={{
								required: "Campo requerido",
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="homeBannerMessageEs" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} md={11}>
					<Form.Item
						label="Mensaje (inglés)"
						validateStatus={errors.homeBannerMessageEn ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="homeBannerMessageEn"
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="homeBannerMessageEn" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} sm={11}>
					<Form.Item
						required
						label="Etiqueta del botón (español)"
						validateStatus={
							errors.homeBannerButtonLabelEs ? "error" : undefined
						}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="homeBannerButtonLabelEs"
							rules={{
								required: "Campo requerido",
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="homeBannerButtonLabelEs" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} sm={11}>
					<Form.Item
						label="Etiqueta del botón (inglés)"
						validateStatus={
							errors.homeBannerButtonLabelEn ? "error" : undefined
						}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="homeBannerButtonLabelEn"
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="homeBannerButtonLabelEn" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} sm={11}>
					<Form.Item
						required
						label="Enlace (href)"
						validateStatus={errors.href ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="href"
							rules={{
								required: "Campo requerido",
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="href" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} sm={11}>
					<Form.Item
						label="Enlace (as)"
						validateStatus={errors.as ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="as"
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="as" />
						</Text>
					</Form.Item>
				</Col>
			</Row>
			<Title level={4} className="pt-30px">
				Links de redes sociales
			</Title>
			<Row justify="space-between">
				<Col xs={24} sm={11}>
					<Form.Item
						label="Facebook"
						validateStatus={errors.socialLinkFacebook ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="socialLinkFacebook"
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="socialLinkFacebook" />
						</Text>
					</Form.Item>
				</Col>
				<Col xs={24} sm={11}>
					<Form.Item
						label="Instagram"
						validateStatus={errors.socialLinkInstagram ? "error" : undefined}
					>
						<Controller
							render={({ field }) => <Input {...field} type="text" />}
							name="socialLinkInstagram"
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="socialLinkInstagram" />
						</Text>
					</Form.Item>
				</Col>
			</Row>
		</div>
	);
};

export default ConfigForm;
