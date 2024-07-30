"use client";
import {
  checkEndRefreshToken,
  getRefreshTokenFromLocalstorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
function RefreshToken() {
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
    } else {
      router.push("/");
    }
  }, [redirectPathNameFromUrl, refreshTokenFromUrl, router]);
  return <div></div>;
}
const RefreshTokenPage = () => {
  return (
    <Suspense>
      <RefreshToken />
    </Suspense>
  );
};

export default RefreshTokenPage;
