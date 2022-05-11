import { ApolloClient } from "@apollo/client";
import { DEFAULT_LOCALE } from "@laptopoutlet-packages/constants";
import { Locale } from "@laptopoutlet-packages/types";
import { signOut } from "next-auth/client";
import Router from "next/router";
const signOutWithCacheClean = async (
	currentLocale: Locale,
	client: ApolloClient<any>
) => {
	const callbackUrl = `${process.env.NEXT_PUBLIC_URL}/${
		currentLocale !== DEFAULT_LOCALE ? `${currentLocale}/` : ""
	}signin`;
	await client.clearStore();
	await signOut({ callbackUrl, redirect: false });
	Router.push("/signin");
};

export default signOutWithCacheClean;
