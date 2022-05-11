import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import { GetStaticProps, NextPage } from "next";
import React from "react";
import StoreLayout from "../../components/layouts/StoreLayout";
import Head from "../../components/common/Head";
import { FormattedMessage, useIntl } from "react-intl";
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
import Link from "next/link";
import { BiRightArrowAlt } from "react-icons/bi";
import getCurrentLocale from "../../utils/getCurrentLocale";

interface Props {}

const TermsOfUse: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.blog.termsOfUse" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
					canonical="/blog/terms-of-use"
				>
					<meta
						name="description"
						content={formatMessage(
							{ id: "blog.termsOfUse.chapter1.message" },
							{ appname: process.env.NEXT_PUBLIC_APP_NAME }
						)}
					/>
				</Head>
				<div className="blog-container">
					<h1 className="blog-title-1">
						<FormattedMessage id="blog.termsOfUse" />
					</h1>
					<h2 className="blog-title-2">
						<FormattedMessage
							id="blog.termsOfUse.chapter1.title"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>{" "}
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.termsOfUse.chapter1.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>

					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.termsOfUse.chapter2.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.termsOfUse.chapter2.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.termsOfUse.chapter3.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.termsOfUse.chapter3.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.termsOfUse.chapter4.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.termsOfUse.chapter4.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.termsOfUse.chapter5.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.termsOfUse.chapter5.message"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<h2 className="blog-title-2 mt-10 mb-4">
						<FormattedMessage id="seeAlso" />:
					</h2>
					<ul className="blog-paragraph space-y-2">
						<li className="flex items-center">
							<BiRightArrowAlt className="mr-2" />
							<Link href="/blog/privacy-policy">
								<a className="text-gray-600 underline link">
									<FormattedMessage id="blog.privacyPolicy" />
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

export default TermsOfUse;

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
