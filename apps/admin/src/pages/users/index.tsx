import React, { useEffect, useState } from "react";
import { Card, Table, message, Row, Col, Input, Typography } from "antd";
import Subheader from "../../components/Subheader";
import { TablePaginationConfig } from "antd/lib/table";
import { ColumnsType } from "antd/lib/table/interface";
import { SortType, SortCriteria, SortInfo, TableFilters } from "../../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { useGetUsersQuery } from "../../libs/graphql/operations/user.graphql";
import { GENERAL_ERROR } from "../../constants/messages";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import isUserAllowed from "../../utils/isUserAllowed";
import Error403 from "../../components/Error403";
import { USERS_ROLES } from "../../constants/pageRoles";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import { NetworkStatus } from "@apollo/client";
import RefreshButton from "../../components/RefreshButton";
import ClearFiltersButton from "../../components/ClearFiltersButton";
dayjs.locale("es");
dayjs.extend(relativeTime);
interface Props {}
const defaultPageSize = 10;
const { Text } = Typography;
const Users = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: USERS_ROLES,
		roles: meData?.me?.roles || [],
	});

	if (meData?.me && !allowed) {
		return <Error403 />;
	}
	//roll access control finish
	const [sortInfo, setSortInfo] = useState<SortInfo>();
	const { data, loading, error, refetch, networkStatus } = useGetUsersQuery({
		variables: { limit: defaultPageSize },
		notifyOnNetworkStatusChange: true,
	});
	const [search, setSearch] = useState<string>();
	const [tableData, setTableData] = useState(() => data);
	useEffect(() => {
		if (data?.getUsers && tableData !== data) setTableData(data);
	}, [data]);
	useEffect(() => {
		if (error) {
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [error]);
	const clearFilters = async () => {
		setSortInfo(undefined);
		await refetch({
			sortCriteria: undefined,
			sortType: undefined,
			search: undefined,
			skip: undefined,
		});
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
	const [paginationInfo, setPaginationInfo] = useState<TablePaginationConfig>(
		{}
	);
	const columns: ColumnsType<object> = [
		{
			title: "#",
			render: (_user, _any, index) => {
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
			width: 160,
			align: "center",
		},
		{
			title: "Apellido",
			dataIndex: "surname",
			width: 160,
			align: "center",
		},
		{
			title: "Teléfono",
			dataIndex: "phone",
			align: "center",
		},
		{
			title: "Correo electrónico",
			dataIndex: "email",
			align: "center",
			// filterDropdown: (e)=>{}
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
	];
	const getVariables = () => {
		const variables = {
			email: search,

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
	const refreshTable = () => {
		refetch();
	};
	const tableLoading = loading || networkStatus === NetworkStatus.refetch;
	return (
		<div>
			<Subheader title="Clientes" />
			<div className="main-container">
				<Card size="small">
					<Row gutter={[15, 15]} justify="space-between" align="middle">
						<Col
							xl={{ span: 11, order: 2 }}
							lg={{ span: 14, order: 2 }}
							md={{ span: 18, order: 3 }}
							sm={{ span: 24, order: 3 }}
							xs={{ span: 24, order: 3 }}
						>
							<Input.Search
								enterButton
								placeholder="Buscar por nombre o correo electrónico..."
								onSearch={handleSearch}
								value={search ? undefined : undefined}
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
								bordered
								loading={tableLoading}
								size="small"
								columns={columns}
								scroll={{ x: 1000 }}
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
								tableLayout="fixed"
								pagination={{
									total: tableData?.getUsers.total,
									pageSizeOptions: [
										defaultPageSize.toString(),
										"25",
										"50",
										"75",
										"100",
									],
									defaultPageSize,
									defaultCurrent: 1,
									showQuickJumper: true,
									size: "small",
									showTotal: (total, range) => {
										return `${
											total > 1 ? `${range[0]}-${range[1]} de ` : ""
										} ${total} ${total === 1 ? "cliente" : "clientes"}`;
									},
									showSizeChanger: true,
								}}
								dataSource={tableData?.getUsers.users as object[]}
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

export default Users;
