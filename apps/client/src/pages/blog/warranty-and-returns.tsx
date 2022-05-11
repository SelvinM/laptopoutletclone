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

const WarrantyAndReturns: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.blog.warrantyAndReturns" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
					canonical="/blog/warranty-and-returns"
				>
					<meta
						name="description"
						content={formatMessage(
							{ id: "blog.warrantyAndReturns.chapter1.message1" },
							{ appname: process.env.NEXT_PUBLIC_APP_NAME }
						)}
					/>
				</Head>
				<div className="blog-container">
					<h1 className="blog-title-1">
						<FormattedMessage id="blog.warrantyAndReturns" />
					</h1>
					<h2 className="blog-title-2">
						<FormattedMessage id="blog.warrantyAndReturns.chapter1.title" />
					</h2>
					<p className="blog-paragraph">
						<FormattedMessage
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
							id="blog.warrantyAndReturns.chapter1.message1"
						/>
					</p>
					<p className="blog-paragraph mt-3 md:mt-5">
						<FormattedMessage
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
							id="blog.warrantyAndReturns.chapter1.message2"
						/>
					</p>
					<p className="blog-paragraph mt-3 md:mt-5">
						<FormattedMessage
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
							id="blog.warrantyAndReturns.chapter1.message3"
						/>
					</p>
					<p className="blog-paragraph mt-3 md:mt-5">
						<FormattedMessage
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
							id="blog.warrantyAndReturns.chapter1.message4"
						/>
					</p>
					<ol className="blog-paragraph mt-4 space-y-4 list-decimal list-inside">
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter1.elem1"
							/>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter1.elem2"
							/>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter1.elem3"
							/>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter1.elem4"
							/>
							<ol className="list-inside space-y-2 list-alpha ml-4 sm:ml-5 md:ml-6 mt-2">
								<li>
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.warrantyAndReturns.chapter1.elem4.a"
									/>
								</li>
								<li>
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.warrantyAndReturns.chapter1.elem4.b"
									/>
								</li>
								<li>
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.warrantyAndReturns.chapter1.elem4.c"
									/>
								</li>
								<li>
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.warrantyAndReturns.chapter1.elem4.d"
									/>
								</li>
								<li>
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.warrantyAndReturns.chapter1.elem4.e"
									/>
								</li>
								<li>
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.warrantyAndReturns.chapter1.elem4.f"
									/>
								</li>
							</ol>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter1.elem5"
							/>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter1.elem6"
							/>
						</li>
					</ol>
					<h2 className="blog-title-2 mt-10">
						<FormattedMessage id="blog.warrantyAndReturns.chapter2.title" />
					</h2>
					<ol className="blog-paragraph space-y-4 list-decimal list-inside">
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter2.elem1"
							/>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter2.elem2"
							/>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter2.elem3"
							/>
						</li>
						<li>
							<FormattedMessage
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
								id="blog.warrantyAndReturns.chapter2.elem4"
							/>
						</li>
					</ol>
					<h2 className="blog-title-2 mb-4 mt-10">
						<FormattedMessage
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
							id="seeAlso"
						/>
						:
					</h2>
					<ul className="blog-paragraph space-y-2">
						<li className="flex items-center">
							<BiRightArrowAlt className="mr-2" />
							<Link href="/blog/terms-of-use">
								<a className="text-gray-600 underline link">
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.termsOfUse"
									/>
								</a>
							</Link>
						</li>
						<li className="flex items-center">
							<BiRightArrowAlt className="mr-2" />
							<Link href="/blog/shipping-info">
								<a className="text-gray-600 underline link">
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.shippingInfo"
									/>
								</a>
							</Link>
						</li>
						<li className="flex items-center">
							<BiRightArrowAlt className="mr-2" />
							<Link href="/blog/privacy-policy">
								<a className="text-gray-600 underline link">
									<FormattedMessage
										values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
										id="blog.privacyPolicy"
									/>
								</a>
							</Link>
						</li>
					</ul>
				</div>
			</>
		</StoreLayout>
	);
};

export default WarrantyAndReturns;

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
