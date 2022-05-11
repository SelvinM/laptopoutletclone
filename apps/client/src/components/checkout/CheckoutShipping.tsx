import { Transition } from "@headlessui/react";
import {
	MeQuery,
	useSelectUserAddressMutation,
} from "../../libs/graphql/operations/user.graphql";
import React, { useContext, useEffect, useState } from "react";
import { BiLoaderAlt, BiPlus } from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import AddressForm from "../addresses/AddressForm";
import { isCountryCode } from "@laptopoutlet-packages/utils";
import { translateCountry } from "@laptopoutlet-packages/utils";
import { MessageContext } from "../../contexts/MessageContextProvider";
import { CheckoutState } from "../../types";
import { scroller } from "react-scroll";
import { DEFAULT_SCROLL_DURATION } from "../../constants";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";

interface Props {
	dataMe?: MeQuery;
	scrollPositionId: string;
	checkoutState: CheckoutState;
	setCheckoutState: React.Dispatch<React.SetStateAction<CheckoutState>>;
}
type AddressStates = "selected" | "change" | "edit" | "add";

const CheckoutShipping = ({
	dataMe,
	scrollPositionId,
	checkoutState,
	setCheckoutState,
}: Props) => {
	const [selectUserAddress, { loading: loadingSelectAddress }] =
		useSelectUserAddressMutation();
	const selectedAddress = dataMe?.me?.addresses?.find(
		(userAddress) => userAddress?.id === dataMe.me?.shippingAddress
	);
	const { setMessage, setMessageType, setMessageVisible } =
		useContext(MessageContext);
	const [clickedAddress, setClickedAddress] = useState<string>();
	const [editAddressId, setEditAddressId] = useState<string>();
	const editAddress = dataMe?.me?.addresses?.find(
		(userAddress) => userAddress?.id === editAddressId
	);
	const scrollPosition = () => {
		if (checkoutState !== CheckoutState.PaymentFormOpen)
			scroller.scrollTo(scrollPositionId, {
				smooth: true,
				offset: -20,
				duration: DEFAULT_SCROLL_DURATION,
				isDynamic: true,
			});
	};

	const [addressState, setAddressState] = useState<AddressStates>(() => {
		if (selectedAddress) {
			return "selected";
		}
		return "change";
	});

	const switchAddressStateToEdit = (editAddressId: string | undefined) => {
		scrollPosition();
		setCheckoutState(CheckoutState.ShippingFormOpen);
		setAddressState("edit");
		setEditAddressId(editAddressId);
	};
	const switchAddressStateToAdd = () => {
		scrollPosition();
		setCheckoutState(CheckoutState.ShippingFormOpen);
		setAddressState("add");
	};
	const switchAddressStateToChange = () => {
		setCheckoutState(CheckoutState.BothClosed);
		setAddressState("change");
	};
	const switchAddressStateToSelected = () => {
		setCheckoutState(CheckoutState.BothClosed);
		setAddressState("selected");
	};
	const switchAddressStateToDefault = () => {
		setClickedAddress(undefined);
		if (selectedAddress) {
			switchAddressStateToSelected();
			return;
		}
		switchAddressStateToChange();
	};
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const onAddressChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (
			dataMe?.me?.addresses?.some(
				(userAddress) => userAddress?.id === event.target.value
			)
		) {
			setClickedAddress(event.target.value);
			const { data } = await selectUserAddress({
				variables: {
					addressID: event.target.value,
					locale: currentLocale,
				},
				optimisticResponse: {
					__typename: "Mutation",
					selectUserAddress: {
						...dataMe.me,
						shippingAddress: event.target.value,
					},
				},
			});
			if (data?.selectUserAddress.__typename === "GeneralError") {
				setMessage(data.selectUserAddress.message);
				setMessageType("error");
				setMessageVisible(true);
				return;
			}
			if (data?.selectUserAddress.__typename === "User") {
				switchAddressStateToDefault();
				return;
			}
		}
	};
	useEffect(() => {
		if (checkoutState === CheckoutState.PaymentFormOpen) {
			switchAddressStateToDefault();
		}
	}, [checkoutState]);
	return (
		<>
			<Transition
				show={
					!!(addressState === "edit" && editAddress) &&
					checkoutState !== CheckoutState.PaymentFormOpen
				}
				enter="transition-height ease-in duration-300"
				enterFrom="h-0"
				enterTo="h-124"
				leave="transition-height ease-out duration-300"
				leaveFrom="h-124"
				leaveTo="h-0"
				className="overflow-hidden"
			>
				<div className="p-4 sm:p-8">
					<AddressForm
						isEditForm={{ addressId: editAddress?.id || "" }}
						cancelAction={() => {
							scrollPosition();
							switchAddressStateToDefault();
						}}
						onSuccess={switchAddressStateToSelected}
						firstname={editAddress?.firstname}
						lastname={editAddress?.lastname}
						addressLine1={editAddress?.address.addressLine1}
						addressLine2={editAddress?.address.addressLine2}
						zipcode={editAddress?.address.zipcode}
						country={
							editAddress && isCountryCode(editAddress?.address.country)
								? editAddress?.address.country
								: undefined
						}
						city={editAddress?.address.city}
						province={editAddress?.address.province}
						phone={editAddress?.phone}
						selectAddress
					/>
				</div>
			</Transition>
			<Transition
				show={
					addressState === "add" &&
					checkoutState !== CheckoutState.PaymentFormOpen
				}
				enter="transition-height ease-in duration-300"
				enterFrom="h-0"
				enterTo="h-124"
				leave="transition-height ease-out duration-300"
				leaveFrom="h-124"
				leaveTo="h-0"
				className="overflow-hidden"
			>
				<div className="p-4 sm:p-8">
					<AddressForm
						cancelAction={() => {
							scrollPosition();
							switchAddressStateToDefault();
						}}
						onSuccess={switchAddressStateToSelected}
					/>
				</div>
			</Transition>
			<Transition
				show={!!(addressState === "selected" && selectedAddress)}
				enter="transition ease-in duration-200"
				enterFrom="transform opacity-0"
				enterTo="transform opacity-100"
			>
				<div className="flex flex-wrap p-4 sm:p-8">
					<div className="w-full xs:w-10/12">
						<span className="font-medium">{`${selectedAddress?.firstname} ${selectedAddress?.lastname}`}</span>
						<p className=" text-sm truncate-2-lines overflow-hidden ">
							{selectedAddress?.address.addressLine1}
						</p>
						<span className="text-sm  block truncate">
							{selectedAddress?.address.addressLine2}
						</span>
						<span className="text-sm mb-2 block truncate">{`${
							selectedAddress?.address.city
						}, ${selectedAddress?.address.province}, ${translateCountry({
							code: selectedAddress?.address.country,
							locale: currentLocale,
						})}`}</span>
						<span className="text-sm block truncate">
							{selectedAddress?.phone}
						</span>
					</div>
					<div className="w-full xs:w-2/12 text-right">
						<button
							className="btn text-sm link"
							onClick={switchAddressStateToChange}
						>
							<FormattedMessage id="change" />
						</button>
					</div>
				</div>
			</Transition>

			<Transition
				show={!!(addressState === "change")}
				enter="transition-opacity ease-in duration-300"
				enterFrom="opacity-0"
				enterTo="opacity-100"
			>
				<div className="p-4 sm:p-8">
					<div
						onChange={onAddressChange}
						className={
							dataMe?.me?.addresses && dataMe.me.addresses.length > 0
								? "mb-8"
								: undefined
						}
					>
						{dataMe?.me?.addresses?.map(
							(userAddress) =>
								userAddress && (
									<div key={userAddress.id} className="flex items-center mb-2">
										<label className="text-sm flex items-center leading-none cursor-pointer w-10/12 sm:w-11/12 pr-3">
											<div className="h-3 w-3 flex items-center">
												{loadingSelectAddress &&
												clickedAddress === userAddress.id ? (
													<BiLoaderAlt
														size={12}
														className="dark:text-gray-400 text-xs animate-spin text-primary-500"
													/>
												) : (
													<input
														value={userAddress.id}
														type="radio"
														disabled={
															userAddress.id === selectedAddress?.id ||
															loadingSelectAddress
														}
														name="addressid"
														className="appearance-none border checked:ring-inset checked:ring-2 checked:ring-gray-200 border-primary-500 rounded-full cursor-pointer bg-gray-100 h-3 w-3 focus:outline-none focus:ring focus:ring-primary-100 checked:bg-primary-500"
														defaultChecked={
															userAddress.id === selectedAddress?.id
														}
													/>
												)}
											</div>
											<div className="truncate text-2xs sm:text-sm">
												<span className="hidden sm:inline font-medium ml-2 ">
													{userAddress?.firstname + " " + userAddress?.lastname}
												</span>{" "}
												<span className="ml-2 sm:ml-0">
													{`${userAddress?.address.addressLine1}, ${
														userAddress?.address.addressLine2
															? `${userAddress?.address.addressLine2},`
															: ""
													} ${userAddress?.address.city}, ${
														userAddress?.address.province
													}, ${translateCountry({
														code: userAddress?.address.country,
														locale: currentLocale,
													})}`}
												</span>
											</div>
										</label>
										<div className="text-right w-2/12 sm:w-1/12 truncate">
											<button
												className="btn link text-xs sm:text-sm"
												onClick={() => switchAddressStateToEdit(userAddress.id)}
												type="button"
											>
												<span className="ml-1">
													<FormattedMessage id="edit" />
												</span>
											</button>
										</div>
									</div>
								)
						)}
					</div>
					<div className="text-right lg:text-left">
						<button className="link btn" onClick={switchAddressStateToAdd}>
							<BiPlus className="sm:text-lg" />
							<span className="ml-1 text-sm sm:text-base">
								<FormattedMessage id="settings.addresses.addNewAddress" />
							</span>
						</button>
					</div>
				</div>
			</Transition>
		</>
	);
};

export default CheckoutShipping;
