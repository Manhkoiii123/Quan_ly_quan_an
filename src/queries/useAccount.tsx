import accountApiRequest from "@/apiRequest/account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateEmployeeAccountBodyType } from "@/schemaValidations/account.schema";
export const useAccontProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: accountApiRequest.me,
  });
};
export const useUpdateMeMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.updateMe,
  });
};
export const useChangePassMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.changePassword,
  });
};
export const useGetAccountList = () => {
  return useQuery({
    queryKey: ["accountList"],
    queryFn: accountApiRequest.list,
  });
};
export const useGetAccount = ({
  id,
  enable,
}: {
  id: number;
  enable: boolean;
}) => {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => accountApiRequest.getEmployeeDetail(id),
    enabled: enable,
  });
};
export const useAddAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.addEmployees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountList"] });
    },
  });
};
export const useUpdateAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: UpdateEmployeeAccountBodyType & {
      id: number;
    }) => accountApiRequest.updateEmployee(body, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountList"] });
    },
  });
};
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountApiRequest.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountList"] });
    },
  });
};
