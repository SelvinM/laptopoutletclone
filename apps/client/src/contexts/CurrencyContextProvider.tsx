import {
	createContext,
	useState,
	Dispatch,
	SetStateAction,
	useEffect,
} from "react";
import cookie from "cookie";
import { Currency } from "@laptopoutlet-packages/types";
import { isCurrency } from "@laptopoutlet-packages/utils";
interface Context {
	currency: Currency;
	setCurrency: Dispatch<SetStateAction<Currency>>;
}
const defaultState = Currency.Hnl;
export const CurrencyContext = createContext({} as Context);

const initialState =
	typeof window !== "undefined"
		? isCurrency(cookie.parse(document.cookie).currency)
			? (cookie.parse(document.cookie).currency as Currency)
			: defaultState
		: defaultState;

const CurrencyContextProvider = ({ children }: { children: any }) => {
	// const [isInitialized, setIsInitialized] = useState(false);
	const [currency, setCurrency] = useState(Currency.Hnl);
	// useEffect(() => {
	//   if (isInitialized && currency !== cookie.parse(document.cookie).currency) {
	//     document.cookie = cookie.serialize("currency", currency, {
	//       httpOnly: false,
	//       path: "/",
	//       sameSite: "strict",
	//       secure: process.env.NODE_ENV === "production",
	//     });
	//   }
	// }, [currency, isInitialized]);

	useEffect(() => {
		setCurrency(initialState);
		// setIsInitialized(true);
	}, []);

	return (
		<CurrencyContext.Provider value={{ currency, setCurrency }}>
			{children}
		</CurrencyContext.Provider>
	);
};

export default CurrencyContextProvider;
