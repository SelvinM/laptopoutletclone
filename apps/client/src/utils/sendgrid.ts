import sgMail from "@sendgrid/mail";
import { Currency, Locale } from "@laptopoutlet-packages/types";
import getMessage from "./getMessage";
import { MESSAGES } from "../libs/i18n/i18n-server";
import { translateCountry } from "@laptopoutlet-packages/utils";
import { getDateFormatter } from "@laptopoutlet-packages/utils";
import { OrderItem } from "@laptopoutlet-packages/models";
import { SendVerificationRequest } from "next-auth/providers";

interface SendEmailParams {
	recipient: string;
	locale: Locale;
}

interface SendEmailWithCode extends SendEmailParams {
	code: string;
	name: string;
}

interface SendOrderInvoice extends SendEmailParams {
	currency: Currency;
	orderid: string;
	dateAndTime: Date;
	shippingName: string;
	addressLine1: string;
	addressLine2?: string;
	country: string;
	province: string;
	city: string;
	zipcode: string;
	orderItems: OrderItem[];
	itemsTotal: number;
	shippingTotal: number;
	orderTotal: number;
}

const hostUrl =
	process.env.NODE_ENV === "development"
		? "https://laptopoutlet.hn"
		: process.env.NEXT_PUBLIC_URL;

const sender = {
	email: process.env.SENDGRID_SENDER_EMAIL || "",
	name: process.env.NEXT_PUBLIC_APP_NAME,
};

export const sendEmailVerificationCode = async ({
	recipient,
	locale,
	code,
	name,
}: SendEmailWithCode) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
	const msg = {
		to: recipient,
		from: sender,
		subject: getMessage(MESSAGES[locale]["email.emailChangeCode.subject"]),
		dynamicTemplateData: {
			// logoUrl: `${hostUrl}/_next/image?url=%2Fstatic%2Flogo.png&w=256&q=75`,
			greeting: getMessage(MESSAGES[locale]["email.emailChangeCode.greeting"], {
				name,
			}),
			message: getMessage(MESSAGES[locale]["email.emailChangeCode.message"]),
			subject: getMessage(MESSAGES[locale]["email.emailChangeCode.subject"]),
			code,
			copyrightMessage: getMessage(MESSAGES[locale]["email.copyrightMessage"], {
				appname: process.env.NEXT_PUBLIC_APP_NAME || "",
			}),
		},
		templateId: "d-6b90b6addccd46aeb1325b0d9f2d0a25",
	};
	try {
		await sgMail.send(msg);
	} catch (error) {
		console.error("sendEmailVerificationCode", error);
	}
};

export const sendOrderInvoiceEmail = async ({
	locale,
	recipient,
	addressLine1,
	city,
	country,
	dateAndTime,
	itemsTotal,
	orderid,
	orderItems,
	orderTotal,
	province,
	shippingName,
	shippingTotal,
	zipcode,
	addressLine2,
	currency,
}: SendOrderInvoice) => {
	const priceFormatter = new Intl.NumberFormat(`${locale}-HN`, {
		style: "currency",
		currency,
	});
	sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
	const dateFormatter = getDateFormatter({ locale });
	const msg = {
		to: recipient,
		from: sender,
		subject: getMessage(MESSAGES[locale]["email.orderInvoice.subject"]),
		dynamicTemplateData: {
			logoUrl: `${hostUrl}/_next/image?url=%2Fstatic%2Flogo.png&w=256&q=75`,
			subject: getMessage(MESSAGES[locale]["email.orderInvoice.subject"]),
			mainTitle: getMessage(MESSAGES[locale]["email.orderInvoice.mainTitle"]),
			message: getMessage(MESSAGES[locale]["email.orderInvoice.message"]),
			link: hostUrl,
			orderLabel: getMessage(MESSAGES[locale]["email.orderInvoice.order"]),
			orderNumber: `#${orderid}`,
			dateLabel: getMessage(MESSAGES[locale]["email.orderInvoice.date"]),
			dateAndTime: dateFormatter.format(dateAndTime),
			orderUrl: `${process.env.NEXT_PUBLIC_URL}/orders/${orderid}`,
			viewOrder: getMessage(MESSAGES[locale]["email.orderInvoice.viewOrder"]),
			shippingAddress: getMessage(
				MESSAGES[locale]["email.orderInvoice.shippingAddress"]
			),
			address: `${shippingName}, ${addressLine1}, ${
				addressLine2 ? `${addressLine2}, ` : ""
			}${city}, ${province}, ${
				translateCountry({
					code: country,
					locale,
				}) || country
			}, ${zipcode}`,
			item: getMessage(MESSAGES[locale]["email.orderInvoice.item"]),
			quantity: getMessage(MESSAGES[locale]["email.orderInvoice.quantity"]),
			items: orderItems.map((item) => ({
				title: item.title,
				condition: getMessage(
					MESSAGES[locale][`condition.${item.condition}` as "condition.used"]
				),
				quantity: item.invoice.totalQuantity,
			})),
			subtotal: getMessage(MESSAGES[locale]["email.orderInvoice.subtotal"]),
			subtotalAmmount: priceFormatter.format(itemsTotal),
			shipping: getMessage(MESSAGES[locale]["email.orderInvoice.shipping"]),
			shippingAmmount: priceFormatter.format(shippingTotal),
			total: getMessage(MESSAGES[locale]["email.orderInvoice.total"]),
			totalAmmount: priceFormatter.format(orderTotal),
			footerLinksMessage: getMessage(MESSAGES[locale]["email.linksMessage"]),
			footerCopyrightMessage: getMessage(
				MESSAGES[locale]["email.copyrightMessage"],
				{ appname: process.env.NEXT_PUBLIC_APP_NAME }
			),
		},
		templateId: "d-d2324fdab5fe4e29be9b72c9ebf58ef5",
	};
	try {
		await sgMail.send(msg);
	} catch (error) {
		console.error("sendOrderInvoiceEmail", error);
	}
};

export const sendVerificationRequest: SendVerificationRequest = async ({
	identifier,
	url,
}) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
	const msg = {
		to: identifier,
		from: sender,
		subject: getMessage(MESSAGES["es"]["email.emailLogin.subject"]),
		dynamicTemplateData: {
			greeting: getMessage(MESSAGES["es"]["email.emailLogin.greeting"], {
				appname: process.env.NEXT_PUBLIC_APP_NAME,
			}),
			message: getMessage(MESSAGES["es"]["email.emailLogin.message"]),
			subject: getMessage(MESSAGES["es"]["email.emailLogin.subject"]),
			login: getMessage(MESSAGES["es"]["email.emailLogin.login"]),
			message2: getMessage(MESSAGES["es"]["email.emailLogin.message2"], {
				appname: process.env.NEXT_PUBLIC_APP_NAME,
			}),
			loginUrl: url,
			copyrightMessage: getMessage(MESSAGES["es"]["email.copyrightMessage"], {
				appname: process.env.NEXT_PUBLIC_APP_NAME || "",
			}),
		},
		templateId: "d-3cd84f97477b4b5593b85ff9271857d1",
	};
	try {
		await sgMail.send(msg);
	} catch (error) {
		console.error("sendVerificationRequest", error);
	}
};
