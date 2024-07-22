import authApiRequest from "@/apiRequest/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";
export async function POST(req: Request) {
  const body = (await req.json()) as LoginBodyType;
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  //luôn luôn xóa cookie đi
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  if (!accessToken || !refreshToken) {
    return Response.json(
      { message: "Không nhận được accessToken hoặc refreshToken" },
      { status: 200 }
    );
  }
  try {
    const res = await authApiRequest.sLogout({
      accessToken,
      refreshToken,
    });
    return Response.json(res.payload, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Có lỗi xảy ra" }, { status: 200 });
  }
}
