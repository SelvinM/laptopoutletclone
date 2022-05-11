import { Button, Card, Form, message } from "antd";
import { useForm } from "react-hook-form";
import { Role } from "@laptopoutlet-packages/types";
import React, { useEffect } from "react";
import Subheader from "../../../components/Subheader";
import {
	GetAdminsDocument,
	useCreateAdminMutation,
	useMeQuery,
} from "../../../libs/graphql/operations/admin.graphql";
import AdminForm from "../../../components/AdminForm";
import { useRouter } from "next/router";
import { GENERAL_ERROR } from "../../../constants/messages";
import { resetFormModal } from "apps/admin/src/components/resetFormModal";
import {
	DEFAULT_MESSAGE_DURATION,
	DEFAULT_PAGINATION_LIMIT,
} from "apps/admin/src/constants";
import Error403 from "apps/admin/src/components/Error403";
import isUserAllowed from "apps/admin/src/utils/isUserAllowed";
import { ADMINS_ADD_ROLES } from "apps/admin/src/constants/pageRoles";
interface Props {}
type FormFields = {
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	roles: Role[];
};
const AdminAdd = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: ADMINS_ADD_ROLES,
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
			password: "",
		},
	});

	const [createAdmin, { loading, error }] = useCreateAdminMutation();
	const router = useRouter();
	useEffect(() => {
		if (error) message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	const submit = async (fields: FormFields) => {
		const { data, errors } = await createAdmin({
			variables: { ...fields },
			awaitRefetchQueries: true,
			refetchQueries: [
				{
					query: GetAdminsDocument,
					variables: { limit: DEFAULT_PAGINATION_LIMIT },
				},
			],
		});
		if (errors && errors.length > 0)
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		if (data?.createAdmin.__typename === "GeneralError")
			message.error(data.createAdmin.message, 2);
		if (data?.createAdmin.__typename === "Admin") router.push("/admins");
	};
	const resetFormAction = () => {
		reset({
			email: "",
			firstname: "",
			lastname: "",
			password: "",
			roles: [],
		});
	};
	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};
	return (
		<div>
			<Subheader
				title="Agregar administrador"
				breadcrumbs={[
					{ href: "/admins", name: "Administradores" },
					{ href: "/admins/add", name: "Agregar administrador" },
				]}
			/>
			<div className="main-container">
				<Card>
					<div className="text-right">
						<Button type="link" onClick={showResetFormModal}>
							Limpiar campos
						</Button>
					</div>
					<Form
						onSubmitCapture={handleSubmit(submit)}
						layout="vertical"
						size="large"
					>
						<AdminForm control={control} errors={errors} />
						<Form.Item className="text-center">
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
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default AdminAdd;
