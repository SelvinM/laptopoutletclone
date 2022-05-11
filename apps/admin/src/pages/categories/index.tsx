import React, { useEffect } from "react";
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import {
	Card,
	Row,
	Col,
	Button,
	Table,
	message,
	Space,
	Tooltip,
	Modal,
	Typography,
	Tag,
} from "antd";
import Link from "next/link";
import Subheader from "../../components/Subheader";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import {
	GetCategoriesDocument,
	GetCategoryDocument,
	GetCategoryQuery,
	useDeleteCategoryMutation,
	useGetCategoriesQuery,
} from "../../libs/graphql/operations/category.graphql";
import RefreshButton from "../../components/RefreshButton";
import { GENERAL_ERROR } from "../../constants/messages";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import Error403 from "../../components/Error403";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import isUserAllowed from "../../utils/isUserAllowed";
import { CATEGORIES_ROLES } from "../../constants/pageRoles";
import { ICategoryFullTranslations } from "packages/models/src/Category/types";
import { NetworkStatus } from "@apollo/client";

interface Props {}
const { confirm } = Modal;
const { Paragraph, Text } = Typography;
dayjs.locale("es");
dayjs.extend(relativeTime);
const Categories = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: CATEGORIES_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const { data, loading, error, refetch, client, networkStatus } =
		useGetCategoriesQuery({ notifyOnNetworkStatusChange: true });
	const [deleteCategory] = useDeleteCategoryMutation();
	useEffect(() => {
		if (error) {
			message.destroy();
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [error]);

	const refreshTable = () => {
		refetch();
	};
	const showDeleteConfirm = async (category: ICategoryFullTranslations) => {
		confirm({
			title: "¿Seguro(a) que deseas borrar esta categoría?",
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
								<Text>{category.id}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Nombre</Text>
							</Col>
							<Col span={16}>
								<Text>{category.name.es}</Text>
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
				const { data, errors } = await deleteCategory({
					variables: { id: category.id },
					awaitRefetchQueries: true,
					refetchQueries: [{ query: GetCategoriesDocument }],
				});
				if (errors || !data?.deleteCategory) {
					setTimeout(
						() => message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION),
						350
					);
				} else {
					setTimeout(
						() =>
							message.success("¡La categoría se ha eliminado exitosamente!", 2),
						350
					);
				}
				return;
			},
		});
	};
	const columns: ColumnsType<object> = [
		{
			title: "id",
			dataIndex: "id",
		},

		{
			title: "Imagen",
			render: (category: ICategoryFullTranslations) => {
				const imageid = category.imageUrl;
				const url = imageid
					? process.env.NEXT_PUBLIC_BUCKET_BASE_URL + imageid
					: "/static/default-image.jpg";
				return imageid ? (
					<Tooltip title="Ver imagen" placement="right">
						<div>
							<a
								onClick={() => {
									window && window.open(url, "_blank");
								}}
							>
								<img className="img-responsive" src={url} alt="" />
							</a>
						</div>
					</Tooltip>
				) : (
					<img className="img-responsive" src={url} alt="" />
				);
			},
			align: "center",
			width: 100,
			key: "image",
		},
		{
			title: "Nombre",
			dataIndex: ["name", "es"],
		},
		{
			title: "Descripción",
			dataIndex: ["description", "es"],
			ellipsis: true,
		},
		{
			title: "Mostrar en menú",
			render: (category: ICategoryFullTranslations) => {
				return (
					<Tag color={category.showInMenu ? "green" : "red"} className="center">
						{category.showInMenu ? "Si" : "No"}
					</Tag>
				);
			},
			width: 128,
			align: "center",
		},
		{
			title: "Opcional",
			render: (category: ICategoryFullTranslations) => {
				return (
					<Tag color={category.isOptional ? "green" : "red"} className="center">
						{category.isOptional ? "Si" : "No"}
					</Tag>
				);
			},
			width: 80,
			align: "center",
		},
		{
			title: "Adicionado",
			render: (category: ICategoryFullTranslations) => {
				const time = dayjs(category.createdAt).fromNow();
				return time;
			},
			width: 120,
			align: "center",
			key: "createdAt",
		},
		{
			title: "Actualizado",
			render: (item) => {
				const time = dayjs(item.updatedAt).fromNow();
				return time;
			},
			width: 120,
			align: "center",
			key: "updatedAt",
		},
		{
			title: "Acciones",
			align: "center",
			render: (category: ICategoryFullTranslations) => {
				return (
					<Space align="center">
						<Link
							href="/categories/edit/[id]"
							as={`/categories/edit/${category.id}`}
						>
							<a>
								<Tooltip placement="top" title="Editar">
									<Button
										onClick={() => {
											client.writeQuery<GetCategoryQuery>({
												data: {
													__typename: "Query",
													getCategory: {
														...category,
													},
												},
												query: GetCategoryDocument,
												variables: { id: category.id },
											});
										}}
										icon={<EditOutlined />}
										size="small"
									/>
								</Tooltip>
							</a>
						</Link>
						<Tooltip placement="top" title="Eliminar">
							<Button
								icon={<DeleteOutlined />}
								onClick={() => {
									showDeleteConfirm(category);
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
	const tableLoading = loading || networkStatus === NetworkStatus.refetch;
	return (
		<div>
			<Subheader title="Categorías" />
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
							<Link href="/categories/add">
								<Button icon={<PlusOutlined />} type="primary">
									Agregar
								</Button>
							</Link>
						</Col>
						<Col
							xl={{ order: 3 }}
							lg={{ order: 3 }}
							md={{ order: 2 }}
							sm={{ order: 2 }}
							xs={{ order: 2 }}
							className="text-right float-right"
						>
							<RefreshButton action={refreshTable} disabled={tableLoading} />
						</Col>
						<Col xs={{ span: 24, order: 4 }}>
							<Table
								bordered
								loading={tableLoading}
								size="small"
								scroll={{ x: 1500 }}
								pagination={{ hideOnSinglePage: true }}
								columns={columns}
								tableLayout="fixed"
								dataSource={data?.getCategories as object[]}
								rowKey="id"
							/>
						</Col>
					</Row>
				</Card>
			</div>
		</div>
	);
};

export default Categories;
