# Bài 66 Sữa lỗi build với useSearchParams và tránh cache khi build

khi call api

```ts
import http from "@/lib/http";
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";

const dishApiRequest = {
  // Note: Next.js 15 thì mặc định fetch sẽ là { cache: 'no-store' } (dynamic rendering page)
  // Hiện tại next.js 14 mặc định fetch sẽ là { cache: 'force-cache' } nghĩa là cache (static rendering page) => mặc định nó là cache
  // khi static => build lên
  list: () =>
    http.get<DishListResType>("dishes", { next: { tags: ["dishes"] } }),
  add: (body: CreateDishBodyType) => http.post<DishResType>("dishes", body),
  getDish: (id: number) => http.get<DishResType>(`dishes/${id}`),
  updateDish: (id: number, body: UpdateDishBodyType) =>
    http.put<DishResType>(`dishes/${id}`, body),
  deleteDish: (id: number) => http.delete<DishResType>(`dishes/${id}`),
};

export default dishApiRequest;
```

`http.get<DishListResType>("dishes", { next: { tags: ["dishes"] } }),` dòng này nếu chỉ có là `http.get<DishListResType>("dishes")` thôi thì nó chỉ là static rendering => khi build nhiều khi nó sẽ ko ăn data mới (trên file html khi build) => do nextjs caching mỗi lần build

từ lần build thứ 2 nó sẽ cache cái lần build trước (ko call lại api nữa) => fix xóa thư mục cache để build lại => là dễ nhất

# Bài 67 Xử lý caching với kĩ thuật ISR

khi đã build xong => sinh ra file html rồi thì file nó sẽ luôn ko đổi

ví dụ tên món ăn là A => build lên ra file html là A rồi. khi đó vào admin sửa tên món đó thành B => sang trang home f5 lại nó vẫn là A(do file index.html khi build) => lỗi cache

khi update thì mỗi file index.html làm mới lại, còn các file khác thì giữ nguyên

=> có cái data fetching/revalidating ()

có 2 kiểu

`cách 1` là theo thời gian : là `fetch('http://....',{next:{revalidate:3600}})`

code trên docs

```ts
export const revalidate = 3600; // invalidate every hour

export default async function Page() {
  let data = await fetch("https://api.vercel.app/blog");
  let posts = await data.json();
  return (
    <main>
      <h1>Blog Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

`cách 2 `dựa trên cái tag của nó

code trên docs

```ts
export default async function Page() {
  let data = await fetch("https://api.vercel.app/blog", {
    next: { tags: ["posts"] },
  });
  let posts = await data.json();
  // ...
}
```

sử dụng trong dự án

khi gọi api
`list: () =>
    http.get<DishListResType>("dishes", { next: { tags: ["dishes"] } }),`

docs : [docs](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)

viết route handle revalidate => ok

viết 1 cái để call api `revalidate.ts`

```ts
import http from "@/lib/http";

const revalidateApiRequest = (tag: string) =>
  http.get(`/api/revalidate?tag=${tag}`, {
    baseUrl: "",
  });

export default revalidateApiRequest;
```

sử dụng lúc mà adddissh và edit dish

```ts
await revalidateApiRequest("dishes");
```

# 13.70 Khai báo Route Handler cho auth guest (chuowng 13 bài 70)

tương tự admin (code)
