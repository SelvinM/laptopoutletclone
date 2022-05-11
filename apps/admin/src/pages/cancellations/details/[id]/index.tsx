import React, { useContext, useEffect } from "react";
import Error403 from "apps/admin/src/components/Error403";
import { useMeQuery } from "apps/admin/src/libs/graphql/operations/admin.graphql";
import isUserAllowed from "apps/admin/src/utils/isUserAllowed";
import { ORDERS_DETAILS_ROLES } from "apps/admin/src/constants/pageRoles";
import Subheader from "apps/admin/src/components/Subheader";
import {
	Card,
	Col,
	message,
	Row,
	Typography,
	List,
	Space,
	Descriptions,
	Tag,
} from "antd";
import { useRouter } from "next/router";
import {
	getParamAsString,
	getPriceFormatter,
} from "@laptopoutlet-packages/utils";
import { LoadingContext } from "apps/admin/src/contexts/LoadingContext";
import { DATA_LOAD_ERROR } from "apps/admin/src/constants/messages";
import { DEFAULT_MESSAGE_DURATION } from "apps/admin/src/constants";
import { Currency, Locale } from "@laptopoutlet-packages/types";
import {
	translateOrderItemStatus,
	translateProductCondition,
} from "apps/admin/src/utils/translations";
import Image from "next/image";
import Link from "next/link";
import { useGetCancellationQuery } from "apps/admin/src/libs/graphql/operations/cancellation.graphql";
const { Text } = Typography;

interface Props {}

const OrderDetails = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: ORDERS_DETAILS_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control
	const router = useRouter();
	const id = getParamAsString(router.query.id) || "";
	const { setLoading } = useContext(LoadingContext);
	const { data, loading, error } = useGetCancellationQuery({
		variables: { id },
	});
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
				title="Detalles de cancelación de pedido"
				breadcrumbs={[
					{ href: "/cancellations", name: "Cancelaciones" },
					{
						href: "/cancellations/details/[id]",
						as: `/cancellations/details/${router.query.id}`,
						name: "Detalles de cancelación de pedido",
					},
				]}
			>
				{data?.getCancellation?.id ? (
					<Text>
						<Text strong>ID de la cancelación:</Text>{" "}
						{data?.getCancellation?.id}
					</Text>
				) : (
					<Text type="danger">
						No pudimos obtener la información del pedido. Asegurate que la url
						sea la correcta.
					</Text>
				)}
			</Subheader>
			{data?.getCancellation?.id && (
				<div className="main-container">
					<Row gutter={[20, 20]}>
						<Col xs={24} xl={{ span: 16, order: 1 }}>
							<Card title="Productos cancelados">
								<Col span={24}>
									{data.getCancellation?.orderItems.map((item, index) => (
										<Row gutter={[20, 20]} key={index}>
											<Col span={24}>
												<Text>{item.title.es}</Text>
											</Col>
											<Col xs={24} sm={8} xxl={5} className="text-center">
												<Space direction="vertical">
													<div style={{ backgroundColor: "white" }}>
														<Image
															src={
																item.imageUrl
																	? process.env.NEXT_PUBLIC_BUCKET_BASE_URL +
																	  item.imageUrl
																	: "/static/default-image.jpg"
															}
															width={250}
															height={250}
															className="unselectable"
															objectFit="contain"
														/>
													</div>
													{item.product && (
														<Link
															href="/merchandise-inventory/details/[id]"
															as={`/merchandise-inventory/details/${item.product}`}
														>
															<a>Ver detalles actuales</a>
														</Link>
													)}
												</Space>
											</Col>
											<Col xs={24} sm={16} xxl={19}>
												<Space direction="vertical" className="pb-10px">
													<Space>
														<Text strong>SKU:</Text>
														<Text>{item.product}</Text>
													</Space>
													<div>
														<Space>
															<Text strong>Condición:</Text>
															<Text>
																{translateProductCondition(item.condition)}
															</Text>
														</Space>
													</div>
													<div>
														<Space>
															<Text strong>Estado:</Text>
															<Text>
																{translateOrderItemStatus(item.status)}
															</Text>
														</Space>
													</div>
												</Space>
												<List bordered size="small">
													<List.Item>
														<Text strong>Precio (unidad):</Text>
														<Text>
															{priceFormatter.format(
																item.applyDiscount
																	? item.pricing.discountPrice
																	: item.pricing.price
															)}
														</Text>
													</List.Item>
													<List.Item>
														<Text strong>Envío (unidad):</Text>
														<Text>
															{item.freeShipping
																? "Envío gratis"
																: priceFormatter.format(item.pricing.shipping)}
														</Text>
													</List.Item>
													{item.invoice.returned && (
														<List.Item>
															<Text strong type="success">
																Retornado:
															</Text>
															<Text type="success">
																{priceFormatter.format(item.invoice.returned)}
															</Text>
														</List.Item>
													)}
													<List.Item>
														<Text strong>Cantidad:</Text>
														<Text>{item.invoice.totalQuantity}</Text>
													</List.Item>
													<List.Item>
														<Text strong>Total del producto:</Text>
														<Text>
															{priceFormatter.format(
																item.invoice.itemsTotalPrice
															)}
														</Text>
													</List.Item>
													<List.Item>
														<Text strong>Total de envío:</Text>
														<Text>
															{priceFormatter.format(
																item.invoice.shippingTotalPrice
															)}
														</Text>
													</List.Item>
													<List.Item>
														<Text strong>Total:</Text>
														<Text>
															{priceFormatter.format(item.invoice.totalPrice)}
														</Text>
													</List.Item>
												</List>
											</Col>
										</Row>
									))}
								</Col>
							</Card>
						</Col>
						<Col xs={24} xl={{ span: 8, order: 2 }}>
							<Row gutter={[20, 20]}>
								<Col span={24}>
									<Card title="Información del comprador">
										{data.getCancellation.user ? (
											<Descriptions column={1}>
												<Descriptions.Item label="ID">
													{data.getCancellation.user.id}
												</Descriptions.Item>
												<Descriptions.Item label="nombre">
													{data?.getCancellation.user.name}{" "}
													{data?.getCancellation.user.surname}
												</Descriptions.Item>
												<Descriptions.Item label="Correo electrónico">
													{data?.getCancellation.user.email}
												</Descriptions.Item>
												<Descriptions.Item label="Teléfono móvil">
													{data.getCancellation.user.phone || "N/A"}
												</Descriptions.Item>
											</Descriptions>
										) : (
											"Cuenta eliminada"
										)}
									</Card>
								</Col>
								<Col span={24}>
									<Card title="Detalles generales">
										<Descriptions column={1}>
											<Descriptions.Item label="ID del pedido">
												<Link
													href="/orders/details/[id]"
													as={`/orders/details/${data.getCancellation.order}`}
												>
													<a>{data.getCancellation.order}</a>
												</Link>
											</Descriptions.Item>
											<Descriptions.Item label="# de paquete">
												{data.getCancellation.shipmentid}
											</Descriptions.Item>
											<Descriptions.Item label="Cancelado por">
												<Tag
													color={
														data.getCancellation.cancelledBy
															? "success"
															: "processing"
													}
												>
													{data.getCancellation.cancelledBy
														? "Admin"
														: "Cliente"}
												</Tag>
											</Descriptions.Item>
										</Descriptions>
									</Card>
								</Col>
							</Row>
						</Col>
					</Row>
				</div>
			)}
		</div>
	);
};

export default OrderDetails;
