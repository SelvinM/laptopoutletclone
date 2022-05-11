import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import { GetStaticProps, NextPage } from "next";
import React, { useState } from "react";
import StoreLayout from "../../components/layouts/StoreLayout";
import Head from "../../components/common/Head";
import { FormattedMessage, useIntl } from "react-intl";
import { BiLeftArrowAlt, BiPlus } from "react-icons/bi";
import Link from "next/link";
import AddressForm from "../../components/addresses/AddressForm";
import { Transition } from "@headlessui/react";
import { scroller } from "react-scroll";
import AddressSummary from "../../components/addresses/AddressSummary";
import AddressSummarySkeleton from "../../components/skeletons/AddressSummarySkeleton";
import goToSignIn from "../../utils/goToSignIn";
import { useMeQuery } from "../../libs/graphql/operations/user.graphql";
import { isCountryCode } from "@laptopoutlet-packages/utils";
import { translateCountry } from "@laptopoutlet-packages/utils";
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
import { DEFAULT_SCROLL_DURATION } from "../../constants";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import Tabs from "../../components/common/Tabs";
import MessageWithLink from "../../components/common/MessageWithAction";
import DeleteAddressModal from "../../components/addresses/DeleteAddressModal";

interface Props {}

const Addresses: NextPage<Props> = ({}) => {
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { formatMessage } = useIntl();
	const { data, loading, error } = useMeQuery();
	error && console.error("meQuery error", error);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showEditForm, setShowEditForm] = useState<string>();
	const [showDeleteModal, setShowDeleteModal] = useState<string>();
	const scrollPosition = (elementId?: string) => {
		if (!showCreateForm && !showEditForm)
			scroller.scrollTo(elementId || "addresses-reference-point", {
				smooth: true,
				offset: -80,
				duration: 300,
				isDynamic: true,
			});
	};
	const shippingAddress = data?.me?.addresses?.find(
		(address) => address?.id === data.me?.shippingAddress
	);
	const shippingAddressForDelete = data?.me?.addresses?.find(
		(address) => address?.id === showDeleteModal
	);
	const cancelAction = () => {
		scroller.scrollTo("addresses-reference-point", {
			smooth: true,
			offset: -100,
			duration: DEFAULT_SCROLL_DURATION,
			isDynamic: true,
		});
		setShowEditForm(undefined);
		setShowCreateForm(false);
	};
	const openEditForm = (id: string) => {
		scrollPosition(`edit-${id}`);
		setShowCreateForm(false);
		setShowEditForm(id);
	};
	const openCreateForm = () => {
		scrollPosition("create-form");
		setShowEditForm(undefined);
		setShowCreateForm(true);
	};
	const closeModal = () => {
		setShowDeleteModal(undefined);
	};
	const content = (
		<div className="max-w-2xl mx-auto">
			{loading ? (
				<div className="dark:border-gray-600 border rounded-md">
					<h3 className="m-4 text-lg sm:m-8 sm:text-xl title">
						<FormattedMessage id="settings.addresses.title" />
					</h3>
					<div className="dark:border-gray-600 p-4 sm:p-8 border-t">
						<AddressSummarySkeleton />
					</div>
				</div>
			) : data?.me ? (
				<div className="dark:border-gray-600 border rounded-md">
					<h3 className="m-4 text-lg sm:m-8 sm:text-xl title">
						<FormattedMessage id="settings.addresses.title" />
					</h3>
					{data?.me?.addresses?.map((userAddress) => {
						if (userAddress) {
							return (
								<div key={userAddress.id} id={`edit-${userAddress.id}`}>
									<Transition
										show={showEditForm === userAddress.id}
										enter="transition-height ease-in duration-300"
										enterFrom="h-0"
										enterTo="h-124"
										leave="transition-height ease-out duration-300"
										leaveFrom="h-124"
										leaveTo="h-0"
										className="overflow-hidden"
									>
										<div className="dark:border-gray-600 p-4 sm:p-8 border-t">
											<AddressForm
												cancelAction={cancelAction}
												isEditForm={{ addressId: userAddress.id }}
												firstname={userAddress.firstname}
												lastname={userAddress.lastname}
												addressLine1={userAddress.address.addressLine1}
												addressLine2={userAddress.address.addressLine2}
												zipcode={userAddress.address.zipcode}
												country={
													isCountryCode(userAddress.address.country)
														? userAddress.address.country
														: undefined
												}
												city={userAddress.address.city}
												addressFormLabel={formatMessage({ id: "save" })}
												province={userAddress.address.province}
												phone={userAddress.phone}
												selectAddress
											/>
										</div>
									</Transition>
									{showEditForm !== userAddress.id && (
										<div className="dark:border-gray-600 p-4 sm:p-8 border-t">
											<AddressSummary
												id={userAddress.id}
												firstname={userAddress.firstname}
												lastname={userAddress.lastname}
												addressLine1={userAddress.address.addressLine1}
												addressLine2={userAddress.address.addressLine2}
												country={
													translateCountry({
														code: userAddress.address.country,
														locale: currentLocale,
													}) || userAddress.address.country
												}
												province={userAddress.address.province}
												city={userAddress.address.city}
												phone={userAddress.phone}
												selected={shippingAddress?.id === userAddress.id}
												zipcode={userAddress.address.zipcode}
												editAction={() => {
													openEditForm(userAddress.id);
												}}
												removeAction={() => setShowDeleteModal(userAddress.id)}
											/>
										</div>
									)}
								</div>
							);
						}
					})}
					<div id="create-form">
						<Transition
							show={showCreateForm}
							enter="transition-height ease-in duration-300"
							enterFrom="h-0"
							enterTo="h-124"
							leave="transition-height ease-out duration-300"
							leaveFrom="h-124"
							leaveTo="h-0"
							className="overflow-hidden"
						>
							<div className="dark:border-gray-600 p-4 sm:p-8 border-t">
								<AddressForm
									cancelAction={cancelAction}
									addressFormLabel={formatMessage({ id: "save" })}
								/>
							</div>
						</Transition>
						{!showCreateForm && (
							<div className="dark:border-gray-600 p-4 sm:p-8 border-t text-right md:text-left">
								<button
									className="link btn text-base "
									onClick={openCreateForm}
								>
									<BiPlus className="text-lg" />
									<span className="ml-2 ">
										<FormattedMessage id="settings.addresses.addNewAddress" />
									</span>
								</button>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className=" flex items-center justify-center h-96">
					<MessageWithLink
						message={<FormattedMessage id="addresses.signIn" />}
						action={() => goToSignIn()}
						buttonLabel={<FormattedMessage id="signIn" />}
					/>
				</div>
			)}
		</div>
	);
	return (
		<StoreLayout>
			<>
				<Head
					title={formatMessage(
						{ id: "title.settings.addresses" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div id="addresses-reference-point" />
				<DeleteAddressModal
					closeAction={closeModal}
					addressLine1={shippingAddressForDelete?.address.addressLine1}
					addressLine2={shippingAddressForDelete?.address.addressLine2}
					city={shippingAddressForDelete?.address.city}
					country={shippingAddressForDelete?.address.country}
					province={shippingAddressForDelete?.address.province}
					zipcode={shippingAddressForDelete?.address.zipcode}
					firstname={shippingAddressForDelete?.firstname}
					lastname={shippingAddressForDelete?.lastname}
					id={shippingAddressForDelete?.id}
					phone={shippingAddressForDelete?.phone}
					visible={!!showDeleteModal}
				/>
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
						<div className="p-8 min-h-104">{content}</div>
					</Tabs>
				</div>
				<div className="md:hidden">
					<div className="dark:bg-gray-900 p-4 my-8 bg-white">
						<Link href="/settings/account">
							<a className="inline-flex items-center btn hover:text-secondary-500 dark:hover:text-secondary-200 cursor-pointer mb-8">
								<BiLeftArrowAlt />
								<span className="ml-2">
									<FormattedMessage id="return" />
								</span>
							</a>
						</Link>
						{content}
					</div>
				</div>
			</>
		</StoreLayout>
	);
};

export default Addresses;

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
