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

# Còn trường hợp cả 2 cái đều còn vì 1 lí do nào đó trả về 401 (author)=> logout

khi call api lên server backend => trả về 401 => đọc http.ts ( đã xử lí )

```typescript
} else {
        const accessToken = (options?.headers as any)?.Authorization.split(
          "Bearer "
        )[1];
        redirect(`/logout?accessToken=${accessToken}`);
      }
```

đã xử lí bên http nhưng đá về acctoken => ko logout được
=> check thêm ở bên cái logout page cả case accToken

```typescript
"use client";
import {
  getAccessTokenFromLocalstorage,
  getRefreshTokenFromLocalstorage,
} from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const { mutateAsync } = useLogoutMutation();
  const ref = useRef<any>(null);
  const searchParam = useSearchParams();

  const refreshTokenFromUrl = searchParam.get("refreshToken");
  const accessTokenFromUrl = searchParam.get("accessToken");

  useEffect(() => {
    if (
      ref.current ||
      (refreshTokenFromUrl &&
        refreshTokenFromUrl !== getRefreshTokenFromLocalstorage()) ||
      (accessTokenFromUrl &&
        accessTokenFromUrl !== getAccessTokenFromLocalstorage())
    ) {
      return;
    }

    ref.current = mutateAsync;
    mutateAsync().then((res) => {
      setTimeout(() => {
        ref.current = null;
      }, 1000);

      router.push("/login");
    });
  }, [mutateAsync, refreshTokenFromUrl, router, accessTokenFromUrl]);
  return <div></div>;
};

export default LogoutPage;
```

test
khai báo 1 api call phía server

```typescript
 sMe: (accessToken: string) =>
    http.get<AccountResType>("/accounts/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
```

bên 1 cái component server ào đo

```typescript
import accountApiRequest from "@/apiRequest/account";
import { cookies } from "next/headers";
import React from "react";

const page = async () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value!;
  const res = await accountApiRequest.sMe(accessToken);

  return <div>Dashboard page {res.payload.data.name}</div>;
};

export default page;
```

có 1 cái bug là khi dùng redirect với server component thì mặc định sẽ throw ra 1 cái lỗi
nếu mà dùng try catch để cl cái error khi call cái sme kia thì sẽ bị báo lỗi
=> xử lí như sau

![alt text](image-1.png)

hoặc là ko dùng try catch nữa là được
=> done

# Phân tích cơ chế RefreshToken ớ nextJs

các api yêu cầu

1. server component => cần api /me ở server để lấy tt profile người dùng
2. client component thì cầm call /me ở client để lấy tt của người dùng

=> hết hạn token xảy ra được ở cả 2 client và server

**các trường hợp hết hạn acctoken**

- đang dùng thì hết hạn => ko cho xảy ra => khi **gần hết** => call ref luôn (react thì đợi hết rồi mới call reftoken => xong call tiếp cái api đang gọi dở) => bằng cách sử dụng setInterval
- lâu ngày ko vào web thì bbh vào lại refToken hết hạn
  khi vào lại web => middleware chạy ddaufat tiên => kiểm tra xem acc còn ko . nếu ko cần thì redirect về client compo call api reftoken => redirect ngược về trang đang sử dụng

# tạo route handle cho refreshtoken

khai báo api để call đã

```typescript
sRefreshToken: (body: RefreshTokenBodyType) => {
    return http.post<RefreshTokenResType>("/auth/refresh-token", body);
  },
  refreshToken: () => {
    return http.post<RefreshTokenResType>("/api/auth/refresh-token", null, {
      baseUrl: "",
    });
  },

```

Viết route handle cho việc refreshToken

```typescript
import authApiRequest from "@/apiRequest/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { HttpError } from "@/lib/http";
export async function POST(req: Request) {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return Response.json(
      {
        message: "Không nhận được refreshToken",
      },
      {
        status: 401,
      }
    );
  }
  try {
    //call đến server backend
    const { payload } = await authApiRequest.sRefreshToken({
      refreshToken,
    });
    //decode acc và ref để lấy được giờ hết hạn
    const decodedAccessToken = jwt.decode(payload.data.accessToken) as {
      exp: number;
    };
    const decodedRefreshToken = jwt.decode(payload.data.refreshToken) as {
      exp: number;
    };
    //set cookie
    cookieStore.set("accessToken", payload.data.accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    cookieStore.set("refreshToken", payload.data.refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    });
    //return về
    return Response.json(payload);
  } catch (error: any) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status,
      });
    } else {
      return Response.json(
        {
          message: error.message || "Có lỗi xảy ra",
        },
        { status: 401 }
      );
    }
  }
}
```
