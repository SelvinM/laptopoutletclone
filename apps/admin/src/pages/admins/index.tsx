import React, { useEffect, useState } from "react";
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
	Modal,
	Typography,
} from "antd";

import {
	EditOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Subheader from "../../components/Subheader";
import { TablePaginationConfig } from "antd/lib/table";
import { ColumnsType } from "antd/lib/table/interface";
import { SortType, SortCriteria, SortInfo, TableFilters } from "../../types";
import { NetworkStatus } from "@apollo/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import {
	GetAdminDocument,
	GetAdminQuery,
	useDeleteAdminMutation,
	useGetAdminsQuery,
	useMeQuery,
} from "../../libs/graphql/operations/admin.graphql";
import { Role } from "@laptopoutlet-packages/types";
import { translateRoles } from "../../utils/translations";
import { DATA_LOAD_ERROR, GENERAL_ERROR } from "../../constants/messages";
import {
	DEFAULT_MESSAGE_DURATION,
	DEFAULT_PAGINATION_LIMIT,
} from "../../constants";
import ClearFiltersButton from "../../components/ClearFiltersButton";
import RefreshButton from "../../components/RefreshButton";
import Error403 from "../../components/Error403";
import isUserAllowed from "../../utils/isUserAllowed";
import { ADMINS_ROLES } from "../../constants/pageRoles";
import { IAdmin } from "packages/models/src/Admin/types";
dayjs.locale("es");
dayjs.extend(relativeTime);
interface Props {}
const { confirm } = Modal;
const { Text, Paragraph } = Typography;
const Admins = ({}: Props) => {
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
		useGetAdminsQuery({
			variables: { limit: DEFAULT_PAGINATION_LIMIT },
			notifyOnNetworkStatusChange: true,
		});
	const [deleteAdmin] = useDeleteAdminMutation();
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
	const showDeleteConfirm = async (admin: IAdmin) => {
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
								<Text>{admin.id}</Text>
							</Col>
							<Col span={8}>
								<Text strong>Nombre</Text>
							</Col>
							<Col span={16}>
								<Text>
									{admin.firstname} {admin.lastname}
								</Text>
							</Col>
							<Col span={8}>
								<Text strong>Email</Text>
							</Col>
							<Col span={16}>
								<Text>{admin.email}</Text>
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
				const { data, errors } = await deleteAdmin({
					variables: { id: admin.id },
				});
				if (data?.deleteAdmin) refetch(getVariables());
				if (errors || !data?.deleteAdmin) {
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
	const columns: ColumnsType<object> = [
		{
			title: "#",
			render: (_admin, _any, index) => {
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
			title: "Nombres",
			dataIndex: "firstname",
			align: "center",
		},
		{
			title: "Apellidos",
			dataIndex: "lastname",
			align: "center",
		},
		{
			title: "Correo electrónico",
			dataIndex: "email",
			align: "center",
		},
		{
			title: "Roles",
			width: 300,
			render: (admin: IAdmin) => (
				<Space direction="vertical" size="small">
					{admin.roles
						.slice()
						.sort()
						.map((role, index) => (
							<Tag
								key={index}
								color={role === Role.SuperAdmin ? "purple" : "blue"}
							>
								{translateRoles(role)}
							</Tag>
						))}
				</Space>
			),
			key: "roles",
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
			render: (admin: IAdmin) => {
				return (
					<Space align="center">
						<Link href="/admins/edit/[id]" as={`/admins/edit/${admin.id}`}>
							<a>
								<Tooltip placement="top" title="Editar">
									<Button
										onClick={() => {
											client.writeQuery<GetAdminQuery>({
												data: {
													__typename: "Query",
													getAdmin: {
														...admin,
													},
												},
												query: GetAdminDocument,
												variables: { id: admin.id },
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
									showDeleteConfirm(admin);
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
	const [tableData, setTableData] = useState(() => data);
	useEffect(() => {
		if (data?.getAdmins && tableData !== data) setTableData(data);
	}, [data]);
	return (
		<div>
			<Subheader title="Administradores" />
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
							<Link href="/admins/add">
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
							<ClearFiltersButton
								action={clearFilters}
								disabled={tableLoading}
							/>
							<RefreshButton disabled={tableLoading} action={refreshTable} />
						</Col>
						<Col xs={{ span: 24, order: 4 }}>
							<Table
								bordered
								loading={tableLoading}
								size="small"
								columns={columns}
								tableLayout="fixed"
								scroll={{ x: 1500 }}
								pagination={{
									total: data?.getAdmins.total,
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
										} ${total} ${
											total === 1 ? "administrador" : "administradores"
										}`;
									},
									showSizeChanger: true,
								}}
								dataSource={tableData?.getAdmins.admins as object[]}
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

export default Admins;
