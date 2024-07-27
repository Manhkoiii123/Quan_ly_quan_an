"use client";
import { checkEndRefreshToken } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// các page ko check ref token
const UNAUTHENTICATED_PATH = ["/login", "/logout", "/refresh-token"];
export default function RefreshToken() {
  const pathName = usePathname();
  const router = useRouter();
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
    interval = setInterval(
      () =>
        checkEndRefreshToken({
          onError: () => {
            clearInterval(interval);
            router.push("/login");
          },
        }),
      TIMEOUT
    );
    return () => clearInterval(interval);
  }, [pathName, router]);
  return null;
}
