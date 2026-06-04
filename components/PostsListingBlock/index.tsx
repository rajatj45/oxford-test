"use client";
import { useState, useCallback, useMemo } from "react";
import Card from "@/components/Card";
import CollapseCard from "@/components/CollapseCard";
import LoadMoreButton from "@/components/LoadMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { BlockData, CardStyles, PostCardsProps } from "@/types/global";
import SectionIntroBlock from "../SectionIntroBlock";
import Preloader from "../Preloader";
import InternalSearch from "../InternalSearch";

export default function PostsListingBlock({ data }: { data: BlockData }) {
  const [searchResults, setSearchResults] = useState<PostCardsProps[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = data?.number_of_posts
    ? Number(data.number_of_posts)
    : 3;

  const isCompact = data?.compact_layout?.includes("yes");

  const compactClass = data.compact_layout == "yes" ? "compact-design" : "";

  const paginationConfig = useMemo(
    () => ({
      ...data,
      posts_per_page: ITEMS_PER_PAGE.toString(),
    }),
    [data, ITEMS_PER_PAGE],
  );

  const { items, status, loadMore, hasMore, isLoading, offset } =
    usePagination(paginationConfig);

  const categories = items?.[0]?.categories;
  const categoriesList = categories ? JSON.parse(categories) : [];

  const tags = items?.[0]?.tags;
  const tagsList = tags ? JSON.parse(tags) : [];

  const cardStyle = (data?.card_style as CardStyles) || "info-card";
  const isAccordion = cardStyle === "accordion-card";
  const horizontalCard = cardStyle === "horizontal-card";
  const isJobCard = cardStyle === "job-card";
  const enableDescription = data.enable_desc;
  const borderLayout = data.enable_card_border?.[0];
  const disableCta = data.disable_cta?.[0];

  const handleResults = useCallback(
    ({
      results: allResults,
      loading,
      hasMinChars,
      wasSubmitted,
      isCategoryResult,
      isTagCatgResult,
      isLetterResult,
    }: {
      results: PostCardsProps[];
      loading: boolean;
      hasMinChars: boolean;
      wasSubmitted?: boolean;
      isCategoryResult?: boolean;
      isTagCatgResult?:boolean;
      isLetterResult?: boolean;
    }) => {
      setSearchResults(allResults);
      setLoading(loading);
      setSearchPage(1);

      if (
        wasSubmitted ||
        isCategoryResult ||
        isTagCatgResult ||
        isLetterResult ||
        allResults.length > 0
      )
        setIsSubmitted(true);
      if (!hasMinChars && !isCategoryResult && !isTagCatgResult && !isLetterResult && !wasSubmitted)
        setIsSubmitted(false);
    },
    [data.post_type],
  );

  const allFormattedSearchResults: PostCardsProps[] = useMemo(() => {
    const posts = Array.isArray(searchResults)
      ? searchResults
      : (searchResults as { posts: PostCardsProps[] })?.posts || [];

    return posts.map((res) => ({
      id: res.id,
      title: res.title,
      thumbnail: {
        url: res.thumbnail?.url || "/images/img-placeholder.jpg",
        alt: res.thumbnail?.alt || "",
      },
      link: res.link,
      selected_stores: [],
      content: res.content || "",
      store_offer_date_range: "",
    }));
  }, [searchResults, data.post_type]);

  const displayedSearchResults = allFormattedSearchResults.slice(
    0,
    searchPage * ITEMS_PER_PAGE,
  );
  const hasMoreSearchItems =
    displayedSearchResults.length < allFormattedSearchResults.length &&
    allFormattedSearchResults.length > 0;

  const handleLoadMore = () => {
    if (isSubmitted || allFormattedSearchResults.length > 0) {
      setSearchPage((prev) => prev + 1);
    } else {
      loadMore();
    }
  };

  const displayItems = isSubmitted ? displayedSearchResults : items;
  const imageDesktopClasses = {
    1: "md:aspect-[1680/500] aspect-432/240",
    2: "md:aspect-[820/500] aspect-432/240",
    3: "md:aspect-[544/320] aspect-432/240",
    4: "md:aspect-[402/240] aspect-432/240",
  };
  const overlayCardClasses = {
    1: "md:aspect-[1680/500]",
    2: "md:aspect-[820/500]",
    3: "sm:aspect-[600/500] aspect-[402/500] xm:aspect-[430/500] md:aspect-[480/550]  lg:aspect-[390/550] 3xl:aspect-[544/600]  4xl:aspect-[544/700]",
    4: "md:aspect-[402/500]",
  };

  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  const postTypeText: { [key: string]: string } = {
    "store-offers": "Store Promotions",
    event: "Events",
    store: "Stores",
    post: "Blog",
    job: "Jobs",
  };
const singleItemClass =
  displayedSearchResults.length === 1
    ? "border-0 border-b-0"
    : "";
  return (
    <>
      {data.enable_search?.includes("yes") && (
        <InternalSearch
          data={data}
          onResult={handleResults}
          uiStyle={true}
          categoriesList={categoriesList}
          catFilterType = {data.cat_filter_type}
          // excludecat = {data.exclude_cat}
          tagsList={tagsList}
        />
      )}
      <div
        className={`posts-listing-block  ${data?.additional_classes || ""} ${compactClass}
      ${compactClass && enableDescription ? "card-border" : ""} ${data.post_type}-blog
      md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)`}
        style={spacingStyles}
      >
        <div className="main-conatiner">
          {(data?.section_title || data?.section_subTitle) && (
            <SectionIntroBlock data={data} />
          )}

          <div className="container">
            {loading ? (
              <div className="flex justify-center py-20">
                <Preloader isLoading={loading} />
              </div>
            ) : (
              <>
                {displayItems.length === 0 ? (
                  status === 'error' ? (
                    <div className="py-20 text-center">
                      <h2 className="text-3xl font-bold">
                        Unauthorized access!
                      </h2>
                    </div>
                  ):(
                    data.post_type && (
                      <div className="py-20 text-center">
                        <h2 className="text-3xl font-bold">
                          It seems like, there is nothing to show in{" "}
                          {postTypeText[data.post_type] || data.post_type}.
                        </h2>
                      </div>
                    )
                  )
                ) : (
                  <div
                    className={
                      horizontalCard || isAccordion || isJobCard
                        ? `${borderLayout === "yes" ? "border-b-0 divide-y md:divide-y-0 md:divide-x border border-(--border-gray-light) " : ""} ${Number(data?.column) > 1? `grid grid-cols-${Number(data?.column_mobile)} lg:grid-cols-${Number(data?.column)}` : "flex flex-col"}`
                        : `grid ${isCompact ? "gap-0" : "gap-6"} grid-cols-1 md:grid-cols-2   lg:grid-cols-${data?.column ? data?.column : "3"}
                      ${borderLayout === "yes" ? "border-b divide-y md:divide-y-0 md:divide-x border border-(--border-gray-light)" : ""}
                      ${singleItemClass}
                  
                      `
                    }
                  >
                    {displayItems.map((post: PostCardsProps, index: number) => {
                      const totalItems = displayItems.length;
                      const isLastRow =
                        index >= Math.floor((totalItems - 1) / 3) * 3;
                      const colCount = Number(
                        data?.column,
                      ) as keyof typeof imageDesktopClasses;
                      const desktopImgClass =
                        cardStyle === "overlay-card"
                          ? overlayCardClasses[colCount] ||
                            overlayCardClasses[1]
                          : imageDesktopClasses[colCount] ||
                            imageDesktopClasses[1];

                      return horizontalCard || isAccordion || isJobCard ? (
                        <CollapseCard
                          key={post.id || index}
                          post={post}
                          cardStyle={cardStyle}
                          cardCount={index + 1}
                          flexClass={
                            Number(data?.column) > 1
                              ? "md:flex-[0_0_50%] "
                              : "md:flex-[0_0_402px]"
                          }
                          mainClass={`${
                            borderLayout
                              ? `border-b border-l-0 border-t-0 border-r border-(--border-gray-light) ${(index + 1) % 2 === 0 ? "border-r-0" : "border-r"}
                         lg:border-r border-r-0 lg:[&:nth-child(2n)]:border-r-0 ${isLastRow ? "border-b-1 md:border-b-1" : ""}`
                              : ""
                          }
                         `}
                          disableCta={disableCta}
                        />
                      ) : (
                        <Card
                          key={index}
                          imgWrapperClass={`${desktopImgClass}`}
                          item={{
                            title: post.title,
                            content: `${(enableDescription ?? [])[0] ? post.content : enableDescription}`,
                            imageSrc: post.thumbnail?.url,

                            cardLink: post.link,
                          }}
                          contentClass="line-clamp-2"
                          cardWrapperClass={`${borderLayout ? "pt-4" : ""}`}
                          wrapperClass={`${
                            borderLayout
                              ? `p-6 pt-6 border-b border-(--border-gray-light) ${(index + 1) % 2 === 0 ? "border-r-0" : "border-r"}
                         lg:border-r border-r-0 lg:[&:nth-child(3n)]:border-r-0 ${isLastRow ? "border-b-1 md:border-b-1" : ""}`
                              : ""
                          } ${displayedSearchResults.length === 1 && borderLayout ? "border-l! border-t!" :" "}`}
                          card_style={cardStyle as CardStyles}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {data.enable_load_more?.includes("yes") && (
              <div className={`${hasMore?"mt-10" : ""}  flex justify-center`}>
                {!isSubmitted
                  ? hasMore && (
                      <LoadMoreButton
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        loading={isLoading}
                        sectionTitle={data?.section_title}
                      />
                    )
                  : hasMoreSearchItems && (
                      <LoadMoreButton
                        onLoadMore={handleLoadMore}
                        hasMore={true}
                        loading={false}
                      />
                    )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
