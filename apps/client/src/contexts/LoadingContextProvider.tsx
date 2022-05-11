import { createContext, useState, Dispatch, SetStateAction } from "react";
interface Context {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}
export const LoadingContext = createContext({} as Context);

const LoadingContextProvider = ({ children }: { children: any }) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContextProvider;
