import React, { useEffect, useContext, useState } from "react";
import {
	Button,
	Card,
	Space,
	Table,
	Tag,
	message,
	Tooltip,
	Row,
	Col,
	Input,
	Modal,
	Typography,
} from "antd";
import Image from "next/image";
import {
	EyeOutlined,
	EditOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Subheader from "../../components/Subheader";
import {
	useGetProductsQuery,
	useDeleteProductMutation,
	useGetDistinctBrandsQuery,
	GetProductQuery,
	GetProductDocument,
} from "../../libs/graphql/operations/product.graphql";
import { LoadingContext } from "../../contexts/LoadingContext";
import { translateProductType } from "../../utils/translations";
import { TablePaginationConfig } from "antd/lib/table";
import { ColumnsType } from "antd/lib/table/interface";

import { translateProductCondition } from "../../utils/translations";

import { SortType, SortCriteria, SortInfo, TableFilters } from "../../types";
import {
	ProductType,
	ProductCondition,
	Locale,
	Currency,
} from "@laptopoutlet-packages/types";
import CategoryTags from "../../components/CategoryTags";
import { NetworkStatus } from "@apollo/client";
import { useGetCategoriesQuery } from "../../libs/graphql/operations/category.graphql";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { GENERAL_ERROR } from "../../constants/messages";
import { tableFilterToBoolean } from "../../utils/tableFilterToBoolean";
import RefreshButton from "../../components/RefreshButton";
import ClearFiltersButton from "../../components/ClearFiltersButton";
import { transformCategoriesForFilters } from "../../utils/categoryDataHelpers";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import isUserAllowed from "../../utils/isUserAllowed";
import Error403 from "../../components/Error403";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import { MERCHANDISE_INVENTORY_ROLES } from "../../constants/pageRoles";
import { getPriceFormatter } from "@laptopoutlet-packages/utils";
import { ICategoryFullTranslations } from "packages/models/src/Category/types";
import { IProductFullTranslations } from "packages/models/src/Product/types";
dayjs.locale("es");
dayjs.extend(relativeTime);
interface Props {}
const { confirm } = Modal;
const { Text, Paragraph } = Typography;
const defaultPageSize = 10;
const booleanFilters = [
	{ text: "Si", value: true },
	{ text: "No", value: false },
];

const MerchandiseInventory = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: MERCHANDISE_INVENTORY_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const [paginationInfo, setPaginationInfo] = useState<TablePaginationConfig>(
		{}
	);
	const [sortInfo, setSortInfo] = useState<SortInfo>();
	const [search, setSearch] = useState<string>();
	const [filtersInfo, setFiltersInfo] = useState<TableFilters>();
	const { setLoading } = useContext(LoadingContext);
	const { data, loading, error, refetch, client, networkStatus } =
		useGetProductsQuery({
			variables: { limit: defaultPageSize },
			notifyOnNetworkStatusChange: true,
		});
	const [deleteProduct] = useDeleteProductMutation();
	const {
		data: dataCategories,
		loading: loadingCategories,
		error: errorCategories,
		refetch: refetchCategories,
	} = useGetCategoriesQuery();
	const {
		data: dataBrands,
		loading: loadingBrands,
		error: errorBrands,
		refetch: refetchBrands,
	} = useGetDistinctBrandsQuery();
	const priceFormatter = getPriceFormatter(Locale.Es, Currency.Hnl);
	const getVariables = () => {
		const variables = {
			applyDiscount: tableFilterToBoolean(filtersInfo?.applyDiscount),
			list: tableFilterToBoolean(filtersInfo?.list),
			freeShipping: tableFilterToBoolean(filtersInfo?.freeShipping),
			search,
			categories:
				filtersInfo?.categories === null ||
				filtersInfo?.categories?.length === 0
					? undefined
					: (filtersInfo?.categories as string[]),
			sortCriteria: sortInfo?.order
				? (sortInfo?.columnKey as SortCriteria)
				: undefined,
			limit: paginationInfo.pageSize,
			skip:
				paginationInfo.current && paginationInfo.pageSize
					? (paginationInfo.current - 1) * paginationInfo.pageSize
					: undefined,
			sortType:
				sortInfo?.order === "ascend"
					? SortType.Asc
					: sortInfo?.order === "descend"
					? SortType.Desc
					: undefined,
			type:
				filtersInfo?.type === null || filtersInfo?.type?.length === 0
					? undefined
					: (filtersInfo?.type as ProductType[]),
			condition:
				filtersInfo?.condition === null || filtersInfo?.condition?.length === 0
					? undefined
					: (filtersInfo?.condition as ProductCondition[]),
			brand:
				filtersInfo?.brand === null || filtersInfo?.brand?.length === 0
					? undefined
					: (filtersInfo?.brand as string[]),
		};
		return variables;
	};

	const clearSearch = async () => {
		if (search) setSearch(undefined);
		let variables = getVariables();
		setPaginationInfo({ ...paginationInfo, current: 1 });
		await refetch({ ...variables, search: undefined });
	};

	const handleSearch = async (value?: string) => {
		setSearch(value);
		const variables = getVariables();
		await refetch({ ...variables, search: value });
	};

	const showProductDeleteConfirm = async (
		product: IProductFullTranslations
	) => {
		confirm({
			title: `¿Seguro(a) que deseas borrar este producto?`,
			icon: <ExclamationCircleOutlined />,
			content: (
				<div>
					<Paragraph type="warning">Esta acción es irreversible</Paragraph>
					<Card>
						<Row>
							<Col span={8}>
								<Text strong>ID</Text>
							</Col>
							<Col span={16}>
								<Text>{product.id}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Título corto</Text>
							</Col>
							<Col span={16}>
								<Text>{product.listing.shortTitle.es}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Marca</Text>
							</Col>
							<Col span={16}>
								<Text>{product.manufacturer?.brand || "Genérico"}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Modelo</Text>
							</Col>
							<Col span={16}>
								<Text>{product.manufacturer?.model || "N/A"}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Condición</Text>
							</Col>
							<Col span={16}>
								<Text>{translateProductCondition(product.condition)}</Text>
							</Col>
						</Row>
					</Card>
				</div>
			),
			okText: "Si",
			centered: false,
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				const { data, errors } = await deleteProduct({
					variables: { id: product.id },
				});
				if (data?.deleteProduct) refetch(getVariables());
				if (errors || !data?.deleteProduct) {
					setTimeout(
						() => message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION),
						350
					);
				} else {
					setTimeout(
						() =>
							message.success(
								"¡El producto se ha eliminado exitosamente!",
								DEFAULT_MESSAGE_DURATION
							),
						350
					);
				}
				return;
			},
		});
	};
	useEffect(() => {
		if (error || errorCategories || errorBrands) {
			error && console.log("error", error);
			errorCategories && console.log(`errorCategories`, errorCategories);
			errorBrands && console.log(`errorBrands`, errorBrands);
			message.destroy();
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [error, errorCategories, errorBrands]);
	useEffect(() => {
		if (loadingCategories || loadingBrands) {
			setLoading(true);
		} else {
			setLoading(false);
		}
	}, [loadingCategories, loadingBrands]);

	const clearFilters = () => {
		setFiltersInfo({ applyDiscount: [], list: [], categories: [] });
		setSortInfo(undefined);
		setSearch(undefined);
		refetch({
			applyDiscount: undefined,
			limit: defaultPageSize,
			list: undefined,
			freeShipping: undefined,
			categories: undefined,
			skip: 0,
			sortCriteria: undefined,
			sortType: undefined,
			search: undefined,
			type: undefined,
			condition: undefined,
			brand: undefined,
		});
		setPaginationInfo({ ...paginationInfo, current: 1 });
	};
	const handleTableChange = async (
		pagination: TablePaginationConfig,
		filters: TableFilters,
		sorting: any
	) => {
		setPaginationInfo(pagination);
		setFiltersInfo(filters);
		setSortInfo({ columnKey: sorting.columnKey, order: sorting.order });
		const applyDiscount = Array.isArray(filters?.applyDiscount)
			? filters.applyDiscount.length === 2
				? undefined
				: filters.applyDiscount[0]
			: undefined;
		const list = Array.isArray(filters?.list)
			? filters.list.length === 2
				? undefined
				: filters.list[0]
			: undefined;
		const freeShipping = Array.isArray(filters?.freeShipping)
			? filters.freeShipping.length === 2
				? undefined
				: filters.freeShipping[0]
			: undefined;
		const sortCriteria = sorting?.order
			? (sorting?.columnKey as SortCriteria)
			: undefined;
		const sortType =
			sorting?.order === "ascend"
				? SortType.Asc
				: sorting?.order === "descend"
				? SortType.Desc
				: undefined;
		await refetch({
			applyDiscount: applyDiscount as boolean | undefined,
			list: list as boolean | undefined,
			freeShipping: freeShipping as boolean | undefined,
			categories:
				filters?.categories === null || filters?.categories?.length === 0
					? undefined
					: (filters?.categories as string[]),
			sortCriteria,
			limit: pagination.pageSize,
			skip:
				pagination.current && pagination.pageSize
					? (pagination.current - 1) * pagination.pageSize
					: undefined,
			sortType,
			type:
				filters?.type === null || filters?.type?.length === 0
					? undefined
					: (filters?.type as ProductType[]),
			condition:
				filters?.condition === null || filters?.condition?.length === 0
					? undefined
					: (filters?.condition as ProductCondition[]),
			search,
			brand:
				filters?.brand === null || filters?.brand?.length === 0
					? undefined
					: (filters?.brand as string[]),
		});
	};
	const columns: ColumnsType<object> = [
		{
			title: "#",
			render: (_product, _any, index) => {
				return index + 1;
			},
			align: "center",
			key: "index",
			width: 45,
			fixed: "left",
		},
		{ title: "SKU", dataIndex: "id", align: "center", width: 140 },
		{
			title: "Miniatura",
			render: (product: IProductFullTranslations) => {
				const imageUrl =
					product.images && product.images[0]
						? product.images[0].url
						: undefined;
				const url = imageUrl
					? process.env.NEXT_PUBLIC_BUCKET_BASE_URL + imageUrl
					: "/static/default-image.jpg";
				return (
					<Tooltip title="Ver imagen" placement="right">
						<div>
							<a
								onClick={() => {
									window && window.open(url, "_blank");
								}}
							>
								<Image src={url} width={80} height={80} objectFit="contain" />
							</a>
						</div>
					</Tooltip>
				);
			},
			responsive: ["xxl", "xl", "md"],
			align: "center",
			width: 100,
			key: "image",
		},
		{
			title: "Título corto",
			dataIndex: ["listing", "shortTitle", "es"],
			key: "listing.shortTitle.es",
			align: "center",
			ellipsis: true,
		},
		{
			title: "Extensión URL",
			dataIndex: "slug",
			align: "center",
			ellipsis: true,
		},
		{
			title: "Enlistado",
			render: (product: IProductFullTranslations) => {
				return (
					<Tag color={product.list ? "green" : "red"} className="center">
						{product.list ? "Si" : "No"}
					</Tag>
				);
			},
			width: 120,
			align: "center",
			key: "list",
			filters: booleanFilters,
			filteredValue: filtersInfo?.list || [],
		},
		{
			title: "Descuento aplicado",
			render: (product: IProductFullTranslations) => {
				return (
					<Tag
						color={product.applyDiscount ? "green" : "red"}
						className="center"
					>
						{product.applyDiscount ? "Si" : "No"}
					</Tag>
				);
			},
			width: 120,
			align: "center",
			key: "applyDiscount",
			filters: booleanFilters,
			filteredValue: filtersInfo?.applyDiscount || [],
		},
		{
			title: "Envío gratis",
			render: (product: IProductFullTranslations) => {
				return (
					<Tag
						color={product.freeShipping ? "green" : "red"}
						className="center"
					>
						{product.freeShipping ? "Si" : "No"}
					</Tag>
				);
			},
			align: "center",
			width: 120,
			key: "freeShipping",
			filters: booleanFilters,
			filteredValue: filtersInfo?.freeShipping || [],
		},
		{
			title: "Categorías",
			width: 230,
			filters: transformCategoriesForFilters(
				dataCategories?.getCategories as ICategoryFullTranslations[]
			),
			filteredValue: filtersInfo?.categories || [],
			render: (product: IProductFullTranslations) => {
				return (
					<CategoryTags
						categories={product.categories as ICategoryFullTranslations[]}
					/>
				);
			},
			key: "categories",
		},
		{
			title: "Tipo",
			render: (product: IProductFullTranslations) =>
				translateProductType(product.type),
			responsive: ["xxl", "xl", "md"],
			align: "center",
			key: "type",
			filters: Object.values(ProductType).map((type) => ({
				value: type,
				text: translateProductType(type),
			})),
			filteredValue: filtersInfo?.type || [],
		},
		{
			title: "Condición",
			render: (product: IProductFullTranslations) =>
				translateProductCondition(product.condition),
			align: "center",
			filters: Object.values(ProductCondition).map((condition) => ({
				value: condition,
				text: translateProductCondition(condition),
			})),
			filteredValue: filtersInfo?.condition || [],
			key: "condition",
		},
		{
			title: "Marca",
			align: "center",
			filters: dataBrands?.getDistinctBrands?.map((brand) => ({
				text: brand,
				value: brand,
			})),
			render: (product: IProductFullTranslations) =>
				product.manufacturer?.brand || "Genérico",
			filteredValue: filtersInfo?.brand || [],
			key: "brand",
		},
		{
			title: "# de modelo",
			align: "center",
			ellipsis: true,
			render: (product: IProductFullTranslations) =>
				product.manufacturer?.brand || "N/A",
			key: "manufacturer.model",
		},
		{
			title: "Cantidad",
			dataIndex: "quantity",
			align: "center",
			width: 90,
			key: "quantity",
		},
		{
			title: "Precio",
			render: (product: IProductFullTranslations) => {
				return priceFormatter.format(product.pricing.price);
			},
			width: 100,
			align: "center",
			ellipsis: true,
			key: "pricing.price",
		},
		{
			title: "Precio de descuento",
			render: (product: IProductFullTranslations) => {
				return priceFormatter.format(product.pricing.discountPrice);
			},
			width: 100,
			ellipsis: true,
			align: "center",
			key: "pricing.discountPrice",
		},
		{
			title: "Costo de envío",
			ellipsis: true,
			render: (product: IProductFullTranslations) => {
				return priceFormatter.format(product.pricing.shipping);
			},
			width: 100,
			align: "center",
			key: "pricing.shipping",
		},
		{
			title: "Adicionado",
			render: (item) => {
				const time = dayjs(item.createdAt).fromNow();
				return time;
			},
			align: "center",
			key: "createdAt",
			width: 130,
			sorter: (previous: any, current: any) => {
				return (
					dayjs(previous.createdAt).unix() - dayjs(current.createdAt).unix()
				);
			},
			sortOrder:
				sortInfo?.columnKey === "createdAt" ? sortInfo.order : undefined,
		},
		{
			title: "Actualizado",
			render: (item) => {
				const time = dayjs(item.updatedAt).fromNow();
				return time;
			},
			width: 130,
			responsive: ["xxl", "xl", "md"],
			align: "center",
			key: "updatedAt",
			sorter: (previous: any, current: any) => {
				return (
					dayjs(previous.updatedAt).unix() - dayjs(current.updatedAt).unix()
				);
			},
			sortOrder:
				sortInfo?.columnKey === "updatedAt" ? sortInfo.order : undefined,
		},
		{
			title: "Acciones",
			align: "center",
			render: (product: IProductFullTranslations) => {
				return (
					<Space align="center">
						<Link
							href="/merchandise-inventory/details/[id]"
							as={`/merchandise-inventory/details/${product.id}`}
						>
							<a
								onClick={() => {
									client.writeQuery<GetProductQuery>({
										data: { __typename: "Query", getProduct: { ...product } },
										query: GetProductDocument,
										variables: { id: product.id },
									});
								}}
							>
								<Tooltip placement="top" title="Ver producto">
									<Button icon={<EyeOutlined />} size="small" />
								</Tooltip>
							</a>
						</Link>
						<Link
							href="/merchandise-inventory/edit/[id]"
							as={`/merchandise-inventory/edit/${product.id}`}
						>
							<a
								onClick={() => {
									client.writeQuery<GetProductQuery>({
										data: { __typename: "Query", getProduct: { ...product } },
										query: GetProductDocument,
										variables: { id: product.id },
									});
								}}
							>
								<Tooltip placement="top" title="Editar">
									<Button icon={<EditOutlined />} size="small" />
								</Tooltip>
							</a>
						</Link>
						<Tooltip placement="top" title="Eliminar">
							<Button
								icon={<DeleteOutlined />}
								onClick={() => {
									showProductDeleteConfirm(product);
								}}
								size="small"
							/>
						</Tooltip>
					</Space>
				);
			},
			fixed: "right",
			width: 110,
			key: "updatedAt",
		},
	];
	const refreshTable = () => {
		refetch();
		refetchBrands();
		refetchCategories();
	};
	const tableLoading = loading || networkStatus === NetworkStatus.refetch;
	const [tableData, setTableData] = useState(() => data);
	useEffect(() => {
		if (data?.getProducts && tableData !== data) setTableData(data);
	}, [data]);
	return (
		<div>
			<Subheader title="Inventario de mercancía" />
			<div className="main-container">
				<Card size="small">
					<Row gutter={[15, 15]} justify="space-between" align="middle">
						<Col
							xl={{ order: 1 }}
							lg={{ order: 1 }}
							md={{ order: 1 }}
							sm={{ order: 1 }}
							xs={{ order: 1 }}
						>
							<Link href="/merchandise-inventory/add">
								<Button icon={<PlusOutlined />} type="primary">
									Agregar
								</Button>
							</Link>
						</Col>
						<Col
							xl={{ span: 11, order: 2 }}
							lg={{ span: 14, order: 2 }}
							md={{ span: 18, order: 3 }}
							sm={{ span: 24, order: 3 }}
							xs={{ span: 24, order: 3 }}
						>
							<Input.Search
								placeholder="Buscar titulo, descripción, marca o número de modelo..."
								onSearch={handleSearch}
								value={search ? undefined : undefined}
								enterButton
							/>
						</Col>
						<Col
							xl={{ order: 3 }}
							lg={{ order: 3 }}
							md={{ order: 2 }}
							sm={{ order: 2 }}
							xs={{ order: 2 }}
							className="text-right float-right"
						>
							<ClearFiltersButton
								disabled={tableLoading}
								action={clearFilters}
							/>
							<RefreshButton disabled={tableLoading} action={refreshTable} />
						</Col>
						<Col xs={{ span: 24, order: 4 }}>
							<Table
								scroll={{ x: 3000 }}
								bordered
								loading={tableLoading}
								size="small"
								columns={columns}
								tableLayout="fixed"
								title={
									search
										? () => {
												return (
													<Row justify="space-between">
														<Col>
															<Text>
																Mostrando resultados de "
																<Text strong>{search}</Text>"
															</Text>
														</Col>
														<Col>
															<a onClick={clearSearch}>Limpar busqueda</a>
														</Col>
													</Row>
												);
										  }
										: undefined
								}
								pagination={{
									total: tableData?.getProducts?.total,
									pageSizeOptions: ["10", "25", "50", "75", "100"],
									defaultPageSize,
									pageSize: paginationInfo.pageSize,
									defaultCurrent: 1,
									current: paginationInfo.current,
									showQuickJumper: true,
									size: "small",
									showTotal: (total, range) => {
										return `${
											total > 1 ? `${range[0]}-${range[1]} de ` : ""
										} ${total} ${total === 1 ? "producto" : "productos"}`;
									},
									showSizeChanger: true,
								}}
								dataSource={tableData?.getProducts?.products as object[]}
								rowKey="id"
								onChange={handleTableChange}
							/>
						</Col>
					</Row>
				</Card>
			</div>
		</div>
	);
};

export default MerchandiseInventory;
