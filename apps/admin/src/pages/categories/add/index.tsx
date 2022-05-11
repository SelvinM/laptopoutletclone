import { Button, Card, Form, message } from "antd";
import Subheader from "../../../components/Subheader";
import CategoryForm from "apps/admin/src/components/CategoryForm";
import { useForm } from "react-hook-form";
import {
	GetCategoriesDocument,
	useCreateCategoryMutation,
	useGetCategoriesQuery,
} from "apps/admin/src/libs/graphql/operations/category.graphql";
import { DEFAULT_MESSAGE_DURATION } from "apps/admin/src/constants";
import { GENERAL_ERROR } from "apps/admin/src/constants/messages";
import React, { useContext, useEffect, useState } from "react";
import { resetFormModal } from "apps/admin/src/components/resetFormModal";
import { useRouter } from "next/router";
import { UploadFile } from "antd/lib/upload/interface";
import { LoadingContext } from "apps/admin/src/contexts/LoadingContext";
import { useMeQuery } from "apps/admin/src/libs/graphql/operations/admin.graphql";
import isUserAllowed from "apps/admin/src/utils/isUserAllowed";
import Error403 from "apps/admin/src/components/Error403";
import { CATEGORIES_ADD_ROLES } from "apps/admin/src/constants/pageRoles";
interface Props {}

type FormFields = {
	id: string;
	nameEs: string;
	nameEn?: string;
	descriptionEs: string;
	descriptionEn?: string;
	parent?: string;
	showInMenu: boolean;
};
const defaultValues = {
	id: "",
	nameEs: "",
	nameEn: "",
	descriptionEs: "",
	descriptionEn: "",
	parent: "",
	showInMenu: true,
};
const AddCategory = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: CATEGORIES_ADD_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	const {
		control,
		formState: { errors },
		reset,
		handleSubmit,
	} = useForm<FormFields>({
		defaultValues,
	});
	const [image, setImage] = useState<UploadFile>();
	const [createCategory, { loading, error }] = useCreateCategoryMutation();
	const { data: dataCategories, loading: loadingCategories } =
		useGetCategoriesQuery();
	const { setLoading } = useContext(LoadingContext);

	useEffect(() => {
		setLoading(loadingCategories);
	}, [loadingCategories]);
	useEffect(() => {
		if (error) message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
	}, [error]);

	const resetFormAction = () => {
		setImage(undefined);
		reset(defaultValues);
	};
	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};
	const router = useRouter();
	const submit = async (fields: FormFields) => {
		const { data, errors } = await createCategory({
			variables: { ...fields, image },
			awaitRefetchQueries: true,
			refetchQueries: [{ query: GetCategoriesDocument }],
		});
		if (errors && errors.length > 0)
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
		if (data?.createCategory.__typename === "GeneralError")
			message.error(data.createCategory.message, DEFAULT_MESSAGE_DURATION);
		if (data?.createCategory.__typename === "Category") {
			message.success(
				"Categoría agregada exitosamente",
				DEFAULT_MESSAGE_DURATION
			);
			router.push("/categories");
		}
	};
	return (
		<>
			<Subheader
				title="Agregar categoría"
				breadcrumbs={[
					{ href: "/categories", name: "Categorías" },
					{ href: "/category/add", name: "Agregar categoría" },
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
						<CategoryForm
							control={control}
							errors={errors}
							image={image}
							setImage={setImage}
							dataCategories={dataCategories}
						/>
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
					</Form>
				</Card>
			</div>
		</>
	);
};
export default AddCategory;
