import http from "@/lib/http";
import {
  AccountResType,
  ChangePasswordBodyType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";

const accountApiRequest = {
  sMe: (accessToken: string) =>
    http.get<AccountResType>("/accounts/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  me: () => http.get<AccountResType>("/accounts/me"),
  updateMe: (body: UpdateMeBodyType) =>
    http.put<AccountResType>("/accounts/me", body),
  changePassword: (body: ChangePasswordBodyType) => {
    return http.put<AccountResType>("/accounts/change-password", body);
  },
};
export default accountApiRequest;
