import IntlMessageFormat from "intl-messageformat";

const getMessage = (message: string, values?: any) =>
	new IntlMessageFormat(message).format(values) as string;

export default getMessage;
