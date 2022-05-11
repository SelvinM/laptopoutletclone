import React from "react";
import { Controller } from "react-hook-form";
type Transform = {
	input: (value: string) => string;
	output: (e: React.ChangeEvent<HTMLInputElement>) => string;
};

interface Props {
	control: any;
	defaultValue?: string;
	transform?: Transform;
	name: string;
	placeholder?: string;
	maxLength?: number;
	rules?: any;
	className?: string;
	type?: string;
	inputMode?:
		| "text"
		| "none"
		| "tel"
		| "url"
		| "email"
		| "numeric"
		| "decimal"
		| "search"
		| undefined;
	autoComplete?: string;
}
const ControllerPlus = ({
	control,
	transform,
	name,
	placeholder,
	defaultValue,
	rules,
	className,
	maxLength,
	type,
	inputMode,
	autoComplete,
}: Props) => (
	<Controller
		defaultValue={defaultValue}
		control={control}
		name={name}
		rules={rules}
		render={({ field: { onChange, value } }) => (
			<input
				type={type}
				onChange={(e) => onChange(transform?.output(e))}
				value={transform?.input(value)}
				maxLength={maxLength}
				className={className}
				autoComplete={autoComplete}
				inputMode={inputMode}
				placeholder={placeholder}
			/>
		)}
	/>
);

export default ControllerPlus;
