ý tưởng như khóa free => đá về /logout trong middleware khi cái acctoken trong cookie bị xóa đi
=> tạo app/pub/auth/logout

khi acctoken hết hạn thì trong cái cookie tự xóa còn cái lS thì k
khi đó chạy vào middleware

```typescript
const isauth = Boolean(request.cookies.get("accessToken")?.value);
if (privatePaths.some((path) => pathname.startsWith(path) && !isauth)) {
  return NextResponse.redirect(new URL("/logout", request.url));
}
```

=> sẽ đá sang logout

=> tạo app/pub/auth/logout

```typescript
"use client";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  useEffect(() => {
    logoutMutation.mutateAsync().then((res) => {
      router.push("/login");
    });
  }, [logoutMutation, router]);
  return <div></div>;
};

export default LogoutPage;
```

viết thế nó sẽ re render vô cực
khi nhảy từ middleWare => sang logout sẽ chạy vòa useE => call mutation => logoutMutation lại bị thay đổi tham chiếu ngay lập tức => chạy lại callback trong useEffect => liên tục

=> cách fix

```typescript
"use client";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const { mutateAsync } = useLogoutMutation();
  useEffect(() => {
    mutateAsync().then((res) => {
      router.push("/login");
    });
  }, [mutateAsync, router]); // mutateAsync nó sẽ ko thay đổi
  return <div></div>;
};

export default LogoutPage;
```

=> bị call 2 api logout (do strictmode )
cách tắt strictmode

![alt text](image.png)

có 1 cách là abortController => chỉ là hủy kết quả nhận về => ko hay
=> dùng setTimeout => chỉ call 1 lần dù có strict mode

```typescript
"use client";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const { mutateAsync } = useLogoutMutation();
  const ref = useRef<any>(null);

  useEffect(() => {
    if (ref.current) return;
    ref.current = mutateAsync;
    mutateAsync().then((res) => {
      setTimeout(() => {
        ref.current = null;
      }, 1000);

      router.push("/login");
    });
  }, [mutateAsync, router]);
  return <div></div>;
};

export default LogoutPage;
```

vẫn còn rủi ro => nếu người dùng bị lừa ấn vào url logout => check chỉ thực hiện logouut khi token nó giống
=> đá sang url /logout?token=.... cái token khớp với cái token trong cookie thì mới cho logout

```typescript
//middleware
if (privatePaths.some((path) => pathname.startsWith(path) && !isauth)) {
  const url = new URL("/logout", request.url);
  url.searchParams.set(
    "refreshToken",
    request.cookies.get("refreshToken")?.value ?? ""
  );
  return NextResponse.redirect(url);
}
```

chỉ đưa thế này khi người dùng đã đăng nhập và có ref rồi => cần fix thêm case ch đăng nhập

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/manage"];
const unAuthPaths = ["/login"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = Boolean(request.cookies.get("accessToken")?.value);
  const refreshToken = Boolean(request.cookies.get("accessToken")?.value);
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
    const url = new URL("/logout", request.url);
    url.searchParams.set(
      "refreshToken",
      request.cookies.get("refreshToken")?.value ?? ""
    );
    return NextResponse.redirect(url);
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/login"],
};
```

bên logout page

```typescript
"use client";
import { getRefreshTokenFromLocalstorage } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const { mutateAsync } = useLogoutMutation();
  const ref = useRef<any>(null);
  const searchParam = useSearchParams();

  const refreshTokenFromUrl = searchParam.get("refreshToken");

  useEffect(() => {
    if (
      ref.current ||
      refreshTokenFromUrl !== getRefreshTokenFromLocalstorage()
    )
      return;
    ref.current = mutateAsync;
    mutateAsync().then((res) => {
      setTimeout(() => {
        ref.current = null;
      }, 1000);

      router.push("/login");
    });
  }, [mutateAsync, refreshTokenFromUrl, router]);
  return <div></div>;
};

export default LogoutPage;
```
