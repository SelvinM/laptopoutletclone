export const getParamAsArray = (queryParam: string | string[] | undefined) => {
	if (!queryParam) return undefined;
	if (Array.isArray(queryParam)) return queryParam;
	return [queryParam];
};
