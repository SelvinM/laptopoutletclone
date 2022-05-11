import React, { useEffect, useState } from "react";
import Error403 from "../../components/Error403";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import isUserAllowed from "../../utils/isUserAllowed";
import { ColumnsType } from "antd/lib/table/interface";
import { ORDERS_ROLES } from "../../constants/pageRoles";
import { SortCriteria, SortInfo, SortType } from "../../types";
import {
	GetCancellationDocument,
	GetCancellationQuery,
	useGetCancellationsQuery,
} from "../../libs/graphql/operations/cancellation.graphql";
import {
	Card,
	Col,
	message,
	Row,
	Table,
	TablePaginationConfig,
	Tag,
	Typography,
} from "antd";
import { GENERAL_ERROR } from "../../constants/messages";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import { ICancellationFullTranslations } from "packages/models/src/Cancellation/types";
import Link from "next/link";
import { NetworkStatus } from "@apollo/client";
import Subheader from "../../components/Subheader";
import ClearFiltersButton from "../../components/ClearFiltersButton";
import RefreshButton from "../../components/RefreshButton";
const { Paragraph } = Typography;
interface Props {}
const defaultPageSize = 10;
dayjs.locale("es");
dayjs.extend(relativeTime);
const Cancellation = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: ORDERS_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const [sortInfo, setSortInfo] = useState<SortInfo>();
	const { data, loading, error, refetch, networkStatus, client } =
		useGetCancellationsQuery({
			variables: { options: { limit: defaultPageSize } },
			notifyOnNetworkStatusChange: true,
		});
	const [tableData, setTableData] = useState(() => data);
	useEffect(() => {
		if (data?.getCancellations && tableData !== data) setTableData(data);
	}, [data]);
	useEffect(() => {
		if (error) message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	error && console.log(`error`, error);
	const clearFilters = async () => {
		setSortInfo(undefined);
		await refetch({
			options: undefined,
		});
	};
	const handleTableChange = async (
		pagination: TablePaginationConfig,
		sorting: any
	) => {
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
			options: {
				sort: { criteria: sortCriteria, type: sortType },

				limit: pagination.pageSize,
				skip:
					pagination.current && pagination.pageSize
						? (pagination.current - 1) * pagination.pageSize
						: undefined,
			},
		});
	};
	const columns: ColumnsType<object> = [
		{
			title: "#",
			render: (_order, _any, index) => {
				return index + 1;
			},
			align: "center",
			key: "index",
			width: 45,
			fixed: "left",
		},
		{
			title: "ID",
			dataIndex: "id",
			align: "center",
			width: 80,
		},
		{
			title: "ID de la orden",
			dataIndex: "order",
			align: "center",
			width: 160,
		},
		{
			title: "Cliente",
			render: (cancellation: ICancellationFullTranslations) => {
				if (!cancellation.user) return <span>Cuenta eliminada</span>;
				return (
					<div>
						<Paragraph className="m-0" ellipsis>
							ID: {cancellation.user.id}
						</Paragraph>
						<Paragraph className="m-0" ellipsis>
							Nombre: {cancellation.user.name} {cancellation.user.surname}
						</Paragraph>
						<Paragraph ellipsis>Email: {cancellation.user.email}</Paragraph>
					</div>
				);
			},
		},
		{
			title: "Cancelado por",
			render: (cancellation: ICancellationFullTranslations) => {
				return (
					<Tag color={cancellation.cancelledBy ? "success" : "processing"}>
						{cancellation.cancelledBy ? "Admin" : "Cliente"}
					</Tag>
				);
			},
			width: 200,
		},
		{
			title: "Realizado",
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
			title: "Modificado",
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
			render: (cancellation: ICancellationFullTranslations) => {
				return (
					<Link
						href="/cancellations/details/[id]"
						as={`/cancellations/details/${cancellation.id}`}
					>
						<a
							onClick={() => {
								client.writeQuery<GetCancellationQuery>({
									data: {
										__typename: "Query",
										getCancellation: {
											__typename: "Cancellation",
											...cancellation,
										},
									},
									query: GetCancellationDocument,
									variables: { id: cancellation.id },
								});
							}}
						>
							Ver detalles
						</a>
					</Link>
				);
			},
			fixed: "right",
			width: 110,
			key: "updatedAt",
		},
	];
	const refreshTable = () => {
		refetch();
	};
	const tableLoading = loading || networkStatus === NetworkStatus.refetch;
	return (
		<div>
			<Subheader title="Cancelaciones de pedidos" />
			<div className="main-container">
				<Card size="small">
					<Row gutter={[15, 15]} justify="space-between" align="middle">
						<Col
							xl={{ span: 11, order: 2 }}
							lg={{ span: 14, order: 2 }}
							md={{ span: 18, order: 3 }}
							sm={{ span: 24, order: 3 }}
							xs={{ span: 24, order: 3 }}
						></Col>
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
								tableLayout="fixed"
								pagination={{
									total: tableData?.getCancellations.total,
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
										} ${total} ${total === 1 ? "pedido" : "pedidos"}`;
									},
									showSizeChanger: true,
								}}
								dataSource={
									tableData?.getCancellations.cancellations as object[]
								}
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

export default Cancellation;
