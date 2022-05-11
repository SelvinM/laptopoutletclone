import crypto from "crypto";
const prod = process.env.NODE_ENV === "production";
const requestHost =
	(prod ? process.env.CYBERSOURCE_HOST_PROD : process.env.CYBERSOURCE_HOST) ||
	"apitest.cybersource.com";
const merchantId =
	process.env.NEXT_PUBLIC_CYBERSOURCE_MERCHANT_ID || "testrest";
const merchantKeyId =
	(prod
		? process.env.CYBERSOURCE_ACCESS_KEY_PROD
		: process.env.CYBERSOURCE_ACCESS_KEY) ||
	"08c94330-f618-42a3-b09d-e1e43be5efda";

const merchantSecretKey =
	(prod
		? process.env.CYBERSOURCE_SECRET_KEY_PROD
		: process.env.CYBERSOURCE_SECRET_KEY) ||
	"yBJxy6LjM2TmcPGu+GaJrHtkke25fPpUX+UY6/L/1tE=";

const profileid = process.env.CYBERSOURCE_PROFILE_ID;

type Options = { useProfileID?: boolean };

const generateDigest = (payload: string) => {
	let buffer = Buffer.from(payload, "utf8");
	const hash = crypto.createHash("sha256");
	hash.update(buffer);
	let digest = hash.digest("base64");
	return digest;
};
const getHTTPSignature = (
	resource: string,
	method: string,
	payload?: string
) => {
	let signatureHeader = "";
	let signatureValue = "";
	// KeyId is the key obtained from EBC
	signatureHeader += 'keyid="' + merchantKeyId + '"';
	// Algorithm should be always HmacSHA256 for http signature
	signatureHeader += ', algorithm="HmacSHA256"';
	// Headers - list is choosen based on HTTP method.
	// Digest is not required for GET Method
	if (method === "get" || method === "delete") {
		let headersForGetMethod = "host date (request-target) v-c-merchant-id";
		signatureHeader += ', headers="' + headersForGetMethod + '"';
	} else if (method === "post" || method === "patch") {
		let headersForPostMethod =
			"host date (request-target) digest v-c-merchant-id";
		signatureHeader += ', headers="' + headersForPostMethod + '"';
	}
	let signatureString = "host: " + requestHost;
	signatureString += "\ndate: " + new Date(Date.now()).toUTCString();
	signatureString += "\n(request-target): ";
	if (method === "get" || method === "delete") {
		let targetUrlForGet = `${method} ${resource}`;
		signatureString += targetUrlForGet + "\n";
	} else if (method === "post" || method === "patch") {
		// Digest for POST call
		let digest = generateDigest(payload || "");
		let targetUrlForPost = `${method} ${resource}`;
		signatureString += targetUrlForPost + "\n";
		signatureString += "digest: SHA-256=" + digest + "\n";
	}
	signatureString += "v-c-merchant-id: " + merchantId;
	let data = Buffer.from(signatureString, "utf8");
	// Decoding secret key
	let key = Buffer.from(merchantSecretKey, "base64");
	signatureValue = crypto
		.createHmac("sha256", key)
		.update(data)
		.digest("base64");
	signatureHeader += ', signature="' + signatureValue + '"';
	return signatureHeader;
};
export const cybersourcePostRequest = async (
	payload: string,
	resource: string,
	options?: Options
) => {
	const digest = `SHA-256=${generateDigest(payload)}`;
	const date = new Date(Date.now()).toUTCString();
	const method = "post";
	const signature = getHTTPSignature(resource, method, payload);
	let headerParams: any = {};
	headerParams["digest"] = digest;
	headerParams["v-c-merchant-id"] = merchantId;
	headerParams["Date"] = date;
	headerParams["host"] = requestHost;
	headerParams["signature"] = signature;
	headerParams["User-Agent"] = "Mozilla/5.0";
	headerParams["Content-Type"] = "application/json;charset=utf-8";
	if (options?.useProfileID) headerParams["profile-id"] = profileid;
	const response = await fetch(`https://${requestHost}${resource}`, {
		headers: headerParams,
		body: payload,
		method,
	});
	return response;
};
export const cybersourcePatchRequest = async (
	payload: string,
	resource: string,
	options?: Options
) => {
	const digest = `SHA-256=${generateDigest(payload)}`;
	const date = new Date(Date.now()).toUTCString();
	const method = "patch";
	const signature = getHTTPSignature(resource, method, payload);
	let headerParams: any = {};
	headerParams["digest"] = digest;
	headerParams["v-c-merchant-id"] = merchantId;
	headerParams["Date"] = date;
	headerParams["host"] = requestHost;
	headerParams["signature"] = signature;
	headerParams["User-Agent"] = "Mozilla/5.0";
	headerParams["Content-Type"] = "application/json;charset=utf-8";
	if (options?.useProfileID) headerParams["profile-id"] = profileid;
	const response = await fetch(`https://${requestHost}${resource}`, {
		headers: headerParams,
		body: payload,
		method,
	});
	return response;
};

export const cybersourceGetRequest = async (
	resource: string,
	options?: Options
) => {
	const date = new Date(Date.now()).toUTCString();
	const method = "get";
	const signature = getHTTPSignature(resource, method);
	let headerParams: any = {};
	headerParams["v-c-merchant-id"] = merchantId;
	headerParams["Date"] = date;
	headerParams["host"] = requestHost;
	headerParams["signature"] = signature;
	headerParams["User-Agent"] = "Mozilla/5.0";
	headerParams["Content-Type"] = "application/json;charset=utf-8";
	if (options?.useProfileID) headerParams["profile-id"] = profileid;
	const response = await fetch(`https://${requestHost}${resource}`, {
		headers: headerParams,
		method,
	});
	return response;
};
export const cybersourceDeleteRequest = async (
	resource: string,
	options?: Options
) => {
	const date = new Date(Date.now()).toUTCString();
	const method = "delete";
	const signature = getHTTPSignature(resource, method);
	let headerParams: any = {};
	headerParams["v-c-merchant-id"] = merchantId;
	headerParams["Date"] = date;
	headerParams["host"] = requestHost;
	headerParams["signature"] = signature;
	headerParams["User-Agent"] = "Mozilla/5.0";
	headerParams["Content-Type"] = "application/json;charset=utf-8";
	if (options?.useProfileID) headerParams["profile-id"] = profileid;
	const response = await fetch(`https://${requestHost}${resource}`, {
		headers: headerParams,
		method,
	});
	return response;
};
