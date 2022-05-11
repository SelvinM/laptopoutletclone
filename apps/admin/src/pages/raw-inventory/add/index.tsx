import Error403 from "../../../components/Error403";
import { RAW_INVENTORY_ADD_ROLES } from "../../../constants/pageRoles";
import { useMeQuery } from "../../../libs/graphql/operations/admin.graphql";
import isUserAllowed from "../../../utils/isUserAllowed";
import React from "react";

interface Props {}

const AddRawInventory = ({}: Props) => {
	//role access control start
	const { data: meData } = useMeQuery();
	const allowed = isUserAllowed({
		allowedRoles: RAW_INVENTORY_ADD_ROLES,
		roles: meData?.me?.roles || [],
	});
	if (meData?.me && !allowed) return <Error403 />;
	//role access control finish
	return <div></div>;
};

export default AddRawInventory;
