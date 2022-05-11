import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import Head from "../../components/common/Head";
import Link from "next/link";
import React from "react";
import { BiSad } from "react-icons/bi";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleLayout from "../../components/layouts/SimpleLayouts/SimpleLayout";

interface Props {}

const Custom404 = ({}: Props) => {
	const { formatMessage } = useIntl();
	return (
		<SimpleLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.404error" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div className="h-80 md:h-112 flex flex-col justify-center items-center text-center px-4">
					<BiSad className="dark:text-secondary-200 text-5xl md:text-6xl text-primary-500" />
					<h1 className="text-2xl md:text-3xl mt-4">
						<FormattedMessage id="error404.title" />
					</h1>
					<div className="mt-10">
						<Link href="/">
							<a className="btn btn-primary px-4 py-2 text-sm sm:text-base ">
								<FormattedMessage id="error404.buttonLabel" />
							</a>
						</Link>
					</div>
				</div>
			</>
		</SimpleLayout>
	);
};

export default Custom404;
