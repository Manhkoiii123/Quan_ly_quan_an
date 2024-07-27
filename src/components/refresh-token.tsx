"use client";
import {
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
    const checkEndRefreshToken = async () => {
      //không nên đưa 2 cái lấy acc và ref ra khỏi func này để mỗi lần check thì lấy cái mới nhất
      const accessToken = getAccessTokenFromLocalstorage();
      const refreshToken = getRefreshTokenFromLocalstorage();
      //chưa đăng nhập ko cho chạy
      if (!accessToken && !refreshToken) return;
      //decode ra
      const decodedAccessToken = jwt.decode(accessToken!) as {
        exp: number;
        iat: number; //thời gian khỏi tạo
      };
      const decodedRefreshToken = jwt.decode(refreshToken!) as {
        exp: number;
        iat: number;
      };
      //thời điểm hết hạn là tính theo s
      // khi dùng cú pháp new date.gettime trả về ms => /1000
      const now = Math.round(new Date().getTime() / 1000);
      // refreshtoken hết hạn thì ko xử lí nữa
      if (decodedRefreshToken.exp <= now) return;
      // nếu acctoken hết hạn là 10s
      // kiểm tra thời gian còn 1/3(3s) thì sẽ cho refresh toke lại
      // thời gian còn lại sẽ tính = decodeAcc.exp - now
      // thời gian hết hạn của accrT dựa trên = decodeAcc.exp - decodeacc.iat
      if (
        decodedAccessToken.exp - now <
        (decodedAccessToken.exp - decodedAccessToken.iat) / 3
      ) {
        //call ref
        try {
          const res = await authApiRequest.refreshToken();
          setAccessTokenToLocalstorage(res.payload.data.accessToken);
          setRefreshTokenToLocalstorage(res.payload.data.refreshToken);
        } catch (error) {
          clearInterval(interval);
        }
      }
    };
    // phải gọi lần đầu vì interval sẽ gọi sau thời gian timeout
    checkEndRefreshToken();
    const TIMEOUT = 1000; // phải bé hơn thời gian hết hạn của acctoken
    interval = setInterval(checkEndRefreshToken, TIMEOUT);
    return () => clearInterval(interval);
  }, [pathName]);
  return null;
}
