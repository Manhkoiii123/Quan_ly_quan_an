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
