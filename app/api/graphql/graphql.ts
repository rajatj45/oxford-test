import { cache } from "react";

const REVALIDATE = "60";

export const fetchGraphql = cache(async ({ query }: { query: string }) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: Number(REVALIDATE) },
    },
  );
  const res = await response.json();
  return res?.data;
})
