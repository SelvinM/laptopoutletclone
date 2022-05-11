import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import { GetStaticProps, NextPage } from "next";
import React from "react";
import StoreLayout from "../../components/layouts/StoreLayout";
import Head from "../../components/common/Head";
import { FormattedMessage, useIntl } from "react-intl";
import Link from "next/link";
import { BiRightArrowAlt } from "react-icons/bi";
import { dbConnect } from "@laptopoutlet-packages/utils";
import { addApolloState, initializeApollo } from "../../libs/apollo/apollo";
import {
	CategoriesQuery,
	CategoriesQueryVariables,
	CategoriesDocument,
} from "../../libs/graphql/operations/category.graphql";
import {
	GetConfigQuery,
	GetConfigQueryVariables,
	GetConfigDocument,
} from "../../libs/graphql/operations/config.graphql";
import getCurrentLocale from "../../utils/getCurrentLocale";

interface Props {}

const PrivacyPolicy: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.blog.privacyPolicy" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
					canonical="/blog/privacy-policy"
				>
					<meta
						name="description"
						content={formatMessage(
							{ id: "blog.privacyPolicy.chapter1.message" },
							{ appname: process.env.NEXT_PUBLIC_APP_NAME }
						)}
					/>
				</Head>
				<div className="blog-container">
					<h1 className="blog-title-1">
						<FormattedMessage id="blog.privacyPolicy" />
					</h1>
					<h2 className="blog-title-2">
						<FormattedMessage id="blog.privacyPolicy.chapter1.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.privacyPolicy.chapter1.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>

					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.privacyPolicy.chapter2.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.privacyPolicy.chapter2.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.privacyPolicy.chapter3.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.privacyPolicy.chapter3.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<h2 className="blog-title-2 mb-4 mt-10">
						<FormattedMessage id="seeAlso" />:
					</h2>
					<ul className="blog-paragraph space-y-2">
						<li className="flex items-center">
							<BiRightArrowAlt className="mr-2" />
							<Link href="/blog/terms-of-use">
								<a className="text-gray-600 underline link">
									<FormattedMessage id="blog.termsOfUse" />
								</a>
							</Link>
						</li>
						<li className="flex items-center">
							<BiRightArrowAlt className="mr-2" />
							<Link href="/blog/shipping-info">
								<a className="text-gray-600 underline link">
									<FormattedMessage id="blog.shippingInfo" />
								</a>
							</Link>
						</li>
						<li className="flex items-center">
							<BiRightArrowAlt className="mr-2" />
							<Link href="/blog/warranty-and-returns">
								<a className="text-gray-600 underline link">
									<FormattedMessage id="blog.warrantyAndReturns" />
								</a>
							</Link>
						</li>
					</ul>
				</div>
			</>
		</StoreLayout>
	);
};

export default PrivacyPolicy;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	await dbConnect();
	const currentLocale = getCurrentLocale(locale);
	const apolloClient = initializeApollo();
	await Promise.all([
		apolloClient.query<CategoriesQuery, CategoriesQueryVariables>({
			query: CategoriesDocument,
			variables: { locale: currentLocale },
		}),
		apolloClient.query<GetConfigQuery, GetConfigQueryVariables>({
			query: GetConfigDocument,
			variables: { locale: currentLocale },
		}),
	]);
	return addApolloState(apolloClient, { props: {}, revalidate: 60 * 60 });
};
