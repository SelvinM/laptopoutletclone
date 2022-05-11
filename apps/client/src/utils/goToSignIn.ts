import Router from "next/router";
import queryString from "query-string";
export const getSignInCallbackUrl = (callbackPath?: string) => {
	const pathname = "/signin";
	if (Router.pathname === "/") return { href: pathname };
	//Hacemos undefined todo parametro de url dinámico
	const newQuery = {
		...Router.query,
		categoryid: undefined,
		slug: undefined,
		orderid: undefined,
	};
	const query = `callbackUrl=${encodeURIComponent(
		`${
			process.env.NEXT_PUBLIC_URL + (callbackPath || Router.asPath)
		}?${queryString.stringify(newQuery, {})}`
	)}`;
	return {
		href: { pathname, query },
	};
};

const goToSignIn = (callbackPath?: string) => {
	Router.push(
		{
			pathname: "/signin",
			query: `callbackUrl=${
				process.env.NEXT_PUBLIC_URL + (callbackPath || Router.asPath)
			}`,
		},
		`/signin?callbackUrl=${encodeURIComponent(
			process.env.NEXT_PUBLIC_URL + (callbackPath || Router.asPath)
		)}`
	);
};
export default goToSignIn;
