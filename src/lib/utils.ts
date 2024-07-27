import { toast } from "@/components/ui/use-toast";
import { EntityError } from "@/lib/http";
import { type ClassValue, clsx } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequest/auth";

//mở cái loginform xem cái catch => cần những cái gì => errors,1 cái setError,duration(thời gian nó toast lên)
export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>; //di chuột vào cái hàm sE bên form => type
  duration?: number;
}) => {
  //nếu err có kiểu là EE
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((e) => {
      setError(e.field, {
        type: "server",
        message: e.message,
      });
    });
  } else {
    toast({
      title: "Lỗi",
      description: error?.payload?.message ?? "Có lỗi đang xảy ra",
      variant: "destructive",
      duration: duration ?? 5000,
    });
  }
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

const isBrower = typeof window !== "undefined";
export const getAccessTokenFromLocalstorage = () => {
  return isBrower ? localStorage.getItem("accessToken") : null;
};
export const getRefreshTokenFromLocalstorage = () => {
  return isBrower ? localStorage.getItem("refreshToken") : null;
};
export const setAccessTokenToLocalstorage = (acc: string) => {
  return isBrower && localStorage.setItem("accessToken", acc);
};
export const setRefreshTokenToLocalstorage = (ref: string) => {
  return isBrower && localStorage.setItem("refreshToken", ref);
};
export const removeLocalStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
export const checkEndRefreshToken = async (params: {
  onError?: () => void;
  onSuccess?: () => void;
}) => {
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
  const now = new Date().getTime() / 1000 - 1;
  // refreshtoken hết hạn thì cho logout
  if (decodedRefreshToken.exp <= now) {
    removeLocalStorage();
    params?.onError && params?.onError();
    return;
  }
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
      params?.onSuccess && params?.onSuccess();
    } catch (error) {
      params?.onError && params?.onError();
    }
  }
};
