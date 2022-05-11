import "../theme/index.css";
import "@ant-design/pro-layout/dist/layout.css";
import "antd/dist/antd.css";
import { AppProps } from "next/app";
import LoadingContextProvider from "../contexts/LoadingContext";
import { ConfigProvider, message } from "antd";
import esAntD from "antd/lib/locale/es_ES";
import { useApollo } from "../libs/apollo/apollo";
import { ApolloProvider } from "@apollo/client";
import { MainLayout } from "../components/layouts/MainLayout";
import React from "react";
message.config({ top: 60 });
function MyApp({ Component, pageProps }: AppProps) {
	const apolloClient = useApollo(pageProps);
	return (
		<ApolloProvider client={apolloClient}>
			<LoadingContextProvider>
				<ConfigProvider locale={esAntD}>
					<MainLayout>
						<Component {...pageProps} />
					</MainLayout>
				</ConfigProvider>
			</LoadingContextProvider>
		</ApolloProvider>
	);
}

export default MyApp;
