import { IUser } from "@laptopoutlet-packages/models";
import { SESSION_MAX_AGE } from "apps/client/src/constants";
import { sendVerificationRequest } from "apps/client/src/utils/sendgrid";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import Adapters, { TypeORM } from "next-auth/adapters";
import Providers from "next-auth/providers";
import Models from "../../../libs/CustomModels";

const options: NextAuthOptions = {
	providers: [
		Providers.Google({
			clientId: process.env.GOOGLE_ID || "",
			clientSecret: process.env.GOOGLE_SECRET || "",
		}),
		Providers.Email({
			from: process.env.SENDGRID_SENDER_EMAIL,
			sendVerificationRequest,
			maxAge: 60 * 60 * 2, // 2 hours
		}),
	],
	session: {
		jwt: true,
		maxAge: SESSION_MAX_AGE, // 1 day
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		maxAge: SESSION_MAX_AGE,
		signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
		verificationOptions: { maxTokenAge: `${SESSION_MAX_AGE}s` },
	},
	callbacks: {
		signIn: async (_user, account, profile) => {
			if (account.provider === "facebook" && !profile.email)
				return "/signin?error=NoVerifiedEmailFacebook";
			if (
				(account.provider === "google" &&
					profile.email &&
					!profile.verified_email) ||
				!profile.email
			)
				return false;
			return true;
		},
		jwt: async (token, user) => {
			const customUser = user as any as IUser;
			if (customUser) token.id = customUser.id;
			return Promise.resolve(token);
		},
		redirect: async (url, baseUrl) => {
			return url.startsWith(baseUrl)
				? Promise.resolve(url)
				: Promise.resolve(baseUrl);
		},
	},
	adapter: Adapters.TypeORM.Adapter(
		// The first argument should be a database connection string or TypeORM config object
		{
			type: "mongodb",
			useNewUrlParser: true,
			useUnifiedTopology: true,
			connectTimeoutMS: 36000,
			keepAlive: 300000,
			database: "laptop_outlet",
			url: process.env.MONGO_URL,
		},
		// The second argument can be used to pass custom models and schemas
		{
			models: {
				...TypeORM.Models,
				User: Models.User,
			},
		}
	),
	pages: {
		signIn: "/signin",
		error: "/signin",
	},
	secret: process.env.AUTH_SECRET,
	debug: process.env.NODE_ENV === "development",
};

const Auth = (req: NextApiRequest, res: NextApiResponse) =>
	NextAuth(req, res, options);

export default Auth;
