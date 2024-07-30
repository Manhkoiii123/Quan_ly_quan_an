import http from "@/lib/http";
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
const prefixUrl = "/accounts";
const accountApiRequest = {
  sMe: (accessToken: string) =>
    http.get<AccountResType>(`${prefixUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  me: () => http.get<AccountResType>(`${prefixUrl}/me`),
  updateMe: (body: UpdateMeBodyType) =>
    http.put<AccountResType>(`${prefixUrl}/me`, body),
  changePassword: (body: ChangePasswordBodyType) => {
    return http.put<AccountResType>(`${prefixUrl}/change-password`, body);
  },
  list: () => {
    return http.get<AccountListResType[]>(`${prefixUrl}`);
  },
  addEmployees: (body: CreateEmployeeAccountBodyType) => {
    return http.post<AccountResType>(prefixUrl, body);
  },
  updateEmployee: (body: UpdateEmployeeAccountBodyType, id: number) => {
    return http.put<AccountResType>(`${prefixUrl}/detail/${id}`, body);
  },
  getEmployeeDetail: (id: number) => {
    return http.get<AccountResType>(`${prefixUrl}/detail/${id}`);
  },
  deleteEmployee: (id: number) => {
    return http.delete<AccountResType>(`${prefixUrl}/detail/${id}`);
  },
};
export default accountApiRequest;
