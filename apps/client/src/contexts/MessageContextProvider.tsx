import { createContext, useState, Dispatch, SetStateAction } from "react";
import { NotificationType } from "../types";
interface Context {
	messageVisible: boolean;
	setMessageVisible: Dispatch<SetStateAction<boolean>>;
	message?: string;
	setMessage: Dispatch<SetStateAction<string | undefined>>;
	messageType?: NotificationType;
	setMessageType: Dispatch<SetStateAction<NotificationType | undefined>>;
}
interface Props {
	children: JSX.Element;
}
export const MessageContext = createContext({} as Context);

const MessageContextProvider = ({ children }: Props) => {
	const [messageType, setMessageType] = useState<NotificationType>();
	const [message, setMessage] = useState<string>();
	const [messageVisible, setMessageVisible] = useState(false);
	return (
		<MessageContext.Provider
			value={{
				messageVisible,
				setMessageVisible,
				message,
				setMessage,
				messageType,
				setMessageType,
			}}
		>
			{children}
		</MessageContext.Provider>
	);
};

export default MessageContextProvider;
