"use client";
import { useAppContext } from "@/components/app-provider";
import {
  getAccessTokenFromLocalstorage,
  getRefreshTokenFromLocalstorage,
} from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const { mutateAsync } = useLogoutMutation();
  const ref = useRef<any>(null);
  const searchParam = useSearchParams();
  const { setIsAuth } = useAppContext();

  const refreshTokenFromUrl = searchParam.get("refreshToken");
  const accessTokenFromUrl = searchParam.get("accessToken");

  useEffect(() => {
    if (
      !ref.current ||
      (refreshTokenFromUrl &&
        refreshTokenFromUrl === getRefreshTokenFromLocalstorage()) ||
      (accessTokenFromUrl &&
        accessTokenFromUrl === getAccessTokenFromLocalstorage())
    ) {
      ref.current = mutateAsync;
      mutateAsync().then((res) => {
        setTimeout(() => {
          ref.current = null;
        }, 1000);
        setIsAuth(false);
        router.push("/login");
      });
    } else {
      router.push("/");
    }
  }, [mutateAsync, refreshTokenFromUrl, router, accessTokenFromUrl]);
  return <div></div>;
};

export default LogoutPage;
