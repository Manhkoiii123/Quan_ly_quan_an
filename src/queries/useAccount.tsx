import accountApiRequest from "@/apiRequest/account";
import { useQuery } from "@tanstack/react-query";

export const useAccontProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: accountApiRequest.me,
  });
};
