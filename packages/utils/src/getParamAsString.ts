export const getParamAsString = (queryParam: string | string[] | undefined) => {
	if (!queryParam) return;
	if (Array.isArray(queryParam)) return queryParam[0];
	return queryParam;
};
