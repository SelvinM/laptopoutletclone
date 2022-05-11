import { Switch, Typography } from "antd";
import {
	SwitchSize,
	SwitchChangeEventHandler,
	SwitchClickEventHandler,
} from "antd/lib/switch";
import React from "react";
interface Props {
	value?: boolean;
	prefixCls?: string;
	size?: SwitchSize;
	defaultChecked?: boolean;
	onChange?: SwitchChangeEventHandler;
	onClick?: SwitchClickEventHandler;
	checkedChildren?: React.ReactNode;
	unCheckedChildren?: React.ReactNode;
	disabled?: boolean;
	loading?: boolean;
	autoFocus?: boolean;
	style?: React.CSSProperties;
	title?: string;
}
const WrappedSwitch = React.forwardRef(
	(
		{
			defaultChecked,
			value,
			autoFocus,
			checkedChildren,
			disabled,
			loading,
			onChange,
			onClick,
			prefixCls,
			size,
			style,
			title,
			unCheckedChildren,
		}: Props,
		ref:
			| ((instance: HTMLElement | null) => void)
			| React.RefObject<HTMLElement>
			| null
			| undefined
	) => {
		return (
			<>
				<Switch
					ref={ref}
					onChange={onChange}
					disabled={disabled}
					size={size}
					autoFocus={autoFocus}
					checkedChildren={checkedChildren}
					loading={loading}
					onClick={onClick}
					title={title}
					style={style}
					unCheckedChildren={unCheckedChildren}
					prefixCls={prefixCls}
					defaultChecked={defaultChecked}
					checked={value}
				/>
				<Typography.Text className="pl-5px">{title}</Typography.Text>
			</>
		);
	}
);

export default WrappedSwitch;
