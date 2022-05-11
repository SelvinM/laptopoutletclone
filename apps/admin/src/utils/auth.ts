import { sign, verify } from "jsonwebtoken";
import cookie from "cookie";

import { Admin } from "@laptopoutlet-packages/models";
import {
	DecodedAccessToken,
	DecodedRefreshToken,
	Role,
} from "@laptopoutlet-packages/types";
import { dbConnect } from "@laptopoutlet-packages/utils";
interface CreateTokens {
	id: string;
	tic: number;
	roles: Role[];
}
export type TokenUser = {
	id: string;
	roles?: Role[];
};
type VerifyAndRefreshTokensResponse = {
	cookies?: string[];
	user?: TokenUser;
};

type VerifyAndRefreshTokens = (
	accessToken?: string,
	refreshToken?: string
) => Promise<VerifyAndRefreshTokensResponse | undefined>;

export const createTokens = ({ id, tic, roles }: CreateTokens) => {
	const accessToken = sign(
		{ user: { id, roles } },
		process.env.AUTH_KEY as string,
		{
			expiresIn: "15min",
		}
	);
	const refreshToken = sign(
		{ user: { id, tic } },
		process.env.REFRESH_AUTH_KEY as string,
		{ expiresIn: "1d" }
	);
	return { accessToken, refreshToken };
};

interface Tokens {
	accessToken: string;
	refreshToken: string;
}

export const createCookies = (tokens: Tokens) => {
	return [
		cookie.serialize("access-token", tokens.accessToken, {
			httpOnly: true,
			maxAge: 60 * 15,
			path: "/",
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		}),
		cookie.serialize("refresh-token", tokens.refreshToken, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7,
			path: "/",
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		}),
	];
};

export const expireCookies = () => {
	return [
		cookie.serialize("access-token", "", {
			httpOnly: true,
			maxAge: -1,
			path: "/",
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		}),
		cookie.serialize("refresh-token", "", {
			httpOnly: true,
			maxAge: -1,
			path: "/",
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		}),
	];
};
export const verifyAndRefreshTokens: VerifyAndRefreshTokens = async (
	accessToken?: string,
	refreshToken?: string
) => {
	if (!accessToken && !refreshToken) return;
	try {
		const decodedAccessToken = verify(
			accessToken as string,
			process.env.AUTH_KEY as string
		) as DecodedAccessToken;
		return { user: decodedAccessToken.user, cookies: undefined };
	} catch (error) {}
	if (!refreshToken) return;
	try {
		const decodedRefreshToken = verify(
			refreshToken,
			process.env.REFRESH_AUTH_KEY as string
		) as DecodedRefreshToken;
		await dbConnect();
		const admin = await Admin.findById(decodedRefreshToken?.user?.id);
		if (!admin || admin.tic !== decodedRefreshToken?.user?.tic) return;
		const tokens = createTokens({
			id: admin.id,
			tic: admin.tic,
			roles: admin.roles,
		});
		const cookies = createCookies(tokens);
		return { user: { id: admin.id, roles: admin.roles }, cookies };
	} catch (error) {}
	return;
};
