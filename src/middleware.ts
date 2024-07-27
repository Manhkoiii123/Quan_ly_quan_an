import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/manage"];
const unAuthPaths = ["/login"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  //chưa đăng nhập thì ko cho vào
  if (privatePaths.some((path) => pathname.startsWith(path) && !refreshToken)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  //đăng nhập r ko cho vào login nữa
  if (unAuthPaths.some((path) => pathname.startsWith(path) && refreshToken)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  //hết hạn token(đăng nhập rồi)
  if (
    privatePaths.some(
      (path) => pathname.startsWith(path) && !accessToken && refreshToken
    )
  ) {
    const url = new URL("/refresh-token", request.url);
    url.searchParams.set("refreshToken", refreshToken || "");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/login"],
};
