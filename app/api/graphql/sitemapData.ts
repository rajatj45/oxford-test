import { fetchGraphql } from "./graphql";

export async function getSiteMap(slug: string, limit:number) {
  const query = {
    query: `{
      getSiteMap(authKey: "${process.env.NEXT_PUBLIC_AUTH_KEY}", pageType: "${slug}", mallLoc: "${process.env.NEXT_PUBLIC_MALL_KEY}", limit:${limit}) {
        posts {
          id
          slug
          title
          content
          link
          updated_at
          thumbnail {
            url
          }
        }
        status
        message
      }
    }`,
  };

  const data = await fetchGraphql(query);
  return data?.data || data;
}
