import React from "react";
import { Descriptions } from "antd";
import { GetProductQuery } from "../../../libs/graphql/operations/product.graphql";
import { IComputerProductFullTranslations } from "@laptopoutlet-packages/models";

interface Props {
	data?: GetProductQuery;
}

const ComputerProductDetailsTable = ({ data }: Props) => {
	const emptyField = "N/A";
	const details = (data?.getProduct as IComputerProductFullTranslations)
		.details;
	return (
		<Descriptions
			title="Detalles especificos de laptop"
			bordered
			column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
		>
			<Descriptions.Item label="Nombre del modelo">
				{details?.model || emptyField}
			</Descriptions.Item>
			<Descriptions.Item label="Sistema operativo">
				{details?.os || emptyField}
			</Descriptions.Item>
			<Descriptions.Item label="Tamaño de pantalla">
				{details?.screenSize || emptyField}
			</Descriptions.Item>
			<Descriptions.Item label="Disco duro">
				{details?.hdd || emptyField}
			</Descriptions.Item>
			<Descriptions.Item label="Disco de estado sólido">
				{details?.ssd || emptyField}
			</Descriptions.Item>
			<Descriptions.Item label="Memoria RAM">
				{details?.ram || emptyField}
			</Descriptions.Item>
			<Descriptions.Item label="Tarjeta gráfica">
				{details?.graphicsProcessor || emptyField}
			</Descriptions.Item>
			<Descriptions.Item label="Procesador">
				{details?.processor || emptyField}
			</Descriptions.Item>
		</Descriptions>
	);
};

export default ComputerProductDetailsTable;
