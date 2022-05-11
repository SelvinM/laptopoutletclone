import { Button, Card, Col, Form, message, Row, Typography } from "antd";
import { useForm } from "react-hook-form";
import React, { useContext, useEffect } from "react";
import Subheader from "../../../../components/Subheader";
import { useMeQuery } from "../../../../libs/graphql/operations/admin.graphql";
import WarehouseForm from "../../../../components/WarehouseForm";
import { useRouter } from "next/router";
import { DATA_LOAD_ERROR, GENERAL_ERROR } from "../../../../constants/messages";
import { resetFormModal } from "../../../../components/resetFormModal";
import Error403 from "../../../../components/Error403";
import isUserAllowed from "../../../../utils/isUserAllowed";
import { WAREHOUSES_ADD_ROLES } from "../../../../constants/pageRoles";
import {
	GetWarehousesDocument,
	useGetWarehouseQuery,
	useUpdateWarehouseMutation,
} from "../../../../libs/graphql/operations/warehouse.graphql";
import { Country } from "@laptopoutlet-packages/types";
import {
	DEFAULT_MESSAGE_DURATION,
	DEFAULT_PAGINATION_LIMIT,
} from "apps/admin/src/constants";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import { LoadingContext } from "apps/admin/src/contexts/LoadingContext";
interface Props {}
type FormFields = {
	name: string;
	latitude: number;
	longitude: number;
	addressLine1: string;
	addressLine2?: string;
	country: Country;
	city: string;
	province: string;
	zipcode: string;
};
const { Text } = Typography;
const WarehouseEdit = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: WAREHOUSES_ADD_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const {
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm<FormFields>({
		defaultValues: {
			addressLine1: "",
			addressLine2: "",
			city: "",
			country: undefined,
			latitude: undefined,
			longitude: undefined,
			name: "",
			province: "",
			zipcode: "",
		},
	});
	const router = useRouter();
	const id = getParamAsString(router.query.id) || "";
	const { data, loading, error } = useGetWarehouseQuery({ variables: { id } });
	const [updateWarehouse, { loading: loadingUpdate }] =
		useUpdateWarehouseMutation();
	const { setLoading } = useContext(LoadingContext);
	useEffect(() => {
		if (error) message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	useEffect(() => {
		setLoading(loading);
	}, [loading]);
	const resetFormAction = () => {
		if (data?.getWarehouse && !error)
			reset({
				name: data.getWarehouse.name,
				addressLine1: data.getWarehouse.address.addressLine1,
				addressLine2: data.getWarehouse.address.addressLine2 || "",
				city: data.getWarehouse.address.city,
				country: data.getWarehouse.address.country as Country,
				latitude: data.getWarehouse.point.coordinates[1],
				longitude: data.getWarehouse.point.coordinates[0],
				province: data.getWarehouse.address.province,
				zipcode: data.getWarehouse.address.zipcode,
			});
	};
	useEffect(() => {
		resetFormAction();
	}, [data, error]);
	const submit = async (fields: FormFields) => {
		const { data, errors } = await updateWarehouse({
			variables: {
				id,
				name: fields.name,
				address: {
					addressLine1: fields.addressLine1,
					addressLine2: fields.addressLine2,
					country: fields.country,
					city: fields.city,
					province: fields.province,
					zipcode: fields.zipcode,
				},
				latitude: fields.latitude,
				longitude: fields.longitude,
			},
			awaitRefetchQueries: true,
			refetchQueries: [
				{
					query: GetWarehousesDocument,
					variables: { limit: DEFAULT_PAGINATION_LIMIT },
				},
			],
		});
		if (errors && errors.length > 0)
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		if (data?.updateWarehouse.__typename === "GeneralError")
			message.error(data.updateWarehouse.message, 2);
		if (data?.updateWarehouse.__typename === "Warehouse")
			router.push("/warehouses");
	};

	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};
	return (
		<div>
			<Subheader
				title="Editar bodega"
				breadcrumbs={[
					{ href: "/warehouses", name: "Bodegas" },
					{
						href: "/warehouses/edit/[id]",
						as: `/warehouses/edit/${id}`,
						name: "Editar bodega",
					},
				]}
			>
				{data?.getWarehouse?.id ? (
					<Text>
						<Text strong>ID de la bodega:</Text> {data?.getWarehouse?.id}
					</Text>
				) : (
					<Text type="danger">
						No pudimos obtener la información de la bodega. Asegurate que la url
						sea la correcta.
					</Text>
				)}
			</Subheader>
			<div className="main-container">
				<Card>
					<div className="text-right">
						<Button type="link" onClick={showResetFormModal}>
							Limpiar campos
						</Button>
					</div>
					<Form onSubmitCapture={handleSubmit(submit)} layout="vertical">
						<Row justify="center">
							<Col xl={14} lg={18} md={18} sm={18} xs={24}>
								<WarehouseForm control={control} errors={errors} />
								<Form.Item className="text-right">
									<Button
										type="primary"
										htmlType="submit"
										loading={loadingUpdate}
										disabled={Object.values(errors).length > 0}
									>
										{" "}
										Guardar cambios
									</Button>
								</Form.Item>
							</Col>
						</Row>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default WarehouseEdit;
