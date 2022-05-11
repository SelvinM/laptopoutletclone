import { FileImageOutlined } from "@ant-design/icons";
import { ErrorMessage } from "@hookform/error-message";
import { ICategoryFullTranslations } from "@laptopoutlet-packages/models";
import {
	Button,
	Col,
	Form,
	Input,
	message,
	Modal,
	Row,
	TreeSelect,
	Typography,
	Upload,
} from "antd";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import { GetCategoriesQuery } from "../../libs/graphql/operations/category.graphql";
import { transformCategoriesForTreeSelect } from "../../utils/categoryDataHelpers";
import { getBase64 } from "../../utils/getBase64";
import WrappedSwitch from "../WrappedSwitch";

interface Props {
	control: Control<any>;
	errors: any;
	setImage?: React.Dispatch<React.SetStateAction<UploadFile | undefined>>;
	image?: UploadFile | undefined;
	isEdit?: boolean;
	dataCategories?: GetCategoriesQuery;
}
const { Text } = Typography;
const CategoryForm = ({
	control,
	errors,
	setImage,
	dataCategories,
	isEdit,
	image,
}: Props) => {
	const normFile = (e: any) => {
		if (Array.isArray(e)) {
			return e;
		}
		return e && e.fileList;
	};
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
	const treeDataCategories = transformCategoriesForTreeSelect(
		dataCategories?.getCategories?.filter(
			(category) => !category?.isOptional
		) as ICategoryFullTranslations[] | undefined
	);
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
			{setImage && (
				<Form.Item
					label="Imágen"
					valuePropName="fileList"
					getValueFromEvent={normFile}
				>
					<Upload
						listType="picture"
						onPreview={handlePreview}
						beforeUpload={validateImage}
						accept="image/*"
						fileList={image ? [image] : []}
						onChange={(e) => {
							setImage && setImage(e.fileList[e.fileList.length - 1]);
						}}
					>
						<Button icon={<FileImageOutlined />}>Escoger imágen</Button>
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
			)}
			{!isEdit && (
				<div className="pb-20px">
					<Text type="secondary">
						Nota: La id y categoría padre no pueden ser modificadas una vez que
						la categoría fué agregada
					</Text>
				</div>
			)}
			<Row justify="space-between">
				{!isEdit && (
					<>
						<Col xl={11} lg={11} md={11} sm={24} xs={24}>
							<Form.Item
								required
								label="ID (usada para la url)"
								validateStatus={errors.id ? "error" : undefined}
							>
								<Controller
									render={({ field }) => (
										<Input
											{...field}
											type="text"
											maxLength={36}
											placeholder="Ej. batteries"
										/>
									)}
									name="id"
									rules={{
										maxLength: {
											message: "Debe tener máximo 36 caracteres",
											value: 36,
										},
										pattern: {
											value: /^[a-z](-?[a-z])*$/,
											message:
												"Debe empezar y terminar con letra minúscula, solo puede contener letras y guiones y no debe tener 2 guiones continuos.",
										},

										required: "Campo requerido",
									}}
									control={control}
								/>
								<Text type="danger">
									<ErrorMessage errors={errors} name="id" />
								</Text>
							</Form.Item>
						</Col>
						<Col xl={11} lg={11} md={11} sm={24} xs={24}>
							<Form.Item
								label="Categoría padre"
								validateStatus={errors.parent ? "error" : undefined}
							>
								<Controller
									render={({ field }) => (
										<TreeSelect
											{...field}
											treeData={treeDataCategories}
											treeDefaultExpandAll
											allowClear
										/>
									)}
									name="parent"
									control={control}
								/>
								<Text type="danger">
									<ErrorMessage errors={errors} name="parent" />
								</Text>
							</Form.Item>
						</Col>
					</>
				)}
				<Col xl={11} lg={11} md={11} sm={24} xs={24}>
					<Form.Item
						required
						label="Nombre (español)"
						validateStatus={errors.nameEs ? "error" : undefined}
					>
						<Controller
							render={({ field }) => (
								<Input {...field} type="text" maxLength={36} />
							)}
							name="nameEs"
							rules={{
								maxLength: {
									message: "Debe tener máximo 36 caracteres",
									value: 36,
								},
								required: "Campo requerido",
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="nameEs" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={11} lg={11} md={11} sm={24} xs={24}>
					<Form.Item
						label="Nombre (inglés)"
						validateStatus={errors.nameEn ? "error" : undefined}
					>
						<Controller
							render={({ field }) => (
								<Input {...field} type="text" maxLength={36} />
							)}
							name="nameEn"
							rules={{
								maxLength: {
									message: "Debe tener máximo 36 caracteres",
									value: 36,
								},
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="lastname" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={11} lg={24} md={24} sm={24} xs={24}>
					<Form.Item
						required
						label="Descripción (español)"
						validateStatus={errors.descriptionEs ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							render={({ field }) => (
								<Input.TextArea
									{...field}
									maxLength={256}
									autoSize={{ minRows: 4, maxRows: 4 }}
								/>
							)}
							name="descriptionEs"
							rules={{
								maxLength: {
									message: "Máximo de 256 caracteres",
									value: 256,
								},
								required: "Campo requerido",
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="descriptionEs" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={11} lg={24} md={24} sm={24} xs={24}>
					<Form.Item
						label="Descripción (inglés)"
						validateStatus={errors.descriptionEn ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							render={({ field }) => (
								<Input.TextArea
									{...field}
									maxLength={256}
									autoSize={{ minRows: 4, maxRows: 4 }}
								/>
							)}
							name="descriptionEn"
							rules={{
								maxLength: {
									message: "Máximo de 256 caracteres",
									value: 256,
								},
							}}
							control={control}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="descriptionEn" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={4} lg={4} md={4} sm={4} xs={24}>
					<Form.Item>
						<Controller
							render={({ field }) => (
								<WrappedSwitch {...field} title="Mostrar en el menú" />
							)}
							name="showInMenu"
							control={control}
						/>
					</Form.Item>
				</Col>
			</Row>
			<style jsx>
				{`
					.role-description {
						font-style: italic;
					}
				`}
			</style>
		</div>
	);
};

export default CategoryForm;
