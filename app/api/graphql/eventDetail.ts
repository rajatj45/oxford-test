import { fetchGraphql } from "./graphql";

export async function getEventDetailData(
  slug: string,
  loc: string = `${process.env.NEXT_PUBLIC_MALL_KEY}`,
) {
  const query = {
    query: `{
      getEventDetail(authKey: "${process.env.NEXT_PUBLIC_AUTH_KEY}", loc: "${loc}", slug: "${slug}") {
        id
        title
        content
        link
        thumbnail {
          url
        }
        meta_title
        meta_description
        canonical_url
        meta_index
        published_at
        updated_at
        event_data
        selected_template
        selected_template_data
        related_data
        related_posts
        form_data
        form_fields
        status
        message
      }
    }
    `,
  };

  const response = await fetchGraphql(query);
  return response?.getEventDetail || response?.data?.getEventDetail || null;
}
