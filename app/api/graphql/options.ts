import { fetchGraphql } from "./graphql";

export async function getOptionsData() {
  const query = {
    query: `{
      getGeneralOptions(authKey: "${process.env.NEXT_PUBLIC_AUTH_KEY}", slug: "${process.env.NEXT_PUBLIC_OPTIONS_KEY}") {
        otherOptions
        detailPageOptions
        alertData
        footerData
        headerData
        holiday_days
        holiday_hours
        mall_hours
        overrideHours
        redirectionData
        blog_data
        status
        message
      }
    }`,
  };

  const data = await fetchGraphql(query);
  return data?.data || data;
}