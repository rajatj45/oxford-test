import {fetchGraphql} from "./graphql";

export async function getStoreDetailData(
  slug: string,
  loc: string = `${process.env.NEXT_PUBLIC_MALL_KEY}`,
) {
  const query = {
    query: `
      query {
        getStoreDetail(authKey: "${process.env.NEXT_PUBLIC_AUTH_KEY}", loc: "${loc}", slug: "${slug}") {
          id
          title
          slug
          thumbnail {
            url
            alt
          }
          content_cta_links
          store_hours_group
          store_information_group
          store_fields_group
          meta_fields_group
          store_image_group
          birthday_offers_group
          birthday_offers_picture
          selected_stores {
            terms {
                name
                slug
              }
          taxonomy_slug
          }
          related_posts
          related_store_heading
          form_data
          form_fields
          status
          message
        }
      }
    `,
  };

  const response = await fetchGraphql(query);
  return response?.getStoreDetail || response?.data?.getStoreDetail || null;
}
