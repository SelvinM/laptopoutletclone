import { signIn } from "next-auth/client";
import { useRouter } from "next/router";
import React from "react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FormattedMessage } from "react-intl";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import Alert from "../common/Alert";
import { BiEnvelope } from "react-icons/bi";
import Link from "next/link";
const getProviderIcon = (provider: string) => {
	switch (provider) {
		case "Facebook":
			return <FaFacebook className="text-2xl" />;

		case "Google":
			return <FcGoogle className="text-2xl" />;
		default:
			break;
	}
};
const getProviderClasses = (provider: string) => {
	let className: string;
	switch (provider) {
		case "Facebook":
			className =
				"bg-facebook-500 text-white flex-nowrap ring-facebook-400 active:bg-facebook-600 focus:ring focus:ring-facebook-200";
			return className;
		case "Google":
			className =
				"bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 border hover:bg-gray-100 active:bg-gray-100 focus:ring focus:ring-gray-400";
			return className;
		default:
			break;
	}
};
const handleError = (error: string) => {
	switch (error) {
		case "AccessDenied":
			return <FormattedMessage id="signIn.error.accessDenied" />;
		case "OAuthAccountNotLinked":
			return <FormattedMessage id="signIn.error.accountNotLinked" />;
		case "NoVerifiedEmail":
			return <FormattedMessage id="signIn.error.noVerifiedEmailFacebook" />;
		case "Verification":
			return <FormattedMessage id="signIn.error.linkExpired" />;
		default:
			return <FormattedMessage id="signIn.error" />;
	}
};
const AuthCard = ({}) => {
	const providers = {
		// facebook: {
		// 	id: "facebook",
		// 	name: "Facebook",
		// },
		google: {
			id: "google",
			name: "Google",
		},
	};
	const router = useRouter();

	const clearError = () => {
		router.push({ pathname: router.pathname, search: "" });
	};
	const callbackUrl = getParamAsString(router.query.callbackUrl);
	const error = getParamAsString(router.query.error);
	return (
		<div className="dark:bg-gray-900 w-full sm:w-auto px-3 py-8 sm:p-12 lg:p-16 bg-white xs:shadow-md mx-auto">
			<div className=" text-center px-8 w-full">
				<h1 className="title text-xl uppercase ">
					<FormattedMessage id="signIn" />
				</h1>
			</div>
			<div className="mt-8 w-64 sm:w-72 mx-auto">
				{error && (
					<Alert
						type="error"
						message={handleError(error)}
						onClose={clearError}
					/>
				)}
				<div className="my-8">
					{providers &&
						Object.values(providers).map((provider) => (
							<div key={provider.name}>
								<button
									onClick={() =>
										signIn(provider.id, {
											callbackUrl: callbackUrl || process.env.NEXT_PUBLIC_URL,
										})
									}
									className={`btn justify-start px-4 w-full md:text-lg py-3 mb-6 ${getProviderClasses(
										provider.name
									)}`}
								>
									{getProviderIcon(provider.name)}{" "}
									<span className="ml-3">
										<FormattedMessage id={`continueWith${provider.name}`} />
									</span>
								</button>
							</div>
						))}
					{
						<Link
							href={{
								pathname: "/signin/email",
								query: callbackUrl ? { callbackUrl } : undefined,
							}}
						>
							<a className="btn btn-primary justify-start px-4 w-full md:text-lg py-3">
								<BiEnvelope className="text-2xl" />{" "}
								<span className="ml-3">
									<FormattedMessage id="continueWithEmail" />
								</span>
							</a>
						</Link>
					}
				</div>
				<div className="dark:text-gray-400 text-center text-2xs sm:text-xs text-gray-600">
					<FormattedMessage
						id="legalWarningMessage"
						values={{
							termsOfUse: (
								<a
									href="/blog/terms-of-use"
									className="hover:text-secondary-500 dark:hover:text-secondary-200 capitalize underline"
									target="_blank"
								>
									<FormattedMessage id="blog.termsOfUse" />
								</a>
							),
							privacyPolicy: (
								<a
									href="/blog/privacy-policy"
									className="hover:text-secondary-500 dark:hover:text-secondary-200 capitalize underline"
									target="_blank"
								>
									<FormattedMessage id="blog.privacyPolicy" />
								</a>
							),
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default AuthCard;
