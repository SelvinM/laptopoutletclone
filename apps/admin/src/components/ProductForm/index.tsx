import React, { useEffect, useState } from "react";
import {
	Row,
	Col,
	Form,
	Input,
	Typography,
	Select,
	Upload,
	TreeSelect,
	Modal,
	AutoComplete,
	message,
	Space,
} from "antd";
import { Control, Controller, DeepMap, FieldError } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { ProductCondition } from "@laptopoutlet-packages/types";
import { InboxOutlined } from "@ant-design/icons";
import { translateProductCondition } from "../../utils/translations";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import { getBase64 } from "../../utils/getBase64";
import {
	GetDistinctBrandsQuery,
	useVerifyIdAvailabilityLazyQuery,
} from "../../libs/graphql/operations/product.graphql";
import WrappedSwitch from "../WrappedSwitch";
import { GetCategoriesQuery } from "../../libs/graphql/operations/category.graphql";
import { transformCategoriesForTreeSelect } from "../../utils/categoryDataHelpers";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import { ProductFormFieldsErrors } from "../../types";
import { ICategoryFullTranslations } from "@laptopoutlet-packages/models";
const { Text } = Typography;
const { Option } = Select;

interface Props {
	control: Control<any>;
	errors: DeepMap<ProductFormFieldsErrors, FieldError>;
	categories?: GetCategoriesQuery;
	setImages?: React.Dispatch<
		React.SetStateAction<UploadFile<any>[] | undefined>
	>;
	images?: UploadFile<any>[] | undefined;
	dataBrands?: GetDistinctBrandsQuery;
	setDisabledSubmit: React.Dispatch<React.SetStateAction<boolean>>;
	id?: string;
	setId?: React.Dispatch<React.SetStateAction<string>>;
	idError?: string;
}

const ProductForm = ({
	control,
	errors,
	categories,
	setImages,
	images,
	dataBrands,
	setDisabledSubmit,
	id,
	setId,
	idError,
}: Props) => {
	const [previewImage, setPreviewImage] = useState<string>();
	const [previewTitle, setPreviewTitle] = useState<string>();
	const [previewVisible, setPreviewVisible] = useState(false);
	const [
		verifyIdAvailability,
		{ loading: loadingVeifyIdAvailability, data: idAvailability },
	] = useVerifyIdAvailabilityLazyQuery();
	const handleCancel = () => {
		setPreviewVisible(false);
	};
	useEffect(() => {
		const timeOutId = setTimeout(() => {
			if (id && id.length > 0) {
				verifyIdAvailability({
					variables: {
						id,
					},
				});
			}
		}, 320);
		return () => clearTimeout(timeOutId);
	}, [id]);

	const normFile = (file: any) => {
		if (Array.isArray(file)) return file;
		return file && file.fileList;
	};

	const treeDataCategories = transformCategoriesForTreeSelect(
		categories?.getCategories?.filter((category) => !category?.isOptional) as
			| ICategoryFullTranslations[]
			| undefined
	);
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
	const beforeUpload = (file: RcFile) => {
		if (images?.some((item) => item.fileName === file.name)) {
			message.error(
				"Una imágen con este nombre ya existe para este producto.",
				DEFAULT_MESSAGE_DURATION
			);
			return false;
		}
		setImages && images && setImages([...images, file]);
		return false;
	};
	useEffect(() => {
		if (
			(idAvailability?.verifyIdAvailability === false ||
				loadingVeifyIdAvailability) &&
			id &&
			id.length > 0
		) {
			setDisabledSubmit(true);
			return;
		}
		if (!idError) setDisabledSubmit(false);
	}, [
		idAvailability?.verifyIdAvailability,
		loadingVeifyIdAvailability,
		idError,
	]);

	return (
		<Row justify="space-between" align="middle">
			{setId !== undefined && id !== undefined && (
				<>
					<Col xl={11} lg={11} md={11} sm={11} xs={24}>
						<Form.Item
							required
							label={
								<Space>
									<Text>SKU</Text>
									{loadingVeifyIdAvailability ? (
										<Text type="secondary">Verificando...</Text>
									) : id.length > 0 &&
									  idAvailability?.verifyIdAvailability === false ? (
										<Text type="danger">SKU ya está en uso</Text>
									) : (
										id.length > 0 && <Text type="success">SKU disponible</Text>
									)}
								</Space>
							}
							validateStatus={idError ? "error" : undefined}
						>
							<Input
								name="id"
								maxLength={12}
								value={id}
								onChange={({ target: { value } }) => {
									const newId = value.trim().toUpperCase();
									setId(newId);
								}}
							/>
							{idError && <Text type="danger">{idError}</Text>}
						</Form.Item>
					</Col>
					<Col xl={11} lg={11} md={11} sm={11} xs={24} />
				</>
			)}
			<Col xl={11} lg={11} md={24} sm={24} xs={24}>
				<Form.Item
					required
					label="Título largo (español)"
					validateStatus={errors.longTitleEs ? "error" : undefined}
				>
					<Controller
						render={({ field }) => (
							<Input.TextArea
								{...field}
								autoSize={{ minRows: 2, maxRows: 4 }}
								maxLength={200}
							/>
						)}
						name="longTitleEs"
						// placeholder={`Ej. Portátil Dell Latitude E6440 de 14 pulgadas, Core i5-4300M 2,6 GHz, 8 GB Ram, 256 GB SSD y DVDRW`}
						rules={{
							required: "Campo requerido",
							maxLength: {
								message: "Máximo de 200 caracteres",
								value: 200,
							},
						}}
						defaultValue=""
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="longTitleEs" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={11} lg={11} md={24} sm={24} xs={24}>
				{/* <Form.Item label="Título largo (inglés)">
					<Controller
						render={({ field }) => (
							<Input.TextArea
								{...field}
								autoSize={{ minRows: 2, maxRows: 6 }}
								maxLength={200}
							/>
						)}
						name="longTitleEn"
						// placeholder={`Ej. Laptop Dell Latitude E6440 14", Intel Core i5-4300M 2.6 GHz, 8 GB Ram, 256 GB SSD, DVDRW`}

						rules={{
							maxLength: {
								message: "Máximo de 200 caracteres",
								value: 200,
							},
						}}
						defaultValue=""
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="longTitleEn" />
					</Text>
				</Form.Item> */}
			</Col>
			<Col xl={11} lg={11} md={11} sm={11} xs={24}>
				<Form.Item
					required
					label="Título corto (español)"
					validateStatus={errors.shortTitleEs ? "error" : undefined}
				>
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Input
								{...field} // placeholder="Ej. Portátil Dell Latitude E6440"
								maxLength={36}
							/>
						)}
						name="shortTitleEs"
						rules={{
							required: "Campo requerido",
							maxLength: {
								message: "Máximo de 36 caracteres",
								value: 36,
							},
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="shortTitleEs" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={11} lg={11} md={11} sm={11} xs={24}>
				{/* <Form.Item label="Título corto (inglés)">
					<Controller
						defaultValue=""
						render={({field})=><Input {...field} />}
						name="shortTitleEn"
						// placeholder="Ej. Laptop Dell Latitude E6440"
						maxLength={36}
						rules={{
							maxLength: {
								message: "Máximo de 36 caracteres",
								value: 36,
							},
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="shortTitleEn" />
					</Text>
				</Form.Item> */}
			</Col>

			<Col span={24}>
				<Form.Item
					required
					label="Descripción (español)"
					validateStatus={errors.descriptionEs ? "error" : undefined}
				>
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Input.TextArea
								{...field} // placeholder="Ej. La tapa / carcasa externa tiene signos notables de desgaste (rasguños, peladuras, etc.) debido al uso normal. Por favor ver fotos. INCLUYE: Laptop, batería y cargador. Este artículo ha sido probado y es 100% funcional."
								maxLength={1024}
								autoSize={{ minRows: 3, maxRows: 7 }}
							/>
						)}
						name="descriptionEs"
						rules={{
							maxLength: {
								message: "Máximo de 1024 caracteres",
								value: 1024,
							},
							required: "Campo requerido",
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="descriptionEs" />
					</Text>
				</Form.Item>
				{/* <Form.Item label="Descripción (inglés)">
					<Controller
						defaultValue=""
						render={({field})=><Input.TextArea />}
						name="descriptionEn"
						// placeholder="Ej. Lid/Outer casing have noticeable signs of wear and tear (scuffs, scratches, etc.) from normal use. Please see photos. INCLUDES: Laptop, Battery, and AC Adapter. These items have been tested, and are guaranteed to be fully functional."
						maxLength={1024}
						autoSize={{ minRows: 3, maxRows: 7 }}
						rules={{
							maxLength: {
								message: "Máximo de 1024 caracteres",
								value: 1024,
							},
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="descriptionEn" />
					</Text>
				</Form.Item> */}
			</Col>
			<Col xl={5} lg={5} md={7} sm={11} xs={24}>
				<Form.Item
					required
					labelAlign="right"
					validateStatus={errors.price ? "error" : undefined}
					label="Precio normal"
				>
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								addonBefore="L."
								className="w-100"
								step={0.01}
								min={0}
							/>
						)}
						name="price"
						rules={{
							required: "Campo requerido",
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="price" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={5} lg={5} md={7} sm={11} xs={24}>
				<Form.Item
					required
					label="Precio descuento"
					validateStatus={errors.discountPrice ? "error" : undefined}
				>
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								addonBefore="L."
								className="w-100"
								step={0.01}
								min={0}
							/>
						)}
						name="discountPrice"
						rules={{
							required: "Campo requerido",
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="discountPrice" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={5} lg={5} md={7} sm={11} xs={24}>
				<Form.Item
					required
					label="Costo de envío"
					validateStatus={errors.shipping ? "error" : undefined}
				>
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								addonBefore="L."
								className="w-100"
								step={0.01}
								min={0}
							/>
						)}
						name="shipping"
						rules={{
							required: "Campo requerido",
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="shipping" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={5} lg={5} md={11} sm={11} xs={24}>
				<Form.Item required label="Cantidad">
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Input {...field} type="number" className="w-100" min={0} />
						)}
						name="quantity"
						rules={{
							required: "Campo requerido",
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="quantity" />
					</Text>
				</Form.Item>
			</Col>
			<Col sm={11} xs={24}>
				<Text type="secondary">
					Si deja el campo vacío aparecerá como "Genérico"
				</Text>
				<Form.Item
					label="Marca"
					validateStatus={errors.brand ? "error" : undefined}
				>
					<Controller
						defaultValue=""
						control={control}
						render={({ field }) => (
							<AutoComplete
								{...field} // placeholder="Ej. Dell"
								options={dataBrands?.getDistinctBrands
									.slice(0, 9)
									.filter((item) => item !== "")
									.map((item) => ({
										value: item,
									}))}
								id="brand"
								filterOption={(inputValue: any, option: any) =>
									option.value
										.toUpperCase()
										.indexOf(inputValue.toUpperCase()) !== -1
								}
							/>
						)}
						name="brand"
						rules={{
							maxLength: {
								message: "Máximo de 28 caracteres",
								value: 28,
							},
						}}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="brand" />
					</Text>
				</Form.Item>
			</Col>
			<Col sm={11} xs={24}>
				<Text type="secondary">
					Si deja el campo vacío aparecerá como "N/A"
				</Text>

				<Form.Item
					label="# de modelo"
					validateStatus={errors.modelNumber ? "error" : undefined}
				>
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Input
								{...field} // placeholder="Ej. Latitude E6440"
								maxLength={36}
							/>
						)}
						name="modelNumber"
						rules={{
							maxLength: {
								message: "Máximo de 36 caracteres",
								value: 36,
							},
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="modelNumber" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={7} lg={7} md={11} sm={11} xs={24}>
				<Form.Item
					required
					label="Condición"
					validateStatus={errors.condition ? "error" : undefined}
				>
					<Controller
						defaultValue=""
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Selecciona la condición"
								children={Object.values(ProductCondition).map((item, index) => (
									<Option key={index} value={item}>
										{translateProductCondition(item)}
									</Option>
								))}
							/>
						)}
						name="condition"
						rules={{
							required: "Campo requerido",
						}}
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="condition" />
					</Text>
				</Form.Item>
			</Col>
			<Col span={24}></Col>
			<Col xl={11} lg={11} md={11} sm={11} xs={24}>
				<Form.Item
					required
					label="Categoría"
					validateStatus={errors.category ? "error" : undefined}
				>
					<Controller
						render={({ field }) => (
							<TreeSelect
								{...field}
								treeData={treeDataCategories}
								treeDefaultExpandAll
								placeholder="Selecciona una categoría"
							/>
						)}
						name="category"
						control={control}
						defaultValue=""
						rules={{ required: "Campo requerido" }}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="category" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={11} lg={11} md={11} sm={11} xs={24}>
				<Form.Item label="Categorías opcionales">
					<Controller
						defaultValue={[]}
						render={({ field }) => (
							<Select
								{...field}
								mode="multiple"
								optionFilterProp="children"
								children={categories?.getCategories
									.filter((category) => !!category?.isOptional)
									.map((item, index) => (
										<Option value={item ? item.id : ""} key={index}>
											{item?.name.es}
										</Option>
									))}
								placeholder="Selecciona las categorías opcionales"
							/>
						)}
						name="productLists"
						control={control}
					/>
					<Text type="danger">
						<ErrorMessage errors={errors} name="productLists" />
					</Text>
				</Form.Item>
			</Col>
			<Col xl={4} lg={4} md={4} sm={4} xs={24}>
				<Form.Item>
					<Controller
						render={({ field }) => (
							<WrappedSwitch {...field} title="Enlistar" />
						)}
						name="list"
						control={control}
						defaultValue={true}
					/>
				</Form.Item>
				<Form.Item>
					<Controller
						render={({ field }) => (
							<WrappedSwitch {...field} title="Aplicar descuento" />
						)}
						name="applyDiscount"
						control={control}
						defaultValue={false}
					/>
				</Form.Item>
				<Form.Item>
					<Controller
						render={({ field }) => (
							<WrappedSwitch {...field} title="Envío gratis" />
						)}
						name="freeShipping"
						control={control}
						defaultValue={false}
					/>
				</Form.Item>
			</Col>
			{setImages && (
				<Col xl={18} lg={18} md={18} sm={18} xs={24}>
					<Form.Item
						label="Imágenes"
						valuePropName="fileList"
						getValueFromEvent={normFile}
					>
						<Upload.Dragger
							multiple
							listType="picture-card"
							onPreview={handlePreview}
							beforeUpload={beforeUpload}
							accept="image/*"
							fileList={images}
							onChange={(e) => {
								setImages(e.fileList);
							}}
						>
							<p className="ant-upload-drag-icon">
								<InboxOutlined />
							</p>
							<p className="ant-upload-text">
								Dar click o arrastra imágenes para agregarlas
							</p>
							<p className="ant-upload-hint">
								La primera imagen será usada como portada
							</p>
						</Upload.Dragger>
						<Modal
							visible={previewVisible}
							title={previewTitle}
							footer={null}
							onCancel={handleCancel}
						>
							<img alt="example" className="w-100" src={previewImage} />
						</Modal>
					</Form.Item>
				</Col>
			)}
		</Row>
	);
};

export default ProductForm;
