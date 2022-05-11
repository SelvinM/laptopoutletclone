import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/400-italic.css";
import { GetStaticProps, NextPage } from "next";
import React, { useState } from "react";
import StoreLayout from "../../components/layouts/StoreLayout";
import Head from "../../components/common/Head";
import { FormattedMessage, useIntl } from "react-intl";
import { BiLeftArrowAlt, BiPlus } from "react-icons/bi";
import Link from "next/link";
import { Transition } from "@headlessui/react";
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
import AddPaymentCardForm from "../../components/payments/AddPaymentCardForm";
import { scroller } from "react-scroll";
import { DEFAULT_SCROLL_DURATION } from "../../constants";
import getCurrentLocale from "../../utils/getCurrentLocale";
import Tabs from "../../components/common/Tabs";
import MessageWithLink from "../../components/common/MessageWithAction";
import PaymentSummary from "../../components/payments/PaymentSummary";
import PaymentSummarySkeleton from "../../components/skeletons/PaymentSummarySkeleton";
import EditPaymentCardForm from "../../components/payments/EditPaymentCardForm";
import { useGetPaymentCardsQuery } from "../../libs/graphql/operations/paymentCard.graphql";
import { UserAddress } from "@laptopoutlet-packages/models";
import DeletePaymentCardModal from "../../components/payments/DeletePaymentCardModal";

interface Props {}

const PaymentMethods: NextPage<Props> = ({}) => {
	const { formatMessage } = useIntl();
	const { data, loading, error } = useMeQuery();
	const {
		data: dataPaymentCards,
		error: errorPaymentCards,
		loading: loadingPaymentCards,
	} = useGetPaymentCardsQuery();
	error && console.error("meQuery error", error);
	errorPaymentCards &&
		console.error("getPaymentCards error", errorPaymentCards);
	const shippingAddress = data?.me?.addresses?.find(
		(address) => address?.id === data.me?.shippingAddress
	);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showEditForm, setShowEditForm] = useState<string>();
	const scrollPosition = (elementId?: string) => {
		if (!showCreateForm && !showEditForm)
			scroller.scrollTo(elementId || "payments-reference-point", {
				smooth: true,
				offset: -100,
				duration: DEFAULT_SCROLL_DURATION,
				isDynamic: true,
			});
	};
	const cancelAction = () => {
		scroller.scrollTo("payments-reference-point", {
			smooth: true,
			offset: -100,
			duration: DEFAULT_SCROLL_DURATION,
			isDynamic: true,
		});
		setShowEditForm(undefined);
		setShowCreateForm(false);
	};

	const openEditForm = (id: string) => {
		scrollPosition(`payments-edit-${id}`);
		setShowCreateForm(false);
		setShowEditForm(id);
	};
	const openCreateForm = () => {
		scrollPosition("payments-create-form");
		setShowEditForm(undefined);
		setShowCreateForm(true);
	};
	const [showDeleteModal, setShowDeleteModal] = useState<string>();
	const closeModal = () => {
		setShowDeleteModal(undefined);
	};
	const paymentCardForDelete =
		dataPaymentCards?.getPaymentCards?.paymentCards.find(
			(paymentCard) => paymentCard?.id && paymentCard.id === showDeleteModal
		);
	const content = (
		<div className="max-w-2xl mx-auto">
			{loading || loadingPaymentCards ? (
				<div className="dark:border-gray-600 border rounded-md">
					<h3 className="m-4 text-lg sm:m-8 sm:text-xl font-medium">
						<FormattedMessage id="settings.payments.title" />
					</h3>
					<div className="p-4 sm:p-8 border-t">
						<PaymentSummarySkeleton />
					</div>
				</div>
			) : data?.me && dataPaymentCards?.getPaymentCards?.paymentCards ? (
				<div className="dark:border-gray-600 border rounded-md">
					<h3 className="m-4 text-lg sm:m-8 sm:text-xl title">
						<FormattedMessage id="settings.payments.title" />
					</h3>
					{dataPaymentCards?.getPaymentCards?.paymentCards.map(
						(paymentCard) => {
							if (paymentCard) {
								return (
									<div
										key={paymentCard.id}
										id={`payments-edit-${paymentCard.id}`}
									>
										<Transition
											show={showEditForm === paymentCard.id}
											enter="transition-height ease-in duration-300"
											enterFrom="h-0"
											enterTo="h-124"
											leave="transition-height ease-out duration-300"
											leaveFrom="h-124"
											leaveTo="h-0"
											className="overflow-hidden"
										>
											<div className="dark:border-gray-600 p-4 sm:p-8 border-t">
												<EditPaymentCardForm
													snippet={paymentCard.snippet}
													brand={paymentCard.brand}
													id={paymentCard.id}
													cancelAction={cancelAction}
													addressLine1={paymentCard.billingAddress.addressLine1}
													addressLine2={paymentCard.billingAddress.addressLine2}
													city={paymentCard.billingAddress.city}
													expiryMonth={paymentCard.expiryMonth}
													expiryYear={paymentCard.expiryYear}
													nameOnCard={paymentCard.nameOnCard}
													province={paymentCard.billingAddress.province}
													zipcode={paymentCard.billingAddress.zipcode}
													country={paymentCard.billingAddress.country}
												/>
											</div>
										</Transition>
										{showEditForm !== paymentCard.id && (
											<div className="dark:border-gray-600 p-4 sm:p-8 border-t">
												<PaymentSummary
													expiryMonth={paymentCard.expiryMonth}
													expiryYear={paymentCard.expiryYear}
													nameOnCard={paymentCard.nameOnCard}
													snippet={paymentCard.snippet}
													brand={paymentCard.brand}
													editAction={() => {
														openEditForm(paymentCard.id);
													}}
													removeAction={() => {
														setShowDeleteModal(paymentCard.id);
													}}
												/>
											</div>
										)}
									</div>
								);
							}
						}
					)}
					<div id="payments-create-form">
						<Transition
							show={showCreateForm}
							enter="transition-height ease-in duration-300"
							enterFrom="h-20"
							enterTo={shippingAddress ? "h-124" : "h-152"}
							leave="transition-height ease-out duration-300"
							leaveFrom={shippingAddress ? "h-124" : "h-152"}
							leaveTo="h-0"
							className="overflow-hidden"
						>
							<div className="dark:border-gray-600 p-4 sm:p-8 border-t">
								<AddPaymentCardForm
									shippingAddress={shippingAddress as UserAddress}
									cancelAction={cancelAction}
									makeDefault={false}
								/>
							</div>
						</Transition>
						{!showCreateForm && (
							<div className="dark:border-gray-600 p-4 sm:p-8 border-t text-right lg:text-left">
								<button
									className="link btn text-base "
									onClick={openCreateForm}
								>
									<BiPlus className="text-lg" />
									<span className="ml-2">
										<FormattedMessage id="settings.payments.addNewPaymentCard" />
									</span>
								</button>{" "}
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="dark:bg-gray-900 bg-white h-96 flex items-center justify-center">
					<MessageWithLink
						message={<FormattedMessage id="payments.signIn" />}
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
						{ id: "title.settings.payments" },
						{ appname: process.env.NEXT_PUBLIC_APP_NAME }
					)}
				>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div id="payments-reference-point" />

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
				<DeletePaymentCardModal
					brand={paymentCardForDelete?.brand}
					snippet={paymentCardForDelete?.snippet}
					closeAction={closeModal}
					id={paymentCardForDelete?.id}
					visible={!!paymentCardForDelete?.id}
				/>
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

export default PaymentMethods;

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
