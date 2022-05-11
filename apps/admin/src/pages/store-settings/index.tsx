import { Button, Card, Form, message } from "antd";
import { useForm } from "react-hook-form";
import { resetFormModal } from "../../components/resetFormModal";
import { DEFAULT_MESSAGE_DURATION } from "../../constants";
import { DATA_LOAD_ERROR, GENERAL_ERROR } from "../../constants/messages";
import React, { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../../contexts/LoadingContext";
import ConfigForm from "../../components/ConfigForm";
import {
	useGetConfigQuery,
	useUpdateConfigMutation,
} from "../../libs/graphql/operations/config.graphql";
import Subheader from "../../components/Subheader";
import { UploadFile } from "antd/lib/upload/interface";
import Error403 from "../../components/Error403";
import isUserAllowed from "../../utils/isUserAllowed";
import { STORE_SETTINGS_ROLES } from "../../constants/pageRoles";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
interface Props {}
type FormFields = {
	homeBannerTitleEs: string;
	homeBannerTitleEn?: string;
	homeBannerMessageEs: string;
	homeBannerMessageEn?: string;
	homeBannerButtonLabelEs: string;
	homeBannerButtonLabelEn?: string;
	href: string;
	as?: string;
	socialLinkFacebook?: string;
	socialLinkInstagram?: string;
};
const EditCategory = ({}: Props) => {
	//--role access control--
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: STORE_SETTINGS_ROLES,
		roles: meData?.me?.roles || [],
	});

	if (meData?.me && !allowed) {
		return <Error403 />;
	}
	//role access control finish

	const {
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm<FormFields>({
		defaultValues: {
			as: "",
			homeBannerButtonLabelEn: "",
			homeBannerButtonLabelEs: "",
			homeBannerMessageEn: "",
			homeBannerMessageEs: "",
			homeBannerTitleEn: "",
			homeBannerTitleEs: "",
			href: "",
			socialLinkFacebook: "",
			socialLinkInstagram: "",
		},
	});

	const [image, setImage] = useState<UploadFile<any>>();
	const { setLoading } = useContext(LoadingContext);
	const { data, error, loading } = useGetConfigQuery({});
	const [updateConfig, { loading: loadingUpdateConfig }] =
		useUpdateConfigMutation();
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
		const { data } = await updateConfig({
			variables: {
				homeBanner: {
					title: {
						es: fields.homeBannerTitleEs,
						en: fields.homeBannerTitleEn,
					},
					message: {
						es: fields.homeBannerMessageEs,
						en: fields.homeBannerMessageEn,
					},
					buttonLabel: {
						es: fields.homeBannerButtonLabelEs,
						en: fields.homeBannerButtonLabelEn,
					},
					href: fields.href,
					as: fields.as,
					upload: image,
				},
				socialLinks: {
					facebook: fields.socialLinkFacebook,
					instagram: fields.socialLinkInstagram,
				},
			},
		});
		if (!data) {
			message.error(GENERAL_ERROR, DEFAULT_MESSAGE_DURATION);
			return;
		}
		message.success(
			"Configuración actualizada exitosamente",
			DEFAULT_MESSAGE_DURATION
		);
	};
	const resetFormAction = () => {
		setImage(undefined);
		if (data?.getConfig && !error) {
			reset({
				as: data.getConfig.homeBanner.as || "",
				homeBannerButtonLabelEn:
					data.getConfig.homeBanner.buttonLabel?.en || "",
				homeBannerButtonLabelEs:
					data.getConfig.homeBanner.buttonLabel?.es || "",
				homeBannerMessageEn: data.getConfig.homeBanner.message?.en || "",
				homeBannerMessageEs: data.getConfig.homeBanner.message?.es || "",
				homeBannerTitleEn: data.getConfig.homeBanner.title?.en || "",
				homeBannerTitleEs: data.getConfig.homeBanner.title?.es || "",
				href: data.getConfig.homeBanner.href || "",
				socialLinkFacebook: data.getConfig.socialLinks?.facebook || "",
				socialLinkInstagram: data.getConfig.socialLinks?.instagram || "",
			});
		}
	};
	const showResetFormModal = () => {
		resetFormModal(resetFormAction);
	};

	return (
		<div>
			<Subheader
				title="Configuración de la Tienda"
				// breadcrumbs={[
				// 	{ href: "/store-settings", name: "Configuración de la tienda" },
				// 	{
				// 		href: "/store-settings",
				// 		name: "Configuración de la tienda",
				// 	},
				// ]}
			/>
			<div className="main-container">
				<Card>
					<div className="text-right">
						<Button type="link" onClick={showResetFormModal}>
							Reestablecer campos
						</Button>
					</div>
					<Form onSubmitCapture={handleSubmit(submit)} layout="vertical">
						<ConfigForm
							control={control}
							errors={errors}
							setImage={setImage}
							image={image}
							imageUrl={data?.getConfig?.homeBanner.imageUrl}
						/>
						<Form.Item className="text-right">
							<Button
								type="primary"
								htmlType="submit"
								loading={loadingUpdateConfig}
								disabled={Object.values(errors).length > 0}
							>
								{" "}
								Guardar
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	);
};

export default EditCategory;
