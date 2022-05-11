import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";

interface Props {
	hideLegalLinks?: boolean;
}

const FooterSimple = ({ hideLegalLinks }: Props) => {
	return (
		<div className="text-sm">
			<div
				className={`${
					hideLegalLinks
						? "hidden"
						: "flex justify-center items-center mb-2 text-xs"
				}`}
			>
				<Link href="/blog/terms-of-use">
					<a className="hover:text-secondary-500 dark:hover:text-secondary-200">
						<FormattedMessage id="blog.termsOfUse" />
					</a>
				</Link>
				<div className="mx-1">|</div>
				<Link href="/blog/privacy-policy">
					<a className="hover:text-secondary-500 dark:hover:text-secondary-200">
						<FormattedMessage id="blog.privacyPolicy" />
					</a>
				</Link>
			</div>
			<div className="text-xs sm:text-base md:px-8 p-2 text-center bg-white dark:bg-gray-900">
				<span>
					<FormattedMessage
						id="footer.copyright"
						values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
					/>
				</span>
			</div>
		</div>
	);
};

export default FooterSimple;
