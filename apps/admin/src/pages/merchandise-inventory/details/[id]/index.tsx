import { EditOutlined } from "@ant-design/icons";
import {
	Typography,
	message,
	Descriptions,
	Button,
	Card,
	Modal,
	Tag,
	Upload,
} from "antd";
import { UploadFile } from "antd/lib/upload/interface";
import CategoryTags from "../../../../components/CategoryTags";
import ComputerProductDetailsTable from "../../../../components/ProductDetailsTable/ComputerProductDetailsTable/index";
import Subheader from "../../../../components/Subheader";
import { DATA_LOAD_ERROR } from "../../../../constants/messages";
import { LoadingContext } from "../../../../contexts/LoadingContext";
import { useGetProductQuery } from "../../../../libs/graphql/operations/product.graphql";
import { getBase64 } from "../../../../utils/getBase64";
import {
	getParamAsString,
	getPriceFormatter,
} from "@laptopoutlet-packages/utils";
import {
	translateProductType,
	translateProductCondition,
} from "../../../../utils/translations";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useState, useEffect } from "react";
import { DEFAULT_MESSAGE_DURATION } from "../../../../constants";
import Error403 from "../../../../components/Error403";
import { useMeQuery } from "../../../../libs/graphql/operations/admin.graphql";
import isUserAllowed from "../../../../utils/isUserAllowed";
import { MERCHANDISE_INVENTORY_DETAILS_ROLES } from "../../../../constants/pageRoles";
import { Currency, Locale, ProductType } from "@laptopoutlet-packages/types";
import { ICategoryFullTranslations } from "packages/models/src/Category/types";

interface Props {}
const { Text } = Typography;
const MerchandiseDetails = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: MERCHANDISE_INVENTORY_DETAILS_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish

	const router = useRouter();
	const id = getParamAsString(router.query.id) || "";
	const { setLoading } = useContext(LoadingContext);
	const { data, loading, error } = useGetProductQuery({
		variables: { id },
	});
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
	useEffect(() => {
		setLoading(loading);
	}, [loading]);

	useEffect(() => {
		if (error) message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	const priceFormatter = getPriceFormatter(Locale.Es, Currency.Hnl);
	return (
		<div>
			<Subheader
				title="Detalles de producto"
				breadcrumbs={[
					{ href: "/merchandise-inventory", name: "Inventario de mercancía" },
					{
						href: "/merchandise-inventory/details/[id]",
						as: `/merchandise-inventory/details/${router.query.id}`,
						name: "Detalles de producto",
					},
				]}
			>
				{data?.getProduct?.id ? (
					<Text>
						<Text strong>SKU del producto:</Text> {data?.getProduct?.id}
					</Text>
				) : (
					<Text type="danger">
						No pudimos obtener la información del producto. Asegurate que la url
						sea la correcta.
					</Text>
				)}
			</Subheader>
			{data?.getProduct?.id && (
				<div className="main-container">
					<Card>
						<div className="text-right pb-10px">
							<Link
								href="/merchandise-inventory/edit/[id]"
								as={`/merchandise-inventory/edit/${id}`}
							>
								<Button type="link" icon={<EditOutlined />}>
									Editar
								</Button>
							</Link>
						</div>
						<Descriptions
							bordered
							contentStyle={{ width: "70%" }}
							column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
							title="Detalles generales"
							className="pb-40px"
						>
							<Descriptions.Item label="Título largo (español)">
								{data.getProduct.listing.longTitle.es}
							</Descriptions.Item>
							{/* <Descriptions.Item label="Título largo (ingles)">
								{data.getProduct.listing.longTitle.en}
							</Descriptions.Item> */}
							<Descriptions.Item label="Título corto (español)">
								{data.getProduct.listing.shortTitle.es}
							</Descriptions.Item>
							{/* <Descriptions.Item label="Título corto (ingles)">
								{data.getProduct.listing.shortTitle.en}
							</Descriptions.Item> */}
							<Descriptions.Item label="Descripción (español)">
								{data.getProduct.listing.description.es}
							</Descriptions.Item>
							{/* <Descriptions.Item label="Descripción (ingles)">
								{data.getProduct.listing.description.en}
							</Descriptions.Item> */}
							<Descriptions.Item label="Extensión URL">
								{data.getProduct.slug}
							</Descriptions.Item>
							<Descriptions.Item label="Marca">
								{data.getProduct.manufacturer?.brand || "Genérico"}
							</Descriptions.Item>
							<Descriptions.Item label="# de modelo">
								{data.getProduct.manufacturer?.model || "N/A"}
							</Descriptions.Item>
							<Descriptions.Item label="Precio">
								{priceFormatter.format(data.getProduct.pricing.price)}
							</Descriptions.Item>
							<Descriptions.Item label="Precio con descuento">
								{priceFormatter.format(data.getProduct.pricing.discountPrice)}
							</Descriptions.Item>
							<Descriptions.Item label="Envío">
								{priceFormatter.format(data.getProduct.pricing.shipping)}
							</Descriptions.Item>
							<Descriptions.Item label="Tipo de producto">
								{translateProductType(data.getProduct.type)}
							</Descriptions.Item>
							<Descriptions.Item label="Enlistado">
								{data?.getProduct?.list ? (
									<Tag color="green">Si</Tag>
								) : (
									<Tag color="red">No</Tag>
								)}
							</Descriptions.Item>
							<Descriptions.Item label="Con descuento">
								{data.getProduct.applyDiscount ? (
									<Tag color="green">Si</Tag>
								) : (
									<Tag color="red">No</Tag>
								)}
							</Descriptions.Item>

							<Descriptions.Item label="Categorías">
								<CategoryTags
									categories={
										data.getProduct.categories as ICategoryFullTranslations[]
									}
								/>
							</Descriptions.Item>
							<Descriptions.Item label="Condición">
								{translateProductCondition(data.getProduct.condition)}
							</Descriptions.Item>
							<Descriptions.Item label="Imágenes">
								<Upload
									listType="picture-card"
									disabled
									onPreview={handlePreview}
									fileList={data.getProduct?.images?.map(
										(image) =>
											({
												type: "image/*",
												name: image.filename,
												url:
													process.env.NEXT_PUBLIC_BUCKET_BASE_URL + image.url,
												size: 0,
												uid: image.url,
											} as UploadFile<any>)
									)}
								/>
								<Modal
									visible={previewVisible}
									title={previewTitle}
									footer={null}
									onCancel={handleCancel}
								>
									<img alt="example" className="w-100" src={previewImage} />
								</Modal>
							</Descriptions.Item>
							<Descriptions.Item label="Cantidad">
								{data.getProduct.quantity}
							</Descriptions.Item>
						</Descriptions>
						{data.getProduct.type === ProductType.ComputerProduct && (
							<ComputerProductDetailsTable data={data} />
						)}
					</Card>
				</div>
			)}
		</div>
	);
};

export default MerchandiseDetails;
