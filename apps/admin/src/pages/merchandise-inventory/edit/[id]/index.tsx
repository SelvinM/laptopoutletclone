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
import { translateProductType } from "../../../../utils/translations";
import ComputerProductDetailsForm from "../../../../components/ProductForm/ComputerProductDetailsForm";
import React, { useState, useEffect, useContext } from "react";
import Subheader from "../../../../components/Subheader";
import ProductForm from "../../../../components/ProductForm";
import {
	useUpdateUndefinedProductMutation,
	useUpdateComputerProductMutation,
	useGetProductQuery,
	useGetDistinctBrandsQuery,
} from "../../../../libs/graphql/operations/product.graphql";
import { useGetCategoriesQuery } from "../../../../libs/graphql/operations/category.graphql";
import { LoadingContext } from "../../../../contexts/LoadingContext";
import { useRouter } from "next/router";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import { DATA_LOAD_ERROR, GENERAL_ERROR } from "../../../../constants/messages";
import { ProductFormFields, ComputerProductForm } from "../../../../types";
import ProductImagesForm from "../../../../components/ProductImagesForm";
import { resetFormModal } from "../../../../components/resetFormModal";
import { getCategoryAncestorsId } from "../../../../utils/categoryDataHelpers";
import { DEFAULT_MESSAGE_DURATION } from "../../../../constants";
import Error403 from "../../../../components/Error403";
import { useMeQuery } from "../../../../libs/graphql/operations/admin.graphql";
import isUserAllowed from "../../../../utils/isUserAllowed";
import { MERCHANDISE_INVENTORY_EDIT_ROLES } from "../../../../constants/pageRoles";
import { ICategoryFullTranslations } from "packages/models/src/Category/types";
import { IComputerProductFullTranslations } from "packages/models/src/Product/ComputerProduct/types";

interface Props {}

const { Paragraph, Text } = Typography;
const { Option } = Select;

const EditMerchandise = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: MERCHANDISE_INVENTORY_EDIT_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const {
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm<ProductFormFields>();
	const router = useRouter();
	const id = getParamAsString(router.query.id) || "";
	const {
		data: productData,
		loading: loadingProduct,
		error: errorProduct,
	} = useGetProductQuery({
		variables: {
			id,
		},
	});
	const [productType, setProductType] = useState<ProductType>(
		ProductType.UndefinedProduct
	);
	const {
		data: dataBrands,
		loading: loadingBrands,
		error: errorBrands,
	} = useGetDistinctBrandsQuery();

	const [
		updateUndefinedProduct,
		{
			loading: loadingUpdateUndefinedProductMutation,
			error: errorUpdateUndefinedProductMutation,
		},
	] = useUpdateUndefinedProductMutation();
	const [
		updateComputerProduct,
		{
			loading: loadingUpdateComputerProductMutation,
			error: errorUpdateComputerProductMutation,
		},
	] = useUpdateComputerProductMutation();
	const [productDetailsForm, setProductDetailsForm] = useState<JSX.Element>();
	const onProductTypeChange = (value: ProductType) => {
		setProductType(value);
	};
	useEffect(() => {
		if (
			errorUpdateComputerProductMutation ||
			errorUpdateUndefinedProductMutation
		) {
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [errorUpdateComputerProductMutation, errorUpdateUndefinedProductMutation]);
	const { setLoading } = useContext(LoadingContext);
	const {
		data: dataCategories,
		loading: loadingCategories,
		error: errorCategories,
	} = useGetCategoriesQuery();
	useEffect(() => {
		setLoading(loadingCategories || loadingProduct || loadingBrands);
	}, [loadingCategories, loadingProduct, loadingBrands]);
	const [disabledSubmit, setDisabledSubmit] = useState(false);
	useEffect(() => {
		if (errorProduct || errorCategories || errorBrands) {
			console.log("errorProduct", errorProduct);
			console.log("errorCategories", errorCategories);
			console.log("errorBrands", errorBrands);
			message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [errorCategories, errorBrands, errorProduct]);

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
	const submit = async (fields: ProductFormFields) => {
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
			id: productData?.getProduct?.id ? productData.getProduct.id : "",
			categories,
			price: Number(fields.price),
			discountPrice: Number(fields.discountPrice),
			shipping: Number(fields.shipping),
			quantity: Number(fields.quantity),
		};
		if (productType === ProductType.UndefinedProduct) {
			const { data, errors } = await updateUndefinedProduct({
				variables: { ...commonFields },
			});
			if (errors || !data) {
				message.destroy();
				message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
			} else {
				message.destroy();
				message.success("¡El producto se ha editado existosamente!", 2);
				router.push("/merchandise-inventory");
			}
		}

		if (productType === ProductType.ComputerProduct) {
			const productFields = fields as ComputerProductForm;
			const { data, errors } = await updateComputerProduct({
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
				},
			});
			if (errors || !data) {
				message.destroy();
				message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
			} else {
				message.destroy();
				message.success(
					"¡El producto se ha editado existosamente!",
					DEFAULT_MESSAGE_DURATION
				);
				router.push("/merchandise-inventory");
			}
		}
	};
	useEffect(() => {
		resetFormAction();
	}, [productData, errorProduct]);
	const resetFormAction = () => {
		if (productData?.getProduct && !errorProduct) {
			const category = productData.getProduct.categories?.find((category) => {
				if (
					productData.getProduct?.categories?.some(
						(category) => !category?.hasChildren && !category?.isOptional
					)
				) {
					return !category?.isOptional && !category?.hasChildren;
				} else {
					return !category?.isOptional;
				}
			})?.id;
			const productLists = productData.getProduct.categories?.filter(
				(category) => !!category?.isOptional
			);
			setProductType(productData.getProduct.type);
			const commonValues = {
				id: productData.getProduct.id,
				longTitleEs: productData.getProduct.listing.longTitle.es,
				longTitleEn: productData.getProduct.listing.longTitle.en || "",
				shortTitleEs: productData.getProduct.listing.shortTitle.es,
				shortTitleEn: productData.getProduct.listing.shortTitle.en || "",
				descriptionEs: productData.getProduct.listing.description.es,
				descriptionEn: productData.getProduct.listing.description.en || "",
				price: productData.getProduct.pricing.price,
				discountPrice: productData.getProduct.pricing.discountPrice,
				shipping: productData.getProduct.pricing.shipping,
				quantity: productData.getProduct.quantity,
				brand: productData.getProduct.manufacturer?.brand || "",
				list: productData.getProduct.list,
				applyDiscount: productData.getProduct.applyDiscount,
				freeShipping: productData.getProduct.freeShipping,
				modelNumber: productData.getProduct.manufacturer?.model || "",
				category: category ? category : "",
				condition: productData.getProduct.condition,
				productLists: productLists?.map((category) => category?.id || ""),
			};
			if (productData.getProduct.type === ProductType.UndefinedProduct)
				reset(commonValues);

			if (productData.getProduct.type === ProductType.ComputerProduct) {
				const computerProduct =
					productData.getProduct as IComputerProductFullTranslations;
				reset({
					...commonValues,
					modelName: computerProduct.details.model || "",
					os: computerProduct.details.os || "",
					screenSize: computerProduct.details.screenSize || "",
					hdd: computerProduct.details.hdd || "",
					ssd: computerProduct.details.ssd || "",
					ram: computerProduct.details.ram || "",
					graphicsProcessor: computerProduct.details.graphicsProcessor || "",
					processor: computerProduct.details.processor || "",
				});
			}
		}
	};
	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};
	return (
		<div>
			<Subheader
				title="Editar producto"
				breadcrumbs={[
					{ href: "/merchandise-inventory", name: "Inventario de mercancía" },
					{
						href: "/merchandise-inventory/details/[id]",
						as: `/merchandise-inventory/details/${id}`,
						name: "Detalles del producto",
					},
					{
						href: "/merchandise-inventory/edit/[id]",
						as: `/merchandise-inventory/edit/${id}`,
						name: "Editar producto",
					},
				]}
			>
				{productData?.getProduct?.id ? (
					<Text>
						<Text strong>SKU del producto:</Text> {productData?.getProduct?.id}{" "}
					</Text>
				) : (
					<Text type="danger">
						No pudimos obtener la información del producto. Asegurate que la url
						sea la correcta.
					</Text>
				)}
			</Subheader>
			<div className="main-container">
				<div className="pb-20px">
					<Card title="Imágenes">
						<ProductImagesForm
							id={id}
							images={productData?.getProduct?.images || []}
						/>
					</Card>
				</div>
				<Card>
					<div className="text-right">
						<Button type="link" onClick={showResetFormModal}>
							Reestablecer campos
						</Button>
					</div>
					<Form onSubmitCapture={handleSubmit(submit)} layout="vertical">
						<ProductForm
							control={control}
							errors={errors}
							categories={dataCategories}
							dataBrands={dataBrands}
							setDisabledSubmit={setDisabledSubmit}
						/>
						<Row>
							<Col xl={14} lg={14} md={14} sm={24} xs={24}>
								<Text type="secondary">
									Nota: El tipo de producto no puede ser cambiado una vez que el
									producto ya fue ingresado.
								</Text>
								<Form.Item label="Tipo de producto">
									<Select
										onChange={onProductTypeChange}
										value={productType}
										disabled
									>
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
								sea aplicable.
							</Paragraph>
						)}
						{productDetailsForm}
						<Form.Item className="float-right">
							<Button
								type="primary"
								htmlType="submit"
								loading={
									loadingUpdateUndefinedProductMutation ||
									loadingUpdateComputerProductMutation
								}
								disabled={
									Object.values(errors).length > 0 ||
									!!errorProduct ||
									!!errorCategories ||
									disabledSubmit
								}
							>
								{" "}
								Editar
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default EditMerchandise;
