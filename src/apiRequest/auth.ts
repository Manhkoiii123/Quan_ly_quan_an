import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from "@/schemaValidations/auth.schema";
import { MessageResType } from "@/schemaValidations/common.schema";

const authApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: RefreshTokenResType;
  }> | null,
  //server login
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "", //call route handle
    }),
  sLogout: (body: LogoutBodyType & { accessToken: string }) =>
    //do call bên ser nên ko tự động có acct được
    http.post<MessageResType>(
      "/auth/logout",
      { refreshToken: body.refreshToken },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      }
    ),
  //client gọi đến route handle ko cần ody vì at rt tự có qua cookie r => body null
  logout: () =>
    http.post<MessageResType>("/api/auth/logout", null, { baseUrl: "" }),

  sRefreshToken: (body: RefreshTokenBodyType) => {
    return http.post<RefreshTokenResType>("/auth/refresh-token", body);
  },
  async refreshToken() {
    if (this.refreshTokenRequest) return this.refreshTokenRequest;
    this.refreshTokenRequest = http.post<RefreshTokenResType>(
      "/api/auth/refresh-token",
      null,
      {
        baseUrl: "",
      }
    );
    const res = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return res;
  },
};
export default authApiRequest;
