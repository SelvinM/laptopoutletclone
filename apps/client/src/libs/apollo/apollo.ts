import { useMemo } from "react";
import {
	ApolloClient,
	InMemoryCache,
	NormalizedCacheObject,
} from "@apollo/client";
import { IncomingMessage, ServerResponse } from "http";
import merge from "deepmerge";
import cacheConfig from "./cacheConfig";
export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";
export type ResolverContext = {
	req?: IncomingMessage;
	res?: ServerResponse;
};

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;
const createIsomorphLink = (context: ResolverContext = {}) => {
	if (typeof window === "undefined") {
		const { SchemaLink } = require("@apollo/client/link/schema");
		const schema = require("../graphql/schema").default;
		return new SchemaLink({ schema, context });
	}
	const { HttpLink } = require("@apollo/client");
	return new HttpLink({
		uri: "/api/graphql",
		credentials: "same-origin",
	});
};

const createApolloClient = (context?: ResolverContext) => {
	return new ApolloClient({
		ssrMode: typeof window === "undefined",
		link: createIsomorphLink(context),
		cache: new InMemoryCache(cacheConfig),
	});
};
export function initializeApollo(
	initialState: any = null,
	// Pages with Next.js data fetching methods, like `getStaticProps`, can send
	// a custom context which will be used by `SchemaLink` to server render pages
	context?: ResolverContext
) {
	const _apolloClient = apolloClient ?? createApolloClient(context);

	// If your page has Next.js data fetching methods that use Apollo Client, the initial state
	// get hydrated here

	if (initialState) {
		// Get existing cache, loaded during client side data fetching
		const existingCache = _apolloClient.extract();

		// Merge the existing cache into data passed from getStaticProps/getServerSideProps
		const data = merge(initialState, existingCache, {
			arrayMerge: (_arr1, arr2, _options) => arr2,
		});
		// Restore the cache with the merged data
		_apolloClient.cache.restore(data);
	}
	// For SSG and SSR always create a new Apollo Client
	if (typeof window === "undefined") return _apolloClient;
	// Create the Apollo Client once in the client
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}
export function addApolloState(
	client: ApolloClient<NormalizedCacheObject>,
	pageProps: any
) {
	if (pageProps?.props)
		pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
	return pageProps;
}

export function useApollo(pageProps: any) {
	const state = pageProps[APOLLO_STATE_PROP_NAME];
	const store = useMemo(() => initializeApollo(state), [state]);
	return store;
}
