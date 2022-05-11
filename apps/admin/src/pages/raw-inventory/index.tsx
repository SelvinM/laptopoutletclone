import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import React from "react";
import Error403 from "../../components/Error403";
import isUserAllowed from "../../utils/isUserAllowed";
import { RAW_INVENTORY_ROLES } from "../../constants/pageRoles";
interface Props {}

const RawInventory = ({}: Props) => {
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: RAW_INVENTORY_ROLES,
		roles: meData?.me?.roles || [],
	});

	if (meData?.me && !allowed) {
		return <Error403 />;
	}
	return <div>RawInventory</div>;
};

export default RawInventory;
