import React from "react";
import Error403 from "../../components/Error403";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import isUserAllowed from "../../utils/isUserAllowed";
import { FINANCE_ROLES } from "../../constants/pageRoles";
interface Props {}

const Finance = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: FINANCE_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	return <div>Finance</div>;
};

export default Finance;
