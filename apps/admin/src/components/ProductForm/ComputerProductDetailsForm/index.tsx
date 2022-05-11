import React, { useEffect } from "react";
import { Col, Form, Row, Typography, Spin, message, AutoComplete } from "antd";
import { Control, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useGetDistinctProductDetailsQuery } from "../../../libs/graphql/operations/product.graphql";
import { DATA_LOAD_ERROR } from "../../../constants/messages";
import { ProductType } from "@laptopoutlet-packages/types";
import { DEFAULT_MESSAGE_DURATION } from "../../../constants";
const { Text } = Typography;
interface Props {
	control: Control<any>;
	errors: any;
}

const ComputerProductDetailsForm = ({ control, errors }: Props) => {
	const { data, loading, error } = useGetDistinctProductDetailsQuery({
		variables: { type: ProductType.ComputerProduct },
	});
	useEffect(() => {
		if (error) {
			message.error(DATA_LOAD_ERROR, DEFAULT_MESSAGE_DURATION);
		}
	}, [error]);

	return (
		<Spin spinning={loading}>
			<Row justify="space-between">
				<Col xl={11} lg={11} md={11} sm={11} xs={24}>
					<Form.Item
						label="Nombre del modelo"
						validateStatus={errors.modelName ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									placeholder="Ej. Latitude E6440"
									options={data?.getDistinctProductDetails?.model
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
								/>
							)}
							name="modelName"
							rules={{
								maxLength: {
									message: "Máximo de 64 caracteres",
									value: 64,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="modelName" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={11} lg={11} md={11} sm={11} xs={24}>
					<Form.Item
						label="Sistema operativo"
						validateStatus={errors.os ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									placeholder="Ej. Microsoft® Windows® 7 Professional 64 bit"
									options={data?.getDistinctProductDetails?.os
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
								/>
							)}
							name="os"
							rules={{
								maxLength: {
									message: "Máximo de 64 caracteres",
									value: 64,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="so" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={5} lg={5} md={5} sm={5} xs={24}>
					<Form.Item
						label="Tamaño de pantalla"
						validateStatus={errors.screenSize ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									options={data?.getDistinctProductDetails?.screenSize
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
									placeholder={`Ej. 15"`}
								/>
							)}
							name="screenSize"
							rules={{
								maxLength: {
									message: "Máximo de 28 caracteres",
									value: 28,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="screenSize" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={5} lg={5} md={5} sm={5} xs={24}>
					<Form.Item
						label="HDD"
						validateStatus={errors.hdd ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									options={data?.getDistinctProductDetails?.hdd
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
									placeholder="Ej. 300 GB"
								/>
							)}
							name="hdd"
							rules={{
								maxLength: {
									message: "Máximo de 28 caracteres",
									value: 28,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="hdd" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={5} lg={5} md={5} sm={5} xs={24}>
					<Form.Item
						label="SSD"
						validateStatus={errors.ssd ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									options={data?.getDistinctProductDetails?.ssd
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
									placeholder="Ej. 256 GB"
								/>
							)}
							name="ssd"
							rules={{
								maxLength: {
									message: "Máximo de 28 caracteres",
									value: 28,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="ssd" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={5} lg={5} md={5} sm={5} xs={24}>
					<Form.Item
						label="Memoria RAM"
						validateStatus={errors.ram ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									options={data?.getDistinctProductDetails?.ram
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
									placeholder="Ej. 16 GB"
								/>
							)}
							name="ram"
							rules={{
								maxLength: {
									message: "Máximo de 28 caracteres",
									value: 28,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="ram" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={11} lg={11} md={11} sm={11} xs={24}>
					<Form.Item
						label="Tarjeta gráfica"
						validateStatus={errors.graphicsProcessor ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									placeholder="Ej. AMD Radeon HD 8690M (2 GB)"
									options={data?.getDistinctProductDetails?.graphicsProcessor
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
								/>
							)}
							name="graphicsProcessor"
							rules={{
								maxLength: {
									message: "Máximo de 64 caracteres",
									value: 64,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="graphicsProcessor" />
						</Text>
					</Form.Item>
				</Col>
				<Col xl={11} lg={11} md={11} sm={11} xs={24}>
					<Form.Item
						label="Procesador"
						validateStatus={errors.processor ? "error" : undefined}
					>
						<Controller
							defaultValue=""
							control={control}
							render={({ field }) => (
								<AutoComplete
									{...field}
									options={data?.getDistinctProductDetails?.processor
										.slice(0, 9)
										.filter((item) => item !== "")
										.map((item) => ({
											value: item as string,
										}))}
									filterOption={(inputValue: any, option: any) =>
										option.value
											.toUpperCase()
											.indexOf(inputValue.toUpperCase()) !== -1
									}
									placeholder="Ej. Intel Core i5 4300M / 2.6 GHz"
								/>
							)}
							name="processor"
							rules={{
								maxLength: {
									message: "Máximo de 64 caracteres",
									value: 64,
								},
							}}
						/>
						<Text type="danger">
							<ErrorMessage errors={errors} name="processor" />
						</Text>
					</Form.Item>
				</Col>
			</Row>
		</Spin>
	);
};

export default ComputerProductDetailsForm;
