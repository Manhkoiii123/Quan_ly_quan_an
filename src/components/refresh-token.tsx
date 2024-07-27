"use client";
import {
  checkEndRefreshToken,
  getAccessTokenFromLocalstorage,
  getRefreshTokenFromLocalstorage,
  setAccessTokenToLocalstorage,
  setRefreshTokenToLocalstorage,
} from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequest/auth";

// các page ko check ref token
const UNAUTHENTICATED_PATH = ["/login", "/logout", "/refresh-token"];
export default function RefreshToken() {
  const pathName = usePathname();

  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathName)) return;
    let interval: any = null;

    // phải gọi lần đầu vì interval sẽ gọi sau thời gian timeout
    checkEndRefreshToken({
      onError: () => {
        clearInterval(interval);
      },
    });
    const TIMEOUT = 1000; // phải bé hơn thời gian hết hạn của acctoken
    interval = setInterval(checkEndRefreshToken, TIMEOUT);
    return () => clearInterval(interval);
  }, [pathName]);
  return null;
}
