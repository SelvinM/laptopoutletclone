import { Button, Card, Form, message, Typography } from "antd";
import { useForm } from "react-hook-form";
import { Role } from "@laptopoutlet-packages/types";
import React, { useContext, useEffect } from "react";
import Subheader from "../../../../components/Subheader";
import {
	GetAdminsDocument,
	useGetAdminQuery,
	useMeQuery,
	useUpdateAdminMutation,
} from "../../../../libs/graphql/operations/admin.graphql";
import { useRouter } from "next/router";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import { LoadingContext } from "../../../../contexts/LoadingContext";
import AdminForm from "../../../../components/AdminForm";
import { DATA_LOAD_ERROR } from "../../../../constants/messages";
import { resetFormModal } from "../../../../components/resetFormModal";
import {
	DEFAULT_MESSAGE_DURATION,
	DEFAULT_PAGINATION_LIMIT,
} from "../../../../constants";
import Error403 from "apps/admin/src/components/Error403";
import isUserAllowed from "apps/admin/src/utils/isUserAllowed";
import { ADMINS_EDIT_ROLES } from "apps/admin/src/constants/pageRoles";
interface Props {}
type FormFields = {
	firstname: string;
	lastname: string;
	email: string;
	roles: Role[];
};
const { Text } = Typography;
const AdminEdit = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: ADMINS_EDIT_ROLES,
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
			email: "",
			firstname: "",
			lastname: "",
			roles: [],
		},
	});
	const router = useRouter();
	const { setLoading } = useContext(LoadingContext);
	const id = getParamAsString(router.query.id) || "";
	const [updateAdmin, { loading: loadingUpdateAdmin }] =
		useUpdateAdminMutation();
	const { data, loading, error } = useGetAdminQuery({ variables: { id } });
	useEffect(() => {
		if (error) message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	useEffect(() => {
		setLoading(loading);
	}, [loading]);
	const submit = async (fields: FormFields) => {
		const { data } = await updateAdmin({
			variables: { ...fields, id },
			awaitRefetchQueries: true,
			refetchQueries: [
				{
					query: GetAdminsDocument,
					variables: { limit: DEFAULT_PAGINATION_LIMIT },
				},
			],
		});
		if (data?.updateAdmin.__typename === "GeneralError")
			message.error(data.updateAdmin.message, DEFAULT_MESSAGE_DURATION);
		if (data?.updateAdmin.__typename === "Admin") {
			message.success(
				"Administrador actualizado con éxito",
				DEFAULT_MESSAGE_DURATION
			);
			router.push("/admins");
		}
	};
	const resetFormAction = () => {
		if (data?.getAdmin && !error) {
			reset({
				firstname: data.getAdmin.firstname,
				lastname: data.getAdmin.lastname,
				email: data.getAdmin.email,
				roles: data.getAdmin.roles,
			});
		}
	};
	useEffect(() => {
		resetFormAction();
	}, [data, error]);
	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};
	return (
		<div>
			<Subheader
				title="Editar administrador"
				breadcrumbs={[
					{ href: "/admins", name: "Administradores" },
					{
						href: "/admins/edit/[id]",
						as: `/admins/edit/${id}`,
						name: "Editar administrador",
					},
				]}
			>
				{data?.getAdmin?.id ? (
					<Text>
						<Text strong>ID del administrador:</Text> {data?.getAdmin?.id}{" "}
					</Text>
				) : (
					<Text type="danger">
						No pudimos obtener la información del administrador. Asegurate que
						la url sea la correcta.
					</Text>
				)}
			</Subheader>
			<div className="main-container">
				<Card>
					<div className="text-right">
						<Button type="link" onClick={showResetFormModal}>
							Reestablecer campos
						</Button>
					</div>
					<Form
						onSubmitCapture={handleSubmit(submit)}
						layout="vertical"
						size="large"
					>
						<AdminForm control={control} errors={errors} isEdit />
						<Form.Item className="text-center">
							<Button
								type="primary"
								htmlType="submit"
								loading={loadingUpdateAdmin}
								disabled={Object.values(errors).length > 0}
							>
								{" "}
								Guardar cambios
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default AdminEdit;
