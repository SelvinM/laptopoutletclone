import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import React from "react";
import Head from "../../components/common/Head";
import { useIntl } from "react-intl";
import SimpleLayout from "../../components/layouts/SimpleLayouts/SimpleLayout";
import EmailAuthCard from "../../components/signIn/EmailAuthCard";
interface Props {}

const Email = ({}: Props) => {
	const { formatMessage } = useIntl();
	return (
		<SimpleLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.signIn.email" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div className="my-8 flex justify-center">
					<EmailAuthCard />
				</div>
			</>
		</SimpleLayout>
	);
};

export default Email;
