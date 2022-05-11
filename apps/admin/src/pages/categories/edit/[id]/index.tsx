import { Button, Card, Form, message, Typography } from "antd";
import Subheader from "../../../../components/Subheader";
import {
	GetCategoriesDocument,
	useGetCategoryQuery,
	useUpdateCategoryMutation,
} from "apps/admin/src/libs/graphql/operations/category.graphql";
import { useRouter } from "next/router";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import { useForm } from "react-hook-form";
import { resetFormModal } from "apps/admin/src/components/resetFormModal";
import { DEFAULT_MESSAGE_DURATION } from "apps/admin/src/constants";
import { DATA_LOAD_ERROR } from "apps/admin/src/constants/messages";
import React, { useContext, useEffect } from "react";
import { LoadingContext } from "apps/admin/src/contexts/LoadingContext";
import CategoryForm from "apps/admin/src/components/CategoryForm";
import CategoryImageForm from "apps/admin/src/components/CategoryImageForm";
import Error403 from "apps/admin/src/components/Error403";
import { useMeQuery } from "apps/admin/src/libs/graphql/operations/admin.graphql";
import isUserAllowed from "apps/admin/src/utils/isUserAllowed";
import { CATEGORIES_EDI_ROLES } from "apps/admin/src/constants/pageRoles";
interface Props {}
const { Text } = Typography;
type FormFields = {
	nameEs: string;
	nameEn?: string;
	descriptionEs: string;
	descriptionEn?: string;
	showInMenu: boolean;
};
const EditCategory = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: CATEGORIES_EDI_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const router = useRouter();
	const {
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm<FormFields>({
		defaultValues: {
			nameEs: "",
			nameEn: "",
			descriptionEs: "",
			descriptionEn: "",
			showInMenu: true,
		},
	});
	const { setLoading } = useContext(LoadingContext);
	const id = getParamAsString(router.query.id) || "";
	const { data, error, loading } = useGetCategoryQuery({
		variables: { id },
	});
	const [updateCategory, { loading: loadingUpdateCategory }] =
		useUpdateCategoryMutation();
	useEffect(() => {
		if (error) message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);
	useEffect(() => {
		setLoading(loading);
	}, [loading]);
	useEffect(() => {
		resetFormAction();
	}, [data, error]);
	const submit = async (fields: FormFields) => {
		const { data } = await updateCategory({
			variables: { ...fields, id },
			awaitRefetchQueries: true,
			refetchQueries: [{ query: GetCategoriesDocument }],
		});
		if (data?.updateCategory.__typename === "GeneralError")
			message.error(data.updateCategory.message, DEFAULT_MESSAGE_DURATION);
		if (data?.updateCategory.__typename === "Category") {
			message.success(
				"Categoría actualizada exitosamente",
				DEFAULT_MESSAGE_DURATION
			);
			router.push("/categories");
		}
	};
	const resetFormAction = () => {
		if (data?.getCategory && !error) {
			reset({
				nameEs: data.getCategory.name.es,
				nameEn: data.getCategory.name.en || "",
				descriptionEs: data.getCategory.description.es,
				descriptionEn: data.getCategory.description.en || "",
				showInMenu: data.getCategory.showInMenu,
			});
		}
	};
	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};
	return (
		<div>
			<Subheader
				title="Editar categoría"
				breadcrumbs={[
					{ href: "/categories", name: "Categorías" },
					{
						href: "/categories/edit/[id]",
						as: `/categories/edit/${id}`,
						name: "Editar categoría",
					},
				]}
			>
				{data?.getCategory?.id ? (
					<Text>
						<Text strong>ID de la categoría:</Text> {data?.getCategory?.id}{" "}
					</Text>
				) : (
					<Text type="danger">
						No pudimos obtener la información de la categoría. Asegurate que la
						url sea la correcta.
					</Text>
				)}
			</Subheader>
			<div className="main-container">
				<div className="pb-20px">
					<Card title="Imagen">
						<CategoryImageForm id={id} imageUrl={data?.getCategory?.imageUrl} />
					</Card>
				</div>
				<Card>
					<div className="text-right">
						<Button type="link" onClick={showResetFormModal}>
							Reestablecer campos
						</Button>
					</div>
					<Form onSubmitCapture={handleSubmit(submit)} layout="vertical">
						<CategoryForm control={control} errors={errors} isEdit />
						<Form.Item className="text-right">
							<Button
								type="primary"
								htmlType="submit"
								loading={loadingUpdateCategory}
								disabled={Object.values(errors).length > 0}
							>
								{" "}
								Editar
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default EditCategory;
