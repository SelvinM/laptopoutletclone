import React from "react";
import { ThemeProvider } from "next-themes";
import { ApolloProvider } from "@apollo/client";
import { Provider } from "next-auth/client";
import { AppProps } from "next/app";
import "../styles/index.css";
import AppWrapper from "../components/layouts/AppWrapper";
import CurrencyContextProvider from "../contexts/CurrencyContextProvider";
import LoadingContextProvider from "../contexts/LoadingContextProvider";
import { useApollo } from "../libs/apollo/apollo";
import MessageContextProvider from "../contexts/MessageContextProvider";
import IPAddressContextProvider from "../contexts/IPObjectContextProvider";
interface Props extends AppProps {
	err?: any;
}
function MyApp({ pageProps, Component, err }: Props) {
	const apolloClient = useApollo(pageProps);
	return (
		<>
			<ApolloProvider client={apolloClient}>
				<CurrencyContextProvider>
					<LoadingContextProvider>
						<MessageContextProvider>
							<IPAddressContextProvider>
								<ThemeProvider
									attribute="class"
									defaultTheme="light"
									themes={["dark", "light"]}
									disableTransitionOnChange={true}
								>
									<Provider session={pageProps.session}>
										<AppWrapper>
											<Component {...pageProps} err={err} />
										</AppWrapper>
									</Provider>
								</ThemeProvider>
							</IPAddressContextProvider>
						</MessageContextProvider>
					</LoadingContextProvider>
				</CurrencyContextProvider>
			</ApolloProvider>
		</>
	);
}

export default MyApp;
