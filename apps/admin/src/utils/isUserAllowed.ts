import { Role } from "@laptopoutlet-packages/types";

type Params = {
	allowedRoles: Role[];
	roles: Role[];
};

type IsUserAllowed = (params: Params) => boolean;

const isUserAllowed: IsUserAllowed = ({ roles, allowedRoles }) => {
	let smallerArray: Role[] = [];
	let largerArray: Role[] = [];

	if (roles.length > allowedRoles.length) {
		smallerArray = allowedRoles;
		largerArray = roles;
	} else {
		smallerArray = roles;
		largerArray = allowedRoles;
	}

	const intersect = largerArray.filter(function (role) {
		return smallerArray.indexOf(role) > -1;
	});
	if (intersect.length > 0) {
		return true;
	}
	return false;
};

export default isUserAllowed;
