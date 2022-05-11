import { NotificationType } from "../types";

export const getBackgroundBarClassName = (type: NotificationType) => {
	let className: string;
	switch (type) {
		case "error":
			className = "bg-red-700";
			break;
		case "success":
			className = "bg-green-600";
			break;
		case "warning":
			className = "bg-yellow-600";
			break;
		case "info":
			className = "bg-primary-500 dark:bg-secondary-200";
			break;
		default:
			className = "bg-primary-500 dark:bg-secondary-200";
	}
	return className;
};

export const getBackgroundClassName = (type: NotificationType) => {
	let className: string;
	switch (type) {
		case "error":
			className = "dark:bg-gray-900 bg-red-50";
			break;
		case "success":
			className = "dark:bg-gray-900 bg-green-50";
			break;
		case "warning":
			className = "dark:bg-gray-900 bg-yellow-50";
			break;
		case "info":
			className = "dark:bg-gray-900 bg-primary-100";
			break;
		default:
			className = "dark:bg-gray-900 bg-primary-100";
	}
	return className;
};
export const getBorderClassName = (type: NotificationType) => {
	let className: string;
	switch (type) {
		case "error":
			className = "border-red-600 dark:border-red-400";
			break;
		case "success":
			className = "border-green-600 dark:border-green-400";
			break;
		case "warning":
			className = "border-yellow-600 dark:border-yellow-400";
			break;
		case "info":
			className = "border-primary-500 dark:border-secondary-200";
			break;
		default:
			className = "border-primary-500 dark:border-secondary-200";
	}
	return className;
};
export const getLinkClassName = (type: NotificationType) => {
	let className: string;
	switch (type) {
		case "error":
			className =
				"dark:text-red-500 dark:hover:text-red-600 text-red-600 hover:text-red-400";
			break;
		case "success":
			className =
				"dark:text-green-400 dark:hover:text-green-600 text-green-600 hover:text-green-400";
			break;
		case "warning":
			className =
				"dark:text-yellow-400 dark:hover:text-yellow-600 text-yellow-600 hover:text-yellow-400";
			break;
		case "info":
			className =
				"text-primary-500 dark:text-gray-200 hover:text-secondary-500 dark:hover:text-secondary-200";
			break;
		default:
			className =
				"text-primary-500 dark:text-gray-200 hover:text-secondary-500 dark:hover:text-secondary-200";
	}
	return className;
};

export const getTextClassName = (type: NotificationType) => {
	switch (type) {
		case "error":
			return "dark:text-red-500 text-red-600";
		case "success":
			return "dark:text-green-400 text-green-600";
		case "warning":
			return "dark:text-yellow-400 text-yellow-600";
		case "info":
			return "dark:text-gray-300 text-primary-500";
		default:
			return "dark:text-gray-300 text-primary-500";
	}
};
