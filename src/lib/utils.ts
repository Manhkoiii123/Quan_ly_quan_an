import { toast } from "@/components/ui/use-toast";
import { EntityError } from "@/lib/http";
import { type ClassValue, clsx } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";

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
