import React, { useState } from "react";
import {
	Alert,
	Button,
	Card,
	Col,
	Form,
	Input,
	Row,
	Spin,
	Typography,
} from "antd";
import { useForm, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { ErrorAlert } from "@laptopoutlet-packages/types";
import {
	MeDocument,
	MeQuery,
	useLoginAdminMutation,
	useMeQuery,
} from "../../libs/graphql/operations/admin.graphql";
const { Title, Text } = Typography;
interface Props {}
interface LoginFields {
	email: string;
	password: string;
}

const Login = ({}: Props) => {
	const {
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<LoginFields>({
		defaultValues: { email: "", password: "" },
	});
	const { loading: meLoading } = useMeQuery();
	const [errorAlert, setErrorAlert] = useState<ErrorAlert>({});
	const [loginAdmin, { loading }] = useLoginAdminMutation();
	const submitLogin = async ({ email, password }: LoginFields) => {
		const { data } = await loginAdmin({
			variables: { email, password },
			update: (cache, { data: newData }) => {
				if (newData?.loginAdmin.__typename !== "Admin") {
					return;
				}
				cache.writeQuery<MeQuery>({
					data: {
						__typename: "Query",
						me: newData.loginAdmin,
					},
					query: MeDocument,
				});
			},
		});

		if (data?.loginAdmin.__typename === "GeneralError") {
			setErrorAlert(data.loginAdmin);
		}
	};
	const onAlertClose = () => {
		setErrorAlert({});
	};

	return (
		<Spin spinning={meLoading} size="large">
			{meLoading ? (
				<div style={{ height: "100vh" }} />
			) : (
				<>
					<div className="center w-200px pt-60px">
						<img src="/static/logo.png" className="img-responsive" />
					</div>
					<Row justify="center" className="pt-60px">
						<Col xl={7} lg={8} md={10} sm={20} xs={20}>
							<Card
								title={
									<Title level={4} className="text-center">
										Identificate
									</Title>
								}
							>
								{errorAlert.message && (
									<Alert
										message={errorAlert.message}
										type="error"
										closable
										showIcon
										onClose={onAlertClose}
									/>
								)}
								<Form
									layout="vertical"
									size="large"
									onSubmitCapture={handleSubmit(submitLogin)}
								>
									<Form.Item
										required
										label="Email"
										validateStatus={errors.email ? "error" : undefined}
									>
										<Controller
											render={({ field }) => (
												<Input {...field} maxLength={255} type="email" />
											)}
											name="email"
											rules={{
												required: "Porfavor ingresa un email válido",
												maxLength: {
													message: "Porfavor ingresa un email válido",
													value: 255,
												},
												pattern: {
													value:
														/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
													message: "Porfavor ingresa un email válido",
												},
											}}
											control={control}
										/>
										<Text type="danger">
											<ErrorMessage errors={errors} name="email" />
										</Text>
									</Form.Item>
									<Form.Item
										required
										label="Contraseña"
										className="p-0 m-0"
										validateStatus={errors.password ? "error" : undefined}
									>
										<Controller
											render={({ field }) => (
												<Input.Password
													{...field}
													type="password"
													maxLength={128}
												/>
											)}
											name="password"
											rules={{
												required: "Porfavor ingresa una contraseña válida",
												maxLength: {
													value: 128,
													message: "Longitud máxima de 128 carácteres",
												},
											}}
											control={control}
										/>
										<Text type="danger">
											<ErrorMessage errors={errors} name="password" />
										</Text>
									</Form.Item>

									<div className="text-center pt-40px">
										<Button
											type="primary"
											loading={loading}
											className="w-180px"
											htmlType="submit"
										>
											Iniciar sesión
										</Button>
									</div>
								</Form>
							</Card>
						</Col>
					</Row>
				</>
			)}
		</Spin>
	);
};

export default Login;
