import { Currency } from "@laptopoutlet-packages/types";
import {
	cybersourceGetRequest,
	cybersourcePostRequest,
} from "@laptopoutlet-packages/utils";

type ProcessCaptureInput = {
	totalAmount: string;
	authorizationId: string;
};

type ProcessCapture = (
	input: ProcessCaptureInput
) => Promise<boolean | undefined>;

export const processCapture: ProcessCapture = async ({
	totalAmount,
	authorizationId,
}) => {
	const resp = await cybersourcePostRequest(
		JSON.stringify({
			orderInformation: {
				amountDetails: {
					totalAmount,
					currency: Currency.Hnl,
				},
			},
		}),
		`/pts/v2/payments/${authorizationId}/captures`
	);
	if (!resp.ok) {
		console.log(
			`body`,
			JSON.stringify(
				{
					orderInformation: {
						amountDetails: {
							totalAmount,
							currency: Currency.Hnl,
						},
					},
				},
				null,
				2
			)
		);
		console.log(
			`processCapture error`,
			JSON.stringify(await resp.json(), null, 2)
		);
		return;
	}
	const respJSON = await resp.json();
	if (respJSON.orderInformation.amountDetails.totalAmount) return true;
	return false;
};

type ProcessAuthorizationReversalInput = {
	userId: string;
	totalAmount: string;
	authorizationId: string;
	reason: string;
};

type ProcessAuthorizationReversal = (
	input: ProcessAuthorizationReversalInput
) => Promise<boolean | undefined>;

export const processAuthorizationReversal: ProcessAuthorizationReversal =
	async ({ authorizationId, totalAmount, userId, reason }) => {
		let body = {
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
		const resp = await cybersourcePostRequest(
			JSON.stringify(body),
			`/pts/v2/payments/${authorizationId}/reversals`
		);
		const respJSON = await resp.json();
		if (respJSON.status === "INVALID_REQUEST") {
			//si la cantidad cobrada excede la autorizada la conseguimos de la api de cybersouce
			console.log(`true`, true);
			const transactionResp = await cybersourceGetRequest(
				`/tss/v2/transactions/${authorizationId}`
			);
			const transaction = await transactionResp.json();
			body.reversalInformation.amountDetails.totalAmount =
				transaction.orderInformation.amountDetails.authorizedAmount;
			const newResp = await cybersourcePostRequest(
				JSON.stringify(body),
				`/pts/v2/payments/${authorizationId}/reversals`
			);
			const newRespJSON = await newResp.json();
			if (!newResp.ok) {
				console.log(`body`, JSON.stringify(body, null, 2));
				console.log(
					`processAuthorizationReversal error`,
					JSON.stringify(newRespJSON, null, 2)
				);
				return;
			}
			if (newRespJSON.status === "REVERSED") return true;
			return false;
		}
		if (!resp.ok) {
			console.log(`body`, JSON.stringify(body, null, 2));
			console.log(
				`processAuthorizationReversal error`,
				JSON.stringify(respJSON, null, 2)
			);
			return;
		}
		if (respJSON.status === "REVERSED") return true;
		return false;
	};

type RefundCaptureInput = {
	amount: number;
	captureId: string;
};

export const refundCapture = async ({
	amount,
	captureId,
}: RefundCaptureInput) => {
	const resp = await cybersourcePostRequest(
		JSON.stringify({
			orderInformation: {
				amountDetails: {
					amount,
					currency: Currency.Hnl,
				},
			},
		}),
		`/pts/v2/payments/${captureId}/captures`
	);
	if (!resp.ok) {
		console.log(
			`processCapture error`,
			JSON.stringify(await resp.json(), null, 2)
		);
		return;
	}
	const respJSON = await resp.json();
	if (respJSON.orderInformation.amountDetails.totalAmount) return true;
	return false;
};
