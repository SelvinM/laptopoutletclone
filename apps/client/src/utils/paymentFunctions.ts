import {
	CardBrand,
	CardType,
	Currency,
	Locale,
} from "@laptopoutlet-packages/types";
import {
	AuthorizationError,
	CybersourceProductCode,
	PaymentCard,
} from "../types";
import {
	cybersourceGetRequest,
	cybersourcePostRequest,
} from "@laptopoutlet-packages/utils";
import {
	cybersourceDeleteRequest,
	cybersourcePatchRequest,
} from "packages/utils/src/cybersourceRequests";
import { MESSAGES } from "../libs/i18n/i18n-server";

type BillingAddress = {
	firstName: string;
	lastName: string;
	address1: string;
	address2?: string | null;
	locality: string;
	administrativeArea: string;
	postalCode: string;
	country: string;
};

type CreatePaymentInstrumentInput = {
	instrumentIdentifier: { id: string };
	card: {
		expirationMonth: string;
		expirationYear: string;
		type: CardBrand;
	};
	billTo: BillingAddress;
};

type UpdatePaymentInstrumentInput = {
	card: {
		expirationMonth: string;
		expirationYear: string;
	};
	billTo: BillingAddress;
};

type Item = {
	productCode: CybersourceProductCode;
	productName: string;
	productSku: string;
	quantity: number;
	unitPrice: string;
};

type ProcessAuthorizationInput = {
	paymentInstrumentId: string;
	userId: string;
	email: string;
	items: Item[];
	fingerprintSessionId: string;
	ipAddress: string;
};

enum AuthorizationStatus {
	AUTHORIZED = "AUTHORIZED",
	AUTHORIZED_PENDING_REVIEW = "AUTHORIZED_PENDING_REVIEW",
	DECLINED = "DECLINED",
}

type ProcessAuthorizationResponse = {
	id: string;
	status: AuthorizationStatus;
	error?: AuthorizationError;
	totalAmount: string;
};

type ProcessAuthorization = (
	input: ProcessAuthorizationInput
) => Promise<ProcessAuthorizationResponse | undefined>;

type ProcessAuthorizationReversalInput = {
	userId: string;
	totalAmount: string;
	authorizationId: string;
	reason: string;
};

type ProcessAuthorizationReversal = (
	input: ProcessAuthorizationReversalInput
) => Promise<boolean | undefined>;

const formatToPaymentCard = (responseJSON: any) => {
	const cardNumber = responseJSON._embedded.instrumentIdentifier.card
		.number as string;
	const snippet = cardNumber.substr(cardNumber.length - 4);
	const paymentCard: PaymentCard = {
		id: responseJSON.id,
		brand: responseJSON.card.type,
		type: CardType.Credit,
		snippet,
		expiryMonth: responseJSON.card.expirationMonth,
		expiryYear: responseJSON.card.expirationYear,
		nameOnCard: `${responseJSON.billTo.firstName} ${responseJSON.billTo.lastName}`,
		billingAddress: {
			addressLine1: responseJSON.billTo.address1,
			addressLine2: responseJSON.billTo.address2,
			city: responseJSON.billTo.locality,
			country: responseJSON.billTo.country,
			province: responseJSON.billTo.administrativeArea,
			zipcode: responseJSON.billTo.postalCode,
		},
	};
	return paymentCard;
};

const prod = process.env.NODE_ENV === "production";

export const createInstrumentIdentifier = async (cardNumber: string) => {
	const response = await cybersourcePostRequest(
		JSON.stringify({
			card: {
				number: cardNumber,
			},
		}),
		"/tms/v1/instrumentidentifiers",
		{ useProfileID: prod }
	);
	const responseJSON = await response.json();
	if (!response.ok) {
		console.error(
			"createInstrumentIdentifier",
			JSON.stringify(responseJSON, null, 2)
		);
		return;
	}
	return responseJSON;
};

export const createPaymentInstrument = async (
	input: CreatePaymentInstrumentInput,
	locale: Locale
) => {
	const response: Response = await cybersourcePostRequest(
		JSON.stringify(input),
		"/tms/v1/paymentinstruments"
	);
	const responseJSON = await response.json();
	if (!response.ok) {
		console.error(
			"createPaymentInstrument",
			JSON.stringify(responseJSON, null, 2)
		);
		if (
			responseJSON?.errors?.[0]?.type === "invalidFields" &&
			responseJSON?.errors[0]?.details?.[0]?.location === "billTo"
		)
			return MESSAGES[locale]["paymentCards.billToError"];
		return;
	}
	const paymentCard = formatToPaymentCard(responseJSON);
	return paymentCard;
};

export const updatePaymentInstrument = async (
	id: string,
	input: UpdatePaymentInstrumentInput,
	locale: Locale
) => {
	const response: Response = await cybersourcePatchRequest(
		JSON.stringify(input),
		`/tms/v1/paymentinstruments/${id}`,
		{ useProfileID: prod }
	);
	const responseJSON = await response.json();
	if (!response.ok) {
		console.error(
			"updatePaymentInstrument",
			JSON.stringify(responseJSON, null, 2)
		);
		if (
			responseJSON?.errors?.[0]?.type === "invalidFields" &&
			responseJSON?.errors[0]?.details?.[0]?.location === "billTo"
		)
			return MESSAGES[locale]["paymentCards.billToError"];
		return;
	}
	const paymentCard = formatToPaymentCard(responseJSON);
	return paymentCard;
};

export const getPaymentInstrument = async (id: string) => {
	const response = await cybersourceGetRequest(
		`/tms/v1/paymentinstruments/${id}`,
		{ useProfileID: prod }
	);
	const responseJSON = await response.json();

	if (!response.ok) {
		console.error(
			"getPaymentInstrument",
			JSON.stringify(responseJSON, null, 2)
		);
		return;
	}
	const paymentCard = formatToPaymentCard(responseJSON);
	return {
		instrumentIdentifier: responseJSON._embedded.instrumentIdentifier.id,
		paymentCard,
	};
};
export const deletePaymentInstrument = async (id: string) => {
	const response = await cybersourceDeleteRequest(
		`/tms/v1/paymentinstruments/${id}`,
		{ useProfileID: prod }
	);
	if (response.status === 404 || response.status === 410) return true; //404 o 403 significa que el id ya fue borrado o que no existe, por lo que retornamos true
	if (!response.ok) {
		const responseJSON = await response.json();
		console.error(
			"deletePaymentInstrument",
			JSON.stringify(responseJSON, null, 2)
		);
		return;
	}
	return true;
};

export const processAuthorization: ProcessAuthorization = async ({
	paymentInstrumentId,
	items,
	userId,
	email,
	fingerprintSessionId,
	ipAddress,
}) => {
	const body = {
		clientReferenceInformation: {
			code: `${userId}-${Date.now()}`,
		},
		paymentInformation: {
			paymentInstrument: {
				id: paymentInstrumentId,
			},
		},
		orderInformation: {
			amountDetails: {
				currency: Currency.Hnl,
			},
			lineItems: items,
			billTo: {
				email,
			},
		},
		buyerInformation: {
			merchantCustomerId: userId,
			personalIdentification: { id: userId },
		},
		deviceInformation: { ipAddress, fingerprintSessionId },
		merchantDefinedInformation: [
			{ key: "1", value: "Web" },
			{ key: "2", value: process.env.NEXT_PUBLIC_CYBERSOURCE_MERCHANT_ID },
			{ key: "3", value: process.env.NEXT_PUBLIC_APP_NAME },
			{ key: "14", value: "No" },
		],
		acquirerInformation: {
			merchantId: process.env.NEXT_PUBLIC_CYBERSOURCE_MERCHANT_ID,
		},
	};
	const response = await cybersourcePostRequest(
		JSON.stringify(body),
		"/pts/v2/payments"
	);
	const responseJSON = await response.json();
	if (!response.ok) {
		console.log("processAuthorization body", JSON.stringify(body, null, 2));
		console.error(
			"processAuthorization",
			JSON.stringify(responseJSON, null, 2)
		);
		return;
	}
	return {
		id: responseJSON.id,
		status: responseJSON.status,
		error: responseJSON?.errorInformation?.reason,
		totalAmount: responseJSON.orderInformation.amountDetails.authorizedAmount,
	};
};

export const processAuthorizationReversal: ProcessAuthorizationReversal =
	async ({ authorizationId, totalAmount, userId, reason }) => {
		const body = {
			clientReferenceInformation: {
				code: `${userId}-${Date.now()}`,
			},
			reversalInformation: {
				amountDetails: {
					totalAmount,
					currency: Currency.Hnl,
				},
				reason,
			},
		};
		const response = await cybersourcePostRequest(
			JSON.stringify(body),
			`/pts/v2/payments/${authorizationId}/reversals`
		);
		const responseJSON = await response.json();
		if (!response.ok) {
			console.log(
				"processAuthorizationReversal body",
				JSON.stringify(JSON.stringify(body, null, 2), null, 2)
			);
			console.error(
				"processAuthorizationReversal",
				JSON.stringify(responseJSON, null, 2)
			);
			return;
		}
		if (responseJSON.status === "REVERSED") return true;
		return false;
	};
