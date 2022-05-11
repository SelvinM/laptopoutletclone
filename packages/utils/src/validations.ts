import { parsePhoneNumber } from "libphonenumber-js/mobile";
export const validateEmail = (value: string) => {
	return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(
		value
	);
};
export const validatePassword = (value: string) => {
	return (
		/^.*[0-9].*$/.test(value) && // must contain number
		/^.*[a-z].*$/.test(value) && // must contain lower case
		/^.*[A-Z].*$/.test(value) // must contain upper case
	);
};
export const isArrayLengthLessThan6 = (value: any[]) => {
	return value.length <= 5;
};
export const isArrayLengthLessThan11 = (value: any[]) => {
	return value.length <= 10;
};
export const validatePointCoordinates = (value: number[]) => {
	if (
		value.length !== 2 ||
		value[0] > 180 ||
		value[0] < -180 ||
		value[1] > 90 ||
		value[1] < -90
	)
		return false;
	return true;
};
export const isArrayLengthLessThan7 = (value: any[]) => {
	return value.length <= 6;
};
export const validateCode = (value: string) => {
	return /^[A-Z0-9]{5}$/.test(value);
};
export const validateProductId = (value: string) => {
	return /^[A-Z0-9]*$/.test(value);
};
export const validateNumber = (value: string) => {
	return !isNaN(Number(value));
};
export const validatePhone = (value: string) => {
	try {
		if (parsePhoneNumber(value).isValid()) {
			return true;
		} else {
			return false;
		}
	} catch {
		return false;
	}
};
