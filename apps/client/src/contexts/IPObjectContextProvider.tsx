import { createContext, useState, Dispatch, SetStateAction } from "react";
type IPObject = {
	ipAddress?: string;
	loading: boolean;
};
interface Context {
	ipObject: IPObject;
	setIpObject: Dispatch<SetStateAction<IPObject>>;
}
export const IPObjectContext = createContext({} as Context);

const IPObjectContextProvider = ({ children }: { children: any }) => {
	const [ipObject, setIpObject] = useState<IPObject>({
		loading: true,
	});
	return (
		<IPObjectContext.Provider value={{ ipObject, setIpObject }}>
			{children}
		</IPObjectContext.Provider>
	);
};

export default IPObjectContextProvider;
