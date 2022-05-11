import { Currency } from "@laptopoutlet-packages/types";
import cookie from "cookie";
import { GraphQLContext, Token } from "../types";
import { isCurrency } from "@laptopoutlet-packages/utils";
import { dbConnect } from "@laptopoutlet-packages/utils";
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import { SESSION_MAX_AGE } from "../constants";
type ResolverContext = {
	req: NextApiRequest;
	res: NextApiResponse;
};

const serverContextMiddleware: (
	ctx: ResolverContext
) => Promise<GraphQLContext> = async ({ req, res }: ResolverContext) => {
	await dbConnect();
	let currency: Currency = Currency.Hnl;
	let token: Token | null = null;
	if (req)
		token = (await getToken({
			req,
			secret: process.env.JWT_SECRET || "",
			maxAge: SESSION_MAX_AGE,
			signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
			verificationOptions: {
				maxTokenAge: `${SESSION_MAX_AGE}s`,
			},
		})) as Token | null;
	if (
		req?.headers.cookie &&
		isCurrency(cookie.parse(req.headers.cookie as string).currency)
	)
		currency = cookie.parse(req.headers.cookie as string).currency as Currency;
	return { req, res, currency, token };
};

export default serverContextMiddleware;
