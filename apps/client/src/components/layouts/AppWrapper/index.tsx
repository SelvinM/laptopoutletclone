import { ConfigProvider } from "antd";
import { IntlProvider } from "react-intl";
import I18N from "../../../libs/i18n/i18n-client";
import { FunctionComponent, useContext, useEffect } from "react";
import { MessageContext } from "../../../contexts/MessageContextProvider";
import React from "react";
import Message from "../../common/Message";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { IPObjectContext } from "apps/client/src/contexts/IPObjectContextProvider";
interface Props {
	children: JSX.Element;
}

const AppWrapper: FunctionComponent<Props> = ({ children }) => {
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const currentAppLocale = I18N[currentLocale];
	const { messageVisible, setMessageVisible, messageType, message } =
		useContext(MessageContext);
	const { setIpObject } = useContext(IPObjectContext);
	useEffect(() => {
		fetch("https://api.bigdatacloud.net/data/client-ip", {
			method: "get",
		})
			.then((response) => {
				response.json().then((body) => {
					setIpObject({
						loading: false,
						ipAddress: body.ipString,
					});
				});
			})
			.catch((error) => {
				console.error(`IP fetch error`, error);
				setIpObject({
					loading: false,
					ipAddress: undefined,
				});
			});
	}, []);
	return (
		<IntlProvider
			locale={currentAppLocale.locale}
			messages={currentAppLocale.messages}
		>
			<ConfigProvider locale={currentAppLocale.antdLocale}>
				<>
					<Message
						message={message}
						visible={messageVisible}
						type={messageType}
						closeAction={() => {
							setMessageVisible(false);
						}}
					/>
					{children}
				</>
			</ConfigProvider>
		</IntlProvider>
	);
};

export default AppWrapper;
