import { RedoOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import React from "react";

interface Props {
	disabled?: boolean;
	action?: () => void;
}

const RefreshButton = ({ disabled, action }: Props) => {
	return (
		<Tooltip title="Refrescar">
			<Button
				disabled={disabled}
				onClick={action}
				type="text"
				icon={<RedoOutlined rotate={-90} />}
			/>
		</Tooltip>
	);
};

export default RefreshButton;
