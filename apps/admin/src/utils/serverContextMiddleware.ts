import { verifyAndRefreshTokens } from "./auth";
import cookie from "cookie";
import { ResolverContext } from "../libs/apollo/apollo";
import { GraphQLContext } from "../types";
import { dbConnect } from "@laptopoutlet-packages/utils";

const serverContextMiddleware: (
	ctx: ResolverContext
) => Promise<GraphQLContext> = async ({ req, res }: ResolverContext) => {
	await dbConnect();
	if (!req?.headers.cookie) return { req, res };
	const { "access-token": accessToken, "refresh-token": refreshToken } =
		cookie.parse(req.headers.cookie);
	const verifyTokensResponse = await verifyAndRefreshTokens(
		accessToken,
		refreshToken
	);
	if (!verifyTokensResponse) return { req, res };
	if (verifyTokensResponse.cookies) {
		const cookies = verifyTokensResponse.cookies;
		res?.setHeader("Set-Cookie", cookies);
	}
	return { req, res, user: verifyTokensResponse.user };
};

export default serverContextMiddleware;
