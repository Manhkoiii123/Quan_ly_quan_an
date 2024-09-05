import { Role } from "@/constants/type";
import { decodeToken } from "@/lib/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const managePaths = ["/manage"];
const guestPaths = ["/guest"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/login"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  //1. chưa đăng nhập thì ko cho vào
  if (privatePaths.some((path) => pathname.startsWith(path) && !refreshToken)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("clearToken", "true");
    return NextResponse.redirect(url);
  }
  // 2. đã đăng nhập
  if (refreshToken) {
    // 2.1  nếu cố tình vào login thì redirect về trang chủ
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // 2.2  hết hạn token(đăng nhập rồi)
    if (
      privatePaths.some((path) => pathname.startsWith(path) && !accessToken)
    ) {
      const url = new URL("/refresh-token", request.url);
      url.searchParams.set("refreshToken", refreshToken || "");
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 2.3 vào ko đúng page quyền hạn (khách vòa trang quản lí => ko cho vào ) +. redirect trang chủ
    const role = decodeToken(refreshToken).role;
    //guest nhưng cố vào của owner
    if (
      (role === Role.Guest && //guest nhưng cố vào của owner
        managePaths.some((path) => pathname.startsWith(path))) ||
      (role !== Role.Guest && // ko phải G nhưng cố vào route G
        guestPaths.some((path) => pathname.startsWith(path)))
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/guest/:path*", "/login"],
};
