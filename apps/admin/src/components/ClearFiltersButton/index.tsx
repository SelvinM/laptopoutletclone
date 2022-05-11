import { ClearOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import React from "react";

interface Props {
	disabled?: boolean;
	action?: () => void;
}

const ClearFiltersButton = ({ disabled, action }: Props) => {
	return (
		<Tooltip placement="topLeft" title="Limpiar todos los filtros">
			<Button
				type="text"
				disabled={disabled}
				onClick={action}
				icon={<ClearOutlined />}
			/>
		</Tooltip>
	);
};

export default ClearFiltersButton;
