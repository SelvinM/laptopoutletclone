import React, { useEffect, useState } from "react";
import { Card, Table, message, Row, Col, Tag, Typography, List } from "antd";
import Subheader from "../../components/Subheader";
import { TablePaginationConfig } from "antd/lib/table";
import { ColumnsType } from "antd/lib/table/interface";
import { SortType, SortCriteria, SortInfo, TableFilters } from "../../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import {
	GetOrderDocument,
	GetOrderQuery,
	useGetOrdersQuery,
} from "../../libs/graphql/operations/order.graphql";
import { GENERAL_ERROR } from "../../constants/messages";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import isUserAllowed from "../../utils/isUserAllowed";
import Error403 from "../../components/Error403";
import { ORDERS_ROLES } from "../../constants/pageRoles";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import { NetworkStatus } from "@apollo/client";
import RefreshButton from "../../components/RefreshButton";
import ClearFiltersButton from "../../components/ClearFiltersButton";
import Link from "next/link";
import { getPriceFormatter } from "@laptopoutlet-packages/utils";
import { Currency, Locale, ShipmentStatus } from "@laptopoutlet-packages/types";
import { translateShipmentStatus } from "../../utils/translations";
import { ArrowRightOutlined } from "@ant-design/icons";
import { IOrderFullTranslations } from "packages/models/src/Order/types";
const { Paragraph, Text } = Typography;
dayjs.locale("es");
dayjs.extend(relativeTime);
interface Props {}

const defaultPageSize = 10;
const Orders = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: ORDERS_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//roll access control finish
	const [sortInfo, setSortInfo] = useState<SortInfo>();
	const [filtersInfo, setFiltersInfo] = useState<TableFilters>();
	const { data, loading, error, refetch, networkStatus, client } =
		useGetOrdersQuery({
			variables: { options: { limit: defaultPageSize } },
			notifyOnNetworkStatusChange: true,
		});
	const [tableData, setTableData] = useState(() => data);
	useEffect(() => {
		if (data?.getOrders && tableData !== data) setTableData(data);
	}, [data]);
	useEffect(() => {
		if (error) message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	error && console.log(`error`, error);
	const clearFilters = async () => {
		setFiltersInfo({ shipmentStatus: [] });
		setSortInfo(undefined);
		await refetch({
			options: undefined,
		});
	};
	const handleTableChange = async (
		pagination: TablePaginationConfig,
		filters: TableFilters,
		sorting: any
	) => {
		setSortInfo({ columnKey: sorting.columnKey, order: sorting.order });
		const sortCriteria = sorting?.order
			? (sorting?.columnKey as SortCriteria)
			: undefined;
		setFiltersInfo(filters);
		const sortType =
			sorting?.order === "ascend"
				? SortType.Asc
				: sorting?.order === "descend"
				? SortType.Desc
				: undefined;
		await refetch({
			options: {
				sort: { criteria: sortCriteria, type: sortType },
				shipmentStatus:
					filters?.shipmentStatus === null ||
					filters?.shipmentStatus?.length === 0
						? undefined
						: (filters?.shipmentStatus as ShipmentStatus[]),
				limit: pagination.pageSize,
				skip:
					pagination.current && pagination.pageSize
						? (pagination.current - 1) * pagination.pageSize
						: undefined,
			},
		});
	};
	const priceFormatter = getPriceFormatter(Locale.Es, Currency.Hnl);
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
			title: "id",
			dataIndex: "id",
			align: "center",
			width: 160,
		},
		{
			title: "Cliente",
			render: (order: IOrderFullTranslations) => {
				if (!order.user) return <span>Cuenta eliminada</span>;
				return (
					<div>
						<Paragraph className="m-0" ellipsis>
							ID: {order.user.id}
						</Paragraph>
						<Paragraph className="m-0" ellipsis>
							Nombre: {order.user.name} {order.user.surname}
						</Paragraph>
						<Paragraph ellipsis>Email: {order.user.email}</Paragraph>
					</div>
				);
			},
		},
		{
			title: "Estado de envíos",
			render: (order: IOrderFullTranslations) => {
				return (
					<List>
						{order.shipments.map((shipment) => (
							<List.Item key={shipment.id}>
								<Text>Paquete #{shipment.id}</Text>
								<ArrowRightOutlined />
								<Tag
									color={
										shipment.status === ShipmentStatus.Pending
											? "processing"
											: "success"
									}
								>
									{translateShipmentStatus(shipment.status)}
								</Tag>
							</List.Item>
						))}
					</List>
				);
			},
			width: 370,
			filters: [
				{ text: "Pendiente", value: ShipmentStatus.Pending },
				{ text: "Enviado", value: ShipmentStatus.Shipped },
			],
			key: "shipmentStatus",
			filteredValue: filtersInfo?.shipmentStatus as string[],
		},
		{
			title: "Cant. de productos",
			dataIndex: ["invoice", "totalQuantity"],
			align: "center",
			width: 100,
			ellipsis: true,
		},
		{
			title: "Total de productos",
			render: (order: IOrderFullTranslations) => {
				return priceFormatter.format(order.invoice.itemsTotalPrice || 0);
			},
			align: "center",
			width: 100,
			ellipsis: true,
		},
		{
			title: "Total de envío",
			render: (order: IOrderFullTranslations) => {
				return priceFormatter.format(order.invoice.shippingTotalPrice);
			},
			align: "center",
			width: 100,
			ellipsis: true,
		},
		{
			title: "Retornado",
			render: (order: IOrderFullTranslations) => {
				return priceFormatter.format(order.invoice.returned || 0);
			},
			align: "center",
			width: 100,
			ellipsis: true,
		},

		{
			title: "Total del pedido",
			render: (order: IOrderFullTranslations) => {
				return priceFormatter.format(order.invoice.totalPrice);
			},
			align: "center",
			width: 100,
			ellipsis: true,
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
			render: (order: IOrderFullTranslations) => {
				return (
					<Link href="/orders/details/[id]" as={`/orders/details/${order.id}`}>
						<a
							onClick={() => {
								client.writeQuery<GetOrderQuery>({
									data: {
										__typename: "Query",
										getOrder: { __typename: "Order", ...order },
									},
									query: GetOrderDocument,
									variables: { id: order.id },
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
			<Subheader title="Pedidos" />
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
								scroll={{ x: 1760 }}
								loading={tableLoading}
								size="small"
								columns={columns}
								tableLayout="fixed"
								pagination={{
									total: tableData?.getOrders.total,
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
								dataSource={tableData?.getOrders.orders as object[]}
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

export default Orders;
