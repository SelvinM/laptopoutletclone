import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/400-italic.css";
import { GetStaticProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import StoreLayout from "../../components/layouts/StoreLayout";
import Head from "../../components/common/Head";
import { FormattedMessage, useIntl } from "react-intl";
import { useRouter } from "next/router";
import NameForm from "../../components/account/NameForm";
import EmailForm from "../../components/account/EmailForm";
import PhoneForm from "../../components/account/PhoneForm";
import { BiLeftArrowAlt, BiLoaderAlt } from "react-icons/bi";
import AccountFormSkeleton from "../../components/skeletons/AccountFormSkeleton";
import NameFormSkeleton from "../../components/skeletons/NameFormSkeleton";
import goToSignIn from "../../utils/goToSignIn";
import { useMeQuery } from "../../libs/graphql/operations/user.graphql";
import { dbConnect } from "@laptopoutlet-packages/utils";
import { initializeApollo, addApolloState } from "../../libs/apollo/apollo";
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
import Tabs from "../../components/common/Tabs";
import MessageWithLink from "../../components/common/MessageWithAction";
interface Props {}
enum KEY {
	NAME = "account.name",
	EMAIL = "account.email",
	PHONE = "account.phone",
	PAYMENTS = "payments",
	ADDRESSES = "addresses",
}
const AccountSettings: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	const { data, loading } = useMeQuery();
	const router = useRouter();
	const [currentKey, setCurrentKey] = useState<string>();
	const handleMobileMenuClick = (key: KEY) => {
		window.scroll({ top: 0 });
		switch (key) {
			case KEY.ADDRESSES:
				router.push("/settings/addresses");
				break;
			case KEY.PAYMENTS:
				router.push("/settings/payments");
				break;
			default:
				setCurrentKey(key);
				break;
		}
	};
	useEffect(() => {
		router.beforePopState(() => {
			if (currentKey) {
				setCurrentKey(undefined);
				router.replace("/settings/account");
				return false;
			} else {
				return true;
			}
		});
	}, [router.pathname]);
	const handleReturn = () => {
		setCurrentKey(undefined);
		window.scroll({ top: 0 });
	};

	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.settings.account" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>

				<div className="hidden md:block mt-8 mb-16">
					<h1 className="mb-4 title tracking-wide text-2xl">
						<FormattedMessage id="settings" />
					</h1>
					<Tabs
						tabs={[
							{
								href: "/settings/account",
								label: formatMessage({ id: "settings.account" }),
							},
							{
								href: "/settings/payments",
								label: formatMessage({ id: "settings.payments" }),
							},
							{
								href: "/settings/addresses",
								label: formatMessage({ id: "settings.addresses" }),
							},
						]}
					>
						<div className="px-8">
							{loading ? (
								<>
									<div className="dark:border-gray-600 py-8 border-b">
										<NameFormSkeleton />
									</div>
									<div className="dark:border-gray-600 py-8 border-b">
										<AccountFormSkeleton />
									</div>
									<div className="py-8">
										<AccountFormSkeleton />
									</div>
								</>
							) : data?.me ? (
								<>
									<div className="dark:border-gray-600 py-8 border-b">
										<NameForm dataMe={data} />
									</div>
									<div className="dark:border-gray-600 py-8 border-b">
										<EmailForm dataMe={data} />
									</div>
									<div className="py-8">
										<PhoneForm dataMe={data} />
									</div>
								</>
							) : (
								<div className="flex items-center h-104 justify-center">
									<MessageWithLink
										message={<FormattedMessage id="account.signIn" />}
										buttonLabel={<FormattedMessage id="signIn" />}
										action={() => goToSignIn()}
									/>
								</div>
							)}
						</div>
					</Tabs>
				</div>
				<div className="md:hidden">
					{loading ? (
						<>
							<h1 className="title mx-6 mt-10 mb-5 uppercase">
								<FormattedMessage id="settings" />
							</h1>
							<div className="dark:bg-gray-900 h-64 bg-white flex justify-center items-center flex-col text-center px-6 mb-8">
								<BiLoaderAlt className="dark:text-gray-400 text-4xl animate-spin text-primary-500" />
							</div>
						</>
					) : data?.me ? (
						<>
							{currentKey && (
								<div className="dark:bg-gray-900 p-6 my-8 bg-white">
									<a
										onClick={handleReturn}
										className="inline-flex items-center btn hover:text-secondary-500 dark:hover:text-secondary-200 cursor-pointer mb-8"
									>
										<BiLeftArrowAlt />
										<span className="ml-2">
											<FormattedMessage id="return" />
										</span>
									</a>
									{currentKey === KEY.NAME && <NameForm dataMe={data} />}
									{currentKey === KEY.EMAIL && <EmailForm dataMe={data} />}
									{currentKey === KEY.PHONE && <PhoneForm dataMe={data} />}
								</div>
							)}
							{!currentKey && (
								<div className="mb-8">
									<h1 className="mx-6 mt-10 mb-5 uppercase font-medium">
										<FormattedMessage id="settings" />
									</h1>
									<div className="dark:border-gray-600 dark:bg-gray-900 bg-white border-l border-r border-b">
										<a
											onClick={() => handleMobileMenuClick(KEY.NAME)}
											className=" dark:border-gray-600 option  h-16 border-t "
										>
											<span className="ml-6">
												<FormattedMessage id="settings.account.name" />
											</span>
										</a>
										<a
											onClick={() => handleMobileMenuClick(KEY.EMAIL)}
											className=" dark:border-gray-600 option  h-16 border-t"
										>
											<span className="ml-6">
												<FormattedMessage id="settings.account.email" />
											</span>
										</a>
										<a
											onClick={() => handleMobileMenuClick(KEY.PHONE)}
											className=" dark:border-gray-600 option  h-16 border-t"
										>
											<span className="ml-6">
												<FormattedMessage id="settings.account.phone" />
											</span>
										</a>
										<a
											onClick={() => handleMobileMenuClick(KEY.PAYMENTS)}
											className=" dark:border-gray-600 option  h-16 border-t"
										>
											<span className="ml-6">
												<FormattedMessage id="settings.payments" />
											</span>
										</a>
										<a
											onClick={() => handleMobileMenuClick(KEY.ADDRESSES)}
											className=" dark:border-gray-600 option  h-16 border-t"
										>
											<span className="ml-6">
												<FormattedMessage id="settings.addresses" />
											</span>
										</a>
									</div>
								</div>
							)}
						</>
					) : (
						<>
							<h1 className="mx-6 mt-10 mb-5 uppercase font-medium">
								<FormattedMessage id="settings" />
							</h1>
							<div className="dark:bg-gray-900 bg-white mb-8 h-96 flex items-center justify-center">
								<MessageWithLink
									message={<FormattedMessage id="account.signIn" />}
									action={() => goToSignIn()}
									buttonLabel={<FormattedMessage id="signIn" />}
								/>
							</div>
						</>
					)}
				</div>
			</>
		</StoreLayout>
	);
};

export default AccountSettings;
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
