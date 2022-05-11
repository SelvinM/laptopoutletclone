import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import Head from "../../components/common/Head";
import React from "react";
import { useIntl } from "react-intl";
import SimpleLayout from "../../components/layouts/SimpleLayouts/SimpleLayout";
import AuthCard from "../../components/signIn/AuthCard";
export type SessionProvider = {
	id: string;
	name: string;
	type: string;
	signInUrl: string;
	callbackUrl: string;
};
export type ProvidersResponse = { [provider: string]: SessionProvider };
const SignIn = ({}) => {
	const { formatMessage } = useIntl();
	return (
		<SimpleLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.signIn" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
					canonical="/signin"
				>
					<meta
						name="description"
						content={formatMessage(
							{ id: "description.signIn" },
							{ appname: process.env.NEXT_PUBLIC_APP_NAME }
						)}
					/>
				</Head>
				<div className="my-8 flex justify-center">
					<AuthCard />
				</div>
			</>
		</SimpleLayout>
	);
};

export default SignIn;
