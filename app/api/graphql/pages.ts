import { fetchGraphql } from "./graphql";

export async function getPageData(
  slug: string,
  postType: string,
  mallLoc: string,
) {
  const query = {
    query: `{
      getPostDataBySlug(authKey: "${process.env.NEXT_PUBLIC_AUTH_KEY}", slug: "${slug}", postType: "${postType}", mallLoc: "${mallLoc}") {
        id
        title
        meta_title
        meta_description
        meta_options
        meta_index
        canonical_url
        enable_breadcrumb
        thumbnail {
          url
          alt
        }
        published_at
        updated_at
        status
        message
        meta_content {
          mobile_top_spacing
          mobile_bottom_spacing
          block_id
          section_orientation
          section_intro_width
          section_alignment
          enable_card_border
          heading_placement
          enable_desc
          tag
          tab_data
          hide_block
          additional_classes
          placeholder
          search_type
          enable_search
          enable_filters
          enable_category
          enable_tag_category
          enable_sorting
          enable_load_more
          enable_captcha
          destination_lat
          destination_lng
          selected_places
          disable_cta
          destination_label
          map_cta
          alignment
          bg_color
          card_color_theme
          card_style
          cards {
            content
            gallery {
              url
              alt
            }
            image {
              url
              alt
            }
            card_mobile_image {
              url
              alt
            }

            links {
              cta {
                url
                title
                target
              }
              cta_label
            }
            subTitle
            title
          }
          center_mode
          column
          column_layout
          column_mobile
          compact_layout
          content
          cta {
            url
            title
            target
          }
          cta_label
          enable_arrows
          enable_dots
          enable_slider
          gallery {
            url
            alt
          }
          layout
          links {
            cta {
              url
              title
              target
            }
            cta_label
          }
          option
          partials_slides
          related_posts
          post_type
          post_link_text
          cat_filter_type
          exclude_cat
          post_taxonomy{
          taxonomy_slug
          terms{
            slug
            name
          }

        }
          number_of_posts
          section_layout
          section_subTitle
          section_title
          slider_visibility
          visible_slides
          visible_slides_mobile
          mall_data
          main_image {
            url
            alt
          }
          tablet_image {
            url
            alt
          }
          mobile_image {
            url
            alt
          }
          video
          form_fields
          selected_from_id
          form_title
          top_spacing
          bottom_spacing
          border_width
          search_heading
          search_subheading
        }


      }
  }`,
  };

  const data = await fetchGraphql(query);
  return data?.data || data;
}
