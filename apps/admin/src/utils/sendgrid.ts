import { OrderItemFullTranslations } from "@laptopoutlet-packages/models";
import { Currency, Locale } from "@laptopoutlet-packages/types";
import {
	getDateFormatter,
	translateCountry,
} from "@laptopoutlet-packages/utils";
import sgMail from "@sendgrid/mail";
import { translateProductCondition } from "./translations";

interface SendEmailParams {
	recipient: string;
	locale: Locale;
}

interface SendShipmentConfirmationEmail extends SendEmailParams {
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
	orderItems: OrderItemFullTranslations[];
	itemsTotal: number;
	shippingTotal: number;
	orderTotal: number;
	packageid: string;
}
const clientUrl = "https://laptopoutlet.hn";
const clientAppName = "Laptop Outlet";
export const sendShipmentConfirmationEmail = async ({
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
}: SendShipmentConfirmationEmail) => {
	const priceFormatter = new Intl.NumberFormat(`${locale}-HN`, {
		style: "currency",
		currency,
	});
	sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
	const dateFormatter = getDateFormatter({ locale });
	const msg = {
		to: recipient,
		from: process.env.SENDGRID_SENDER_EMAIL || "",
		subject: "Confirmación de envío",
		dynamicTemplateData: {
			logoUrl: `${clientUrl}/_next/image?url=%2Fstatic%2Flogo.png&w=256&q=75`,
			subject: "Confirmación de envío",
			mainTitle: "Confirmación de envío",
			message: `El paquete del pedido #${orderid} ha sido enviado.`,
			link: clientUrl,
			orderLabel: "Pedido",
			orderNumber: `#${orderid}`,
			dateLabel: "Fecha del envío",
			dateAndTime: dateFormatter.format(dateAndTime),
			orderUrl: `${clientUrl}/orders/${orderid}`,
			viewOrder: "Ver Pedido",
			shippingAddress: "Dirección de envío",
			address: `${shippingName}, ${addressLine1}, ${
				addressLine2 ? `${addressLine2}, ` : ""
			}${city}, ${province}, ${
				translateCountry({
					code: country,
					locale,
				}) || country
			}, ${zipcode}`,
			item: "Artículo",
			quantity: "Cant.",
			items: orderItems.map((item) => ({
				title: item.title.es,
				condition: translateProductCondition(item.condition),
				quantity: item.invoice.totalQuantity,
			})),
			subtotal: "Subtotal",
			subtotalAmmount: priceFormatter.format(itemsTotal),
			shipping: "Envío",
			shippingAmmount: priceFormatter.format(shippingTotal),
			total: "Total",
			totalAmmount: priceFormatter.format(orderTotal),
			footerLinksMessage:
				"Los enlaces en este correo siempre estarán dirigidos a",
			footerCopyrightMessage: `Copyright © Todos los derechos reservados | 2021 ${clientAppName}`,
		},
		templateId: "d-d2324fdab5fe4e29be9b72c9ebf58ef5",
	};
	try {
		await sgMail.send(msg);
	} catch (error) {
		console.log("Error when sending varification code email", error);
	}
};
