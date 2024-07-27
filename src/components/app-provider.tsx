"use client";

import RefreshToken from "@/components/refresh-token";
import {
  getAccessTokenFromLocalstorage,
  removeLocalStorage,
} from "@/lib/utils";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { createContext, useContext, useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});
const AppContext = createContext({
  isAuth: false,
  setIsAuth: (isAuth: boolean) => {},
});
export const useAppContext = () => {
  return useContext(AppContext);
};
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuthState] = useState(false);
  useEffect(() => {
    const accessToken = getAccessTokenFromLocalstorage();
    if (accessToken) {
      setIsAuthState(true);
    }
  }, []);
  const setIsAuth = (isAuth: boolean) => {
    if (isAuth) {
      setIsAuthState(true);
    } else {
      setIsAuthState(false);
      removeLocalStorage();
    }
  };
  return (
    <AppContext.Provider value={{ isAuth: isAuth, setIsAuth: setIsAuth }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppContext.Provider>
  );
};

export default AppProvider;
