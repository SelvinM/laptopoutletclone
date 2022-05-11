import {
	Button,
	Card,
	Col,
	Form,
	Row,
	Select,
	Typography,
	message,
} from "antd";
import { useForm } from "react-hook-form";
import { ProductType } from "@laptopoutlet-packages/types";
import { translateProductType } from "../../../utils/translations";
import ComputerProductDetailsForm from "../../../components/ProductForm/ComputerProductDetailsForm";
import React, { useState, useEffect, useContext } from "react";
import Subheader from "../../../components/Subheader";
import ProductForm from "../../../components/ProductForm";
import {
	useCreateUndefinedProductMutation,
	useCreateComputerProductMutation,
	GetProductsDocument,
	useGetDistinctBrandsQuery,
	GetDistinctBrandsDocument,
	GetDistinctProductDetailsDocument,
} from "../../../libs/graphql/operations/product.graphql";
import { useGetCategoriesQuery } from "../../../libs/graphql/operations/category.graphql";
import { LoadingContext } from "../../../contexts/LoadingContext";
import { UploadFile } from "antd/lib/upload/interface";
import { useRouter } from "next/router";
import { ProductFormFields, ComputerProductForm } from "../../../types";
import { DATA_LOAD_ERROR, GENERAL_ERROR } from "../../../constants/messages";
import { resetFormModal } from "../../../components/resetFormModal";
import {
	DEFAULT_MESSAGE_DURATION,
	DEFAULT_PAGINATION_LIMIT,
} from "../../../constants";
import { getCategoryAncestorsId } from "../../../utils/categoryDataHelpers";
import Error403 from "../../../components/Error403";
import { useMeQuery } from "../../../libs/graphql/operations/admin.graphql";
import isUserAllowed from "../../../utils/isUserAllowed";
import { MERCHANDISE_INVENTORY_ADD_ROLES } from "../../../constants/pageRoles";
import { validateProductId } from "@laptopoutlet-packages/utils";
import { ICategoryFullTranslations } from "packages/models/src/Category/types";
interface Props {}

const { Paragraph, Text } = Typography;
const { Option } = Select;
const AddMerchandise = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: MERCHANDISE_INVENTORY_ADD_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish

	const [disabledSubmit, setDisabledSubmit] = useState(false);

	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitted },
		reset,
	} = useForm<ProductFormFields>();

	const [imageFiles, setImageFiles] = useState<UploadFile<any>[]>();
	const [productType, setProductType] = useState<ProductType>(
		ProductType.UndefinedProduct
	);
	const [
		createUndefinedProduct,
		{
			loading: loadingCreateUndefinedProductMutation,
			error: errorCreateUndefinedProductMutation,
		},
	] = useCreateUndefinedProductMutation();
	const [
		createComputerProduct,
		{
			loading: loadingCreateComputerProductMutation,
			error: errorCreateComputerProductMutation,
		},
	] = useCreateComputerProductMutation();
	const [productDetailsForm, setProductDetailsForm] = useState<JSX.Element>();
	const {
		data: dataBrands,
		loading: loadingBrands,
		error: errorBrands,
	} = useGetDistinctBrandsQuery();
	const onProductTypeChange = (value: ProductType) => {
		setProductType(value);
	};
	useEffect(() => {
		if (
			errorCreateComputerProductMutation ||
			errorCreateUndefinedProductMutation
		) {
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	});
	const { setLoading } = useContext(LoadingContext);
	const router = useRouter();
	const {
		data: dataCategories,
		loading: loadingCategories,
		error: errorCategories,
	} = useGetCategoriesQuery();

	useEffect(() => {
		setLoading(loadingCategories || loadingBrands);
	}, [loadingCategories, loadingBrands]);

	useEffect(() => {
		if (errorCategories || errorBrands) {
			message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [errorCategories, errorBrands]);

	useEffect(() => {
		switch (productType) {
			case ProductType.ComputerProduct:
				setProductDetailsForm(
					<ComputerProductDetailsForm control={control} errors={errors} />
				);
				break;
			default:
				setProductDetailsForm(undefined);
				break;
		}
	}, [productType]);
	const [id, setId] = useState<string>("");
	const [idError, setIdError] = useState<string>();
	useEffect(() => {
		const isValid = validateProductId(id);
		if (isSubmitted && id.length === 0) {
			setDisabledSubmit(true);
			setIdError("Campo requerido");
			return;
		}
		if (!isValid && id.length > 0 && isSubmitted) {
			setDisabledSubmit(true);
			setIdError(
				"Debe de estar conformado únicamente por letras mayúsculas y/o números"
			);
			return;
		}
		setIdError(undefined);
	}, [id, isSubmitted]);
	const submit = async (fields: ProductFormFields) => {
		const images = imageFiles?.map((image) => image.originFileObj);
		const categories = fields.productLists
			? [
					...getCategoryAncestorsId(
						dataCategories?.getCategories as ICategoryFullTranslations[],
						fields.category
					),
					...fields.productLists,
			  ]
			: getCategoryAncestorsId(
					dataCategories?.getCategories as ICategoryFullTranslations[],
					fields.category
			  );
		const commonFields = {
			...fields,
			categories,
			images,
			discountPrice: Number(fields.discountPrice),
			shipping: Number(fields.shipping),
			price: Number(fields.price),
			quantity: Number(fields.quantity),
		};
		if (productType === ProductType.UndefinedProduct) {
			const { data, errors } = await createUndefinedProduct({
				variables: { ...commonFields, id },
				awaitRefetchQueries: true,
				refetchQueries: [
					{
						query: GetProductsDocument,
						variables: { limit: DEFAULT_PAGINATION_LIMIT },
					},
					{ query: GetDistinctBrandsDocument },
				],
			});
			if (errors || !data) {
				message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
			} else {
				message.success("¡El producto se ha agregado existosamente!", 2);
				router.push("/merchandise-inventory");
			}
		}

		if (productType === ProductType.ComputerProduct) {
			const productFields = fields as ComputerProductForm;
			const { data, errors } = await createComputerProduct({
				variables: {
					...commonFields,
					graphicsProcessor: productFields.graphicsProcessor,
					hdd: productFields.hdd,
					modelName: productFields.modelName,
					operatingSystem: productFields.os,
					processor: productFields.processor,
					ram: productFields.ram,
					screenSize: productFields.screenSize,
					ssd: productFields.ssd,
					id,
				},
				refetchQueries: [
					{
						query: GetProductsDocument,
						variables: { limit: DEFAULT_PAGINATION_LIMIT },
					},
					{ query: GetDistinctBrandsDocument },
					{
						query: GetDistinctProductDetailsDocument,
						variables: { type: ProductType.ComputerProduct },
					},
				],
			});
			if (errors || !data) {
				message.destroy();
				message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
			} else {
				message.destroy();
				message.success("¡El producto se ha agregado existosamente!", 2);
				router.push("/merchandise-inventory");
			}
		}
	};
	const resetFormAction = () => {
		resetFormModal(() => {
			reset();
			setProductType(ProductType.UndefinedProduct);
			setImageFiles(undefined);
		});
	};
	return (
		<div>
			<Subheader
				title="Agregar producto"
				breadcrumbs={[
					{ href: "/merchandise-inventory", name: "Inventario de mercancía" },
					{ href: "/merchandise-inventory/add", name: "Agregar producto" },
				]}
			/>
			<div className="main-container">
				<Card>
					<div className="text-right">
						<Button type="link" onClick={resetFormAction}>
							Limpiar campos
						</Button>
					</div>
					<Form onSubmitCapture={handleSubmit(submit)} layout="vertical">
						<ProductForm
							control={control}
							errors={errors}
							categories={dataCategories}
							images={imageFiles}
							setImages={setImageFiles}
							dataBrands={dataBrands}
							setDisabledSubmit={setDisabledSubmit}
							id={id}
							setId={setId}
							idError={idError}
						/>
						<Text type="secondary">
							Nota: El tipo de producto no puede ser cambiado una vez que el
							producto ya fue ingresado.
						</Text>
						<Row>
							<Col xl={11} lg={11} md={14} sm={24} xs={24}>
								<Form.Item label="Tipo de producto">
									<Select onChange={onProductTypeChange} value={productType}>
										{Object.values(ProductType).map((item, index) => (
											<Option key={index} value={item}>
												{translateProductType(item)}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						</Row>
						{productType !== ProductType.UndefinedProduct && (
							<Paragraph type="secondary">
								Nota: Solo llenar los siguientes campos en caso que el atributo
								sea aplicable. De no ser aplicable el sistema le asignara el
								valor de "N/A".
							</Paragraph>
						)}
						{productDetailsForm}
						<Form.Item className="float-right">
							<Button
								type="primary"
								htmlType="submit"
								loading={
									loadingCreateUndefinedProductMutation ||
									loadingCreateComputerProductMutation
								}
								disabled={
									Object.values(errors).length > 0 ||
									!!errorCategories ||
									disabledSubmit
								}
							>
								{" "}
								Agregar
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default AddMerchandise;
