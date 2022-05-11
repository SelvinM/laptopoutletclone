import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { NetworkStatus } from "@apollo/client";
import { IWarehouse } from "@laptopoutlet-packages/models";
import {
	Button,
	Card,
	Col,
	message,
	Modal,
	Row,
	Space,
	Table,
	Typography,
	Tooltip,
} from "antd";
import { TablePaginationConfig, ColumnsType } from "antd/lib/table";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ClearFiltersButton from "../../components/ClearFiltersButton";
import Error403 from "../../components/Error403";
import RefreshButton from "../../components/RefreshButton";
import Subheader from "../../components/Subheader";
import {
	DEFAULT_MESSAGE_DURATION,
	DEFAULT_PAGINATION_LIMIT,
} from "../../constants";
import { GENERAL_ERROR, DATA_LOAD_ERROR } from "../../constants/messages";
import { ADMINS_ROLES } from "../../constants/pageRoles";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import {
	useGetWarehousesQuery,
	useDeleteWarehouseMutation,
	GetWarehousesDocument,
	GetWarehouseQuery,
	GetWarehouseDocument,
} from "../../libs/graphql/operations/warehouse.graphql";
import { SortCriteria, SortInfo, SortType, TableFilters } from "../../types";
import isUserAllowed from "../../utils/isUserAllowed";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
dayjs.locale("es");
dayjs.extend(relativeTime);
interface Props {}
const { confirm } = Modal;
const { Paragraph, Text } = Typography;
const Warehouses = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: ADMINS_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const [paginationInfo, setPaginationInfo] = useState<TablePaginationConfig>(
		{}
	);
	const [sortInfo, setSortInfo] = useState<SortInfo>();
	const { data, loading, error, refetch, client, networkStatus } =
		useGetWarehousesQuery({
			variables: { limit: DEFAULT_PAGINATION_LIMIT },
			notifyOnNetworkStatusChange: true,
		});
	const [deleteWarehouse] = useDeleteWarehouseMutation();
	const getVariables = () => {
		const sortCriteria = sortInfo?.order
			? (sortInfo?.columnKey as SortCriteria)
			: undefined;
		const sortType =
			sortInfo?.order === "ascend"
				? SortType.Asc
				: sortInfo?.order === "descend"
				? SortType.Desc
				: undefined;
		const variables = {
			sortCriteria,
			limit: paginationInfo.pageSize,
			skip:
				paginationInfo.current && paginationInfo.pageSize
					? (paginationInfo.current - 1) * paginationInfo.pageSize
					: undefined,
			sortType,
		};
		return variables;
	};

	useEffect(() => {
		if (error) {
			message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [error]);
	const clearFilters = () => {
		setSortInfo(undefined);
		refetch({
			limit: undefined,
			skip: undefined,
			sortCriteria: undefined,
			sortType: undefined,
		});
	};
	const refreshTable = () => {
		refetch();
	};
	const handleTableChange = async (
		pagination: TablePaginationConfig,
		_filters: TableFilters,
		sorting: any
	) => {
		setPaginationInfo(pagination);
		setSortInfo({ columnKey: sorting.columnKey, order: sorting.order });
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
			sortCriteria,
			limit: pagination.pageSize,
			skip:
				pagination.current && pagination.pageSize
					? (pagination.current - 1) * pagination.pageSize
					: undefined,
			sortType,
		});
	};
	const showDeleteConfirm = async (warehouse: IWarehouse) => {
		confirm({
			title: "¿Seguro(a) que deseas borrar esta cuenta?",
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
								<Text>{warehouse.id}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Nombre</Text>
							</Col>
							<Col span={16}>
								<Text>{warehouse.name}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Dirección</Text>
							</Col>
							<Col span={16}>
								<Text>
									{warehouse.address.addressLine1},{" "}
									{warehouse.address.addressLine2
										? `${warehouse.address.addressLine2},`
										: ""}{" "}
									{warehouse.address.city}, {warehouse.address.province},{" "}
									{warehouse.address.country}, {warehouse.address.zipcode}
								</Text>
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
				const { data, errors } = await deleteWarehouse({
					variables: { id: warehouse.id },
					awaitRefetchQueries: true,
					refetchQueries: [
						{ query: GetWarehousesDocument, variables: getVariables() },
					],
				});
				if (errors || !data?.deleteWarehouse) {
					setTimeout(
						() => message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION),
						350
					);
				} else {
					setTimeout(
						() =>
							message.success("¡La cuenta se ha eliminado exitosamente!", 2),
						350
					);
				}
				return;
			},
		});
	};
	const columns: ColumnsType<object> = [
		{
			title: "#",
			render: (_warehouse, _any, index) => {
				return index + 1;
			},
			align: "center",
			key: "index",
			width: 45,
			fixed: "left",
		},
		{
			title: "id",
			dataIndex: "id",
			align: "center",
			width: 80,
		},
		{
			title: "Nombre",
			dataIndex: "name",
			align: "center",
			width: 300,
		},
		{
			title: "Longitud",
			dataIndex: ["point", "coordinates", 0],
			align: "center",
			width: 150,
		},
		{
			title: "Latitud",
			dataIndex: ["point", "coordinates", 1],
			align: "center",
			width: 150,
		},
		{
			title: "Dirección",
			render: (warehouse: IWarehouse) => {
				return `${warehouse.address.addressLine1}, ${
					warehouse.address.addressLine2
						? `${warehouse.address.addressLine2}, `
						: ""
				}${warehouse.address.city}, ${warehouse.address.province}, ${
					warehouse.address.country
				}, ${warehouse.address.zipcode}`;
			},
		},
		{
			title: "Adicionado",
			render: (item) => {
				const time = dayjs(item.createdAt).fromNow();
				return time;
			},
			width: 120,
			align: "center",
			key: "createdAt",
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
			width: 120,
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
			render: (warehouse: IWarehouse) => {
				return (
					<Space align="center">
						<Link
							href="/warehouses/edit/[id]"
							as={`/warehouses/edit/${warehouse.id}`}
						>
							<a>
								<Tooltip placement="top" title="Editar">
									<Button
										onClick={() => {
											client.writeQuery<GetWarehouseQuery>({
												data: {
													__typename: "Query",
													getWarehouse: {
														...warehouse,
													},
												},
												query: GetWarehouseDocument,
												variables: { id: warehouse.id },
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
									showDeleteConfirm(warehouse);
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
	return (
		<div>
			<Subheader title="Bodegas" />
			<div className="main-container">
				<Card size="small">
					<Row gutter={[15, 15]} justify="space-between" align="middle">
						<Col>
							<Link href="/warehouses/add">
								<Button icon={<PlusOutlined />} type="primary">
									Agregar
								</Button>
							</Link>
						</Col>
						<Col className="text-right float-right">
							<ClearFiltersButton
								action={clearFilters}
								disabled={loading || networkStatus === NetworkStatus.refetch}
							/>
							<RefreshButton
								disabled={loading || networkStatus === NetworkStatus.refetch}
								action={refreshTable}
							/>
						</Col>
						<Col xs={{ span: 24, order: 4 }}>
							<Table
								bordered
								scroll={{ x: 1700 }}
								loading={loading || networkStatus === NetworkStatus.refetch}
								size="small"
								columns={columns}
								tableLayout="fixed"
								pagination={{
									total: data?.getWarehouses.total,
									pageSizeOptions: [
										DEFAULT_PAGINATION_LIMIT.toString(),
										"25",
										"50",
										"75",
										"100",
									],
									defaultPageSize: DEFAULT_PAGINATION_LIMIT,
									defaultCurrent: 1,
									showQuickJumper: true,
									size: "small",
									showTotal: (total, range) => {
										return `${
											total > 1 ? `${range[0]}-${range[1]} de ` : ""
										} ${total} ${total === 1 ? "bodega" : "bodegas"}`;
									},
									showSizeChanger: true,
								}}
								dataSource={data?.getWarehouses.warehouses as object[]}
								rowKey="id"
								onChange={handleTableChange as any}
							/>
						</Col>
					</Row>
				</Card>
			</div>
		</div>
	);
};

export default Warehouses;
