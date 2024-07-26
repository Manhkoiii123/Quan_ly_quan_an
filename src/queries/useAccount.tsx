import accountApiRequest from "@/apiRequest/account";
import { useMutation, useQuery } from "@tanstack/react-query";

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
