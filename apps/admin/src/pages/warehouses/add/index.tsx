import { Button, Card, Col, Form, message, Row } from "antd";
import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import Subheader from "../../../components/Subheader";
import { useMeQuery } from "../../../libs/graphql/operations/admin.graphql";
import WarehouseForm from "../../../components/WarehouseForm";
import { useRouter } from "next/router";
import { GENERAL_ERROR } from "../../../constants/messages";
import { resetFormModal } from "../../../components/resetFormModal";
import Error403 from "../../../components/Error403";
import isUserAllowed from "../../../utils/isUserAllowed";
import { WAREHOUSES_ADD_ROLES } from "../../../constants/pageRoles";
import {
	GetWarehousesDocument,
	useCreateWarehouseMutation,
} from "../../../libs/graphql/operations/warehouse.graphql";
import { Country } from "@laptopoutlet-packages/types";
import {
	DEFAULT_MESSAGE_DURATION,
	DEFAULT_PAGINATION_LIMIT,
} from "apps/admin/src/constants";
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
const AddWarehouse = ({}: Props) => {
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
	const [createWarehouse, { loading, error }] = useCreateWarehouseMutation();
	const router = useRouter();
	useEffect(() => {
		if (error) message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	const submit = async (fields: FormFields) => {
		const { data, errors } = await createWarehouse({
			variables: {
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
		if (data?.createWarehouse.__typename === "GeneralError")
			message.error(data.createWarehouse.message, 2);
		if (data?.createWarehouse.__typename === "Warehouse")
			router.push("/warehouses");
	};
	const resetFormAction = () => {
		reset({});
	};
	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};
	return (
		<div>
			<Subheader
				title="Agregar bodega"
				breadcrumbs={[
					{ href: "/warehouses", name: "Bodegas" },
					{ href: "/warehouse/add", name: "Agregar bodega" },
				]}
			/>
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
										loading={loading}
										disabled={Object.values(errors).length > 0}
									>
										{" "}
										Agregar
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

export default AddWarehouse;
