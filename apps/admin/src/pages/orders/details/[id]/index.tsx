import React, { useContext, useEffect } from "react";
import Error403 from "apps/admin/src/components/Error403";
import { useMeQuery } from "apps/admin/src/libs/graphql/operations/admin.graphql";
import isUserAllowed from "apps/admin/src/utils/isUserAllowed";
import { ORDERS_DETAILS_ROLES } from "apps/admin/src/constants/pageRoles";
import Subheader from "apps/admin/src/components/Subheader";
import {
	Card,
	Col,
	Divider,
	message,
	Row,
	Typography,
	List,
	Space,
	Tag,
	Button,
	Modal,
	Descriptions,
} from "antd";
import { useRouter } from "next/router";
import {
	getParamAsString,
	getPriceFormatter,
	translateCountry,
} from "@laptopoutlet-packages/utils";
import {
	useCapturePaymentMutation,
	useGetOrderQuery,
	useReverseAuthorizationMutation,
} from "apps/admin/src/libs/graphql/operations/order.graphql";
import { LoadingContext } from "apps/admin/src/contexts/LoadingContext";
import {
	DATA_LOAD_ERROR,
	GENERAL_ERROR,
} from "apps/admin/src/constants/messages";
import { DEFAULT_MESSAGE_DURATION } from "apps/admin/src/constants";
import { Currency, Locale, ShipmentStatus } from "@laptopoutlet-packages/types";
import {
	translateOrderItemStatus,
	translateProductCondition,
	translateShipmentStatus,
} from "apps/admin/src/utils/translations";
import { ArrowRightOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
const { Text } = Typography;
const { confirm } = Modal;

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
	const { data, loading, error } = useGetOrderQuery({
		variables: { id },
	});
	const [capturePayment, { error: capturePaymentError }] =
		useCapturePaymentMutation();
	const [reverseAuthorization, { error: reverseAuthorizationError }] =
		useReverseAuthorizationMutation();
	capturePaymentError &&
		console.log(`capturePaymentError`, capturePaymentError);
	reverseAuthorizationError &&
		console.log(`reverseAuthorizationError`, reverseAuthorizationError);
	useEffect(() => {
		setLoading(loading);
	}, [loading]);

	useEffect(() => {
		if (error) message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	const priceFormatter = getPriceFormatter(Locale.Es, Currency.Hnl);
	const shipmentsAmount = data?.getOrder?.shipments.length || 0;
	const changePackageStateToShipped = async (id: string) => {
		if (!data?.getOrder?.id) return;
		confirm({
			title: '¿Deseas cambiar el estado del paquete a "Enviado"?',
			okText: "Sí",
			cancelText: "No",
			type: "warning",
			onOk: async () => {
				if (!data?.getOrder?.id) return;
				const { data: responseData, errors } = await capturePayment({
					variables: { orderid: data.getOrder.id, shipmentid: id },
				});
				if (!responseData?.capturePayment?.id || errors) {
					setTimeout(
						() => message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION),
						350
					);
				} else {
					setTimeout(
						() =>
							message.success(
								"¡El estado del paquete se ha actualizado exitosamente!",
								DEFAULT_MESSAGE_DURATION
							),
						350
					);
				}
				return;
			},
			content:
				'Al cambiar el estado a "Enviado" también se ejecuta el cobro al cliente por el contenido del paquete. Esta acción es irreversible.',
		});
	};
	const cancelPackage = async (id: string) => {
		if (!data?.getOrder?.id) return;
		confirm({
			title: "¿Deseas cancelar este paquete?",
			okText: "Sí",
			cancelText: "No",
			onOk: async () => {
				if (!data?.getOrder?.id) return;
				const { data: responseData, errors } = await reverseAuthorization({
					variables: { orderid: data.getOrder.id, shipmentid: id },
				});
				if (errors) {
					setTimeout(
						() => message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION),
						350
					);
					return;
				}

				if (
					responseData?.reverseAuthorization &&
					responseData.reverseAuthorization.__typename === "GeneralError"
				) {
					const errorMessage = responseData.reverseAuthorization.message;
					setTimeout(
						() => message.error(errorMessage, DEFAULT_MESSAGE_DURATION),
						350
					);
					return;
				}
				if (responseData?.reverseAuthorization?.__typename === "Order") {
					setTimeout(
						() =>
							message.error(
								"Paquete cancelado exitosamente!",
								DEFAULT_MESSAGE_DURATION
							),
						350
					);
					return;
				}
				if (responseData?.reverseAuthorization === null) {
					setTimeout(
						() =>
							message.success(
								"La orden se ha eliminado porque ya no contenía paquetes.",
								DEFAULT_MESSAGE_DURATION
							),
						350
					);
					router.push("/orders");
				}
			},
			content: "Esta acción es irreversible.",
		});
	};
	return (
		<div>
			<Subheader
				title="Detalles de pedido"
				breadcrumbs={[
					{ href: "/orders", name: "Pedidos" },
					{
						href: "/orders/details/[id]",
						as: `/orders/details/${router.query.id}`,
						name: "Detalles de pedido",
					},
				]}
			>
				{data?.getOrder?.id ? (
					<Text>
						<Text strong>ID del pedido:</Text> {data?.getOrder?.id}
					</Text>
				) : (
					<Text type="danger">
						No pudimos obtener la información del pedido. Asegurate que la url
						sea la correcta.
					</Text>
				)}
			</Subheader>
			{data?.getOrder?.id && (
				<div className="main-container">
					<Row gutter={[20, 20]}>
						<Col xs={24} xl={{ span: 8, order: 2 }}>
							<Row gutter={[20, 20]}>
								<Col span={24}>
									<Card title="Información del comprador">
										{data.getOrder.user ? (
											<Descriptions column={1}>
												<Descriptions.Item label="ID">
													{data.getOrder.user.id}
												</Descriptions.Item>
												<Descriptions.Item label="nombre">
													{data?.getOrder.user.name}{" "}
													{data?.getOrder.user.surname}
												</Descriptions.Item>
												<Descriptions.Item label="Correo electrónico">
													{data?.getOrder.user.email}
												</Descriptions.Item>
												<Descriptions.Item label="Teléfono móvil">
													{data.getOrder.user.phone || "N/A"}
												</Descriptions.Item>
											</Descriptions>
										) : (
											"Cuenta eliminada"
										)}
									</Card>
								</Col>
								<Col xs={24} md={12} xl={24}>
									<Card title="Dirección de envío">
										<List size="small">
											<List.Item>
												<Text strong>
													{data?.getOrder?.shippingAddress.firstname}{" "}
													{data?.getOrder?.shippingAddress.lastname}
												</Text>
											</List.Item>
											<List.Item>
												<Space direction="vertical">
													<Text>
														{
															data?.getOrder?.shippingAddress.address
																.addressLine1
														}
													</Text>
													{data?.getOrder?.shippingAddress.address
														.addressLine2 && (
														<Text>
															{
																data.getOrder.shippingAddress.address
																	.addressLine2
															}
														</Text>
													)}
													<Text>
														{data?.getOrder?.shippingAddress.address.city},{" "}
														{data?.getOrder?.shippingAddress.address.province}
													</Text>
													<Text>
														{translateCountry({
															code: data?.getOrder?.shippingAddress.address
																.country,
															locale: Locale.Es,
														}) ||
															data?.getOrder?.shippingAddress.address.country}
													</Text>
													<Text>
														{data?.getOrder?.shippingAddress.address.zipcode}
													</Text>
												</Space>
											</List.Item>
											<List.Item>
												<Text>{data?.getOrder?.shippingAddress.phone}</Text>
											</List.Item>
										</List>
									</Card>
								</Col>
								<Col xs={24} md={12} xl={24}>
									<Card title="Resumen del pedido">
										<Row gutter={[0, 10]}>
											<Col span={12}>
												<Text>
													Productos({data?.getOrder?.invoice.totalQuantity || 0}
													)
												</Text>
											</Col>
											<Col span={12} className="text-right">
												<Text>
													{priceFormatter.format(
														data?.getOrder?.invoice.itemsTotalPrice || 0
													)}
												</Text>
											</Col>
											<Col span={12}>
												<Text>Envío</Text>
											</Col>
											<Col span={12} className="text-right">
												<Text>
													{priceFormatter.format(
														data?.getOrder?.invoice.shippingTotalPrice || 0
													)}
												</Text>
											</Col>
											{data?.getOrder?.invoice.returned && (
												<>
													<Col span={12}>
														<Text type="success">Retornado</Text>
													</Col>
													<Col span={12} className="text-right">
														<Text type="success">
															{priceFormatter.format(
																data.getOrder.invoice.returned
															)}
														</Text>
													</Col>
												</>
											)}
										</Row>
										<Divider />
										<Row>
											<Col span={12}>
												<Text strong>Total del pedido</Text>
											</Col>
											<Col span={12} className="text-right">
												<Text strong>
													{priceFormatter.format(
														data?.getOrder?.invoice.totalPrice || 0
													)}
												</Text>
											</Col>
										</Row>
									</Card>
								</Col>
							</Row>
						</Col>
						<Col xs={24} xl={{ span: 16, order: 1 }}>
							<Card
								title={`${shipmentsAmount} ${
									shipmentsAmount === 1 ? "Envío" : "Envíos"
								}`}
							>
								{data?.getOrder?.shipments.map((shipment, index) => (
									<div key={shipment.id}>
										<Row
											gutter={[20, 20]}
											justify="space-between"
											align="middle"
										>
											<Col>
												<Space>
													<Text>{`Paquete #${shipment.id}`}</Text>
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
												</Space>
											</Col>
											<Col>
												{shipment.status === ShipmentStatus.Pending && (
													<Space direction="vertical">
														<Button
															onClick={() => {
																changePackageStateToShipped(shipment.id);
															}}
															type="primary"
														>
															Cambiar a enviado
														</Button>
														<Button
															onClick={() => {
																cancelPackage(shipment.id);
															}}
															danger
															className="w-100"
														>
															Cancelar
														</Button>
													</Space>
												)}
											</Col>
											<Col span={24}>
												<Divider className="m-0" dashed />
											</Col>
											<Col span={24}>
												{shipment.orderItems.map((item, index) => (
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
																				? process.env
																						.NEXT_PUBLIC_BUCKET_BASE_URL +
																				  item.imageUrl
																				: "/static/default-image.jpg"
																		}
																		width={250}
																		height={250}
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
																			{translateProductCondition(
																				item.condition
																			)}
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
																			: priceFormatter.format(
																					item.pricing.shipping
																			  )}
																	</Text>
																</List.Item>
																{item.invoice.returned && (
																	<List.Item>
																		<Text strong type="success">
																			Retornado:
																		</Text>
																		<Text type="success">
																			{priceFormatter.format(
																				item.invoice.returned
																			)}
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
																		{priceFormatter.format(
																			item.invoice.totalPrice
																		)}
																	</Text>
																</List.Item>
															</List>
														</Col>
														{index < shipment.orderItems.length - 1 && (
															<Col span={24}>
																<Divider dashed />
															</Col>
														)}
													</Row>
												))}
											</Col>
										</Row>
										{data.getOrder &&
											index < data.getOrder.shipments.length - 1 && <Divider />}
									</div>
								))}
							</Card>
						</Col>
					</Row>
				</div>
			)}
		</div>
	);
};

export default OrderDetails;
