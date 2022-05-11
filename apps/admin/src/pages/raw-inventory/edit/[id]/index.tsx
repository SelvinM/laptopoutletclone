import { useMeQuery } from "../../../../libs/graphql/operations/admin.graphql";
import React from "react";
import Error403 from "apps/admin/src/components/Error403";
import isUserAllowed from "apps/admin/src/utils/isUserAllowed";
import { RAW_INVENTORY_ROLES } from "apps/admin/src/constants/pageRoles";

interface Props {}

const RawInventoryEdit = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: RAW_INVENTORY_ROLES,
		roles: meData?.me?.roles || [],
	});

	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	return <div></div>;
};

export default RawInventoryEdit;
