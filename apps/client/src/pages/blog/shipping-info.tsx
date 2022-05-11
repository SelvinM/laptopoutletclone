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

const ShippingInfo: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.blog.shippingInfo" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
					canonical="/blog/shipping-info"
				>
					<meta
						name="description"
						content={formatMessage(
							{ id: "blog.shippingInfo.chapter1.message1" },
							{ appname: process.env.NEXT_PUBLIC_APP_NAME }
						)}
					/>
				</Head>
				<div className="blog-container">
					<h1 className="blog-title-1">
						<FormattedMessage id="blog.shippingInfo" />
					</h1>
					<h2 className="blog-title-2">
						<FormattedMessage id="blog.shippingInfo.chapter1.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.shippingInfo.chapter1.message1"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<p className="blog-paragraph mt-3 md:mt-5">
						<FormattedMessage
							id="blog.shippingInfo.chapter1.message2"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</p>
					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.shippingInfo.chapter2.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage id="blog.shippingInfo.chapter2.message" />
					</p>
					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.shippingInfo.chapter3.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							id="blog.shippingInfo.chapter3.message"
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
							<Link href="/blog/privacy-policy">
								<a className="text-gray-600 underline link">
									<FormattedMessage id="blog.privacyPolicy" />
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

export default ShippingInfo;

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
