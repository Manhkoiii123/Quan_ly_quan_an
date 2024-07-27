"use client";
import {
  checkEndRefreshToken,
  getRefreshTokenFromLocalstorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const RefreshTokenPage = () => {
  const router = useRouter();
  const searchParam = useSearchParams();

  const refreshTokenFromUrl = searchParam.get("refreshToken");
  const redirectPathNameFromUrl = searchParam.get("redirect");

  useEffect(() => {
    if (
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalstorage()
    ) {
      checkEndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathNameFromUrl || "/");
        },
      });
    }
  }, [redirectPathNameFromUrl, refreshTokenFromUrl, router]);
  return <div></div>;
};

export default RefreshTokenPage;
