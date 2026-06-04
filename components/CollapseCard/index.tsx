"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { PostCardsProps } from "@/types/global";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clickPushToDataLayer, pushCardsToDataLayer } from "@/utils/utility";

export default function CollapseCard({
  post,
  cardStyle,
  sectionTitle,
  flexClass,
  mainClass,
  disableCta,
}: {
  post: PostCardsProps;
  flexClass?: string;
  cardStyle: string;
  sectionTitle?: string;
  mainClass?: string;
  cardCount?: number;
  disableCta?: string;
}) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const detailedContent = post.content || "";
  const rawDateRange = post?.store_offer_date_range;
  const [startStr, endStr] = rawDateRange
    ? rawDateRange.split(" - ")
    : ["", ""];
  const cardRef = useRef<HTMLDivElement>(null);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", options);
  };

  const formattedRange = `${formatDate(startStr)} - ${formatDate(endStr)}`;
  const isJobCard = cardStyle === "job-card";

  return (
    <div
      ref={cardRef}
      className={`collapse-card-block w-full border border-b border-[#A7A7A740] overflow-hidden ${mainClass}`}
    >
      <div className={`flex flex-col md:flex-row w-full items-start`}>
        {isJobCard ? (
          <div
            className={`w-full p-4 md:p-6 border-b-0 border-[#A7A7A740] md:self-stretch 
          md:border-r md:flex-[0_0_260]`}
          >
            <div className="px-5.5 py-4.5 border border-[#A7A7A740]">
              <div className="relative h-16 w-full overflow-hidden">
                {post.thumbnail?.url ? (
                  <Image
                    src={post.thumbnail.url}
                    alt={post.thumbnail.alt || "Promotion"}
                    fill
                    loading="lazy"
                    className="object-cover w-auto! mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-[10px] tracking-widest uppercase">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`w-full p-4 md:p-6 border-b-0 border-[#A7A7A740] md:self-stretch 
          ${flexClass} md:border-r`}
          >
           <div className="relative aspect-402/242 w-full h-full overflow-hidden">
              {post.thumbnail?.url ? (
                <Image
                  src={post.thumbnail.url}
                  alt={post.thumbnail.alt || "Promotion"}
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-[10px] tracking-widest uppercase">
                  No Image
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={`flex-1 flex flex-col min-w-0 ${isJobCard ? "h-[stretch] w-full border-t border-(--border-gray-light) md:border-t-0" : ""} `}
        >
          <div
            className={`p-4 md:p-6 flex flex-col h-full ${
              isJobCard
                ? "justify-between flex-row" // ✅ center content ONLY for job-career
                : cardStyle === "horizontal-card"
                  ? "gap-3"
                  : "justify-between min-h-37.5 md:min-h-60.5"
            }`}
          >
            <div
              className={`flex flex-col gap-3 ${isJobCard ? " justify-center" : ""}`}
            >
              {post?.selected_stores && post?.selected_stores?.length > 0 && (
                <span className="w-fit text-[14px] font-normal text-[#141414] tracking-widest uppercase leading-5">
                  {post.selected_stores[0].name.replace(/&amp;/g, "&")}
                </span>
              )}
              {post.job_stores_name && (
                <Link
                  className="no-underline"
                  aria-label="job location"
                  href={post.job_stores_url || "#"}
                >
                  <span className="w-fit text-[14px] font-normal text-[#141414] tracking-widest uppercase leading-5">
                    {post.job_stores_name.replace(/&amp;/g, "&")}
                  </span>
                </Link>
              )}

              <div
                className={`flex flex-col gap-1 ${isJobCard ? "gap-3" : ""}`}
              >
                <div
                  className="tru-tile-heading text-[20px] md:text-[24px]  font-(family-name:--font-larken)
                  font-normal text-[#141414] leading-7 md:leading-9"
                  dangerouslySetInnerHTML={{ __html: post.title || "" }}
                />

                {isJobCard
                  ? null
                  : post.short_description && (
                      <p className="mb-0 mt-1">{post.short_description}</p>
                    )}

                {isJobCard
                  ? null
                  : rawDateRange && (
                      <div
                        className="text-[14px] mt-2 md:text-[16px] font-medium text-[#646464] leading-6"
                        dangerouslySetInnerHTML={{
                          __html: formattedRange || "",
                        }}
                      />
                    )}
              </div>

              {cardStyle === "horizontal-card" && (
                <div
                  className="text-[14px] md:text-[16px] text-[#646464] leading-6 font-normal"
                  dangerouslySetInnerHTML={{ __html: detailedContent }}
                />
              )}
              {/* {post.links && post.links.length > 0 && post.links.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.cta?.url || '#'}
                  target={link.cta?.target || '_self'}
                  className="relative z-10"
                >
                  <span className="text-[16px] md:text-[18px] no-underline font-medium text-[#141414] ">
                    {link.cta?.title || link.title} 
                  </span>
                </Link>
              ))} */}
            </div>

            <div
              className={
                // cardStyle === "horizontal-card" ? "mt-0" : (isJobCard ? "mt-6 md:mt-0 flex" : "") : "mt-6 md:mt-0"
                cardStyle === "horizontal-card"
                  ? "mt-0"
                  : isJobCard
                    ? "mt-0 md:mt-0 flex"
                    : "mt-0 md:mt-0"
              }
            >
              {
                cardStyle === "horizontal-card" ? (
                  disableCta !== "yes" &&
                  post.link && (
                    <Link
                      href={`${post.link}`}
                      onClick={(e) => clickPushToDataLayer(e)}
                      data-clickeventname="cta_click"
                      data-title="View Detail"
                      data-eventcategory={sectionTitle}
                      data-tag={post.title}
                      className="layout-cta"
                    >
                      <span className="text-[16px] md:text-[18px] font-medium text-[#141414]  decoration-1 underline-offset-4 cursor-pointer hover:opacity-70 transition-opacity">
                        View Detail
                      </span>
                    </Link>
                  )
                ) : isJobCard ? (
                  <div className="flex justify-between items-center self-center">
                    <Link
                      href="#"
                      onClick={(e) => {
                        pushCardsToDataLayer(e.currentTarget, e.type);
                        setIsExpanded(!isExpanded);
                      }}
                      className="flex layout-cta items-center pb-0 gap-3 group focus:outline-none underline-offset-4 cursor-pointer"
                      data-clickeventname="cta_click"
                      data-title={isExpanded ? "Show Less" : "Show More"}
                      data-eventcategory={sectionTitle}
                      data-tag={post.title}
                      data-index={window.location.origin + pathname}
                    >
                      {/* <span className="text-[18px]  font-medium text-[#141414] leading-6">
                        {isExpanded ? "Show Less" : "Show More"}
                      </span> */}
                      <div
                        className={`text-[#000000] transition-transform flex items-center justify-center duration-500 w-6 h-6 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <i className="icon-chevron-arrow rotate-180 text-[10px]"></i>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="flex justify-between items-end">
                    <Link
                      href="#"
                      onClick={(e) => {
                        pushCardsToDataLayer(e.currentTarget, e.type);
                        setIsExpanded(!isExpanded);
                      }}
                      className="flex layout-cta items-center pb-0 gap-3 group focus:outline-none underline-offset-4 cursor-pointer"
                      data-clickeventname="cta_click"
                      data-title={isExpanded ? "Show Less" : "Show More"}
                      data-eventcategory={sectionTitle}
                      data-tag={post.title}
                      data-index={window.location.origin + pathname}
                    >
                      <span className="text-[18px]  font-medium text-[#141414] leading-6">
                        {isExpanded ? "Show Less" : "Show More"}
                      </span>
                      <div
                        className={`text-[#000000] transition-transform flex items-center justify-center duration-500 w-6 h-6 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <i className="icon-chevron-arrow rotate-180 text-[10px]"></i>
                      </div>
                    </Link>
                  </div>
                )

                // <div className="flex justify-between items-end">
                //   <Link
                //     href="#"
                //     onClick={(e) => {pushCardsToDataLayer(e.currentTarget,e.type); setIsExpanded(!isExpanded)}}
                //     className="flex layout-cta items-center pb-0 gap-3 group focus:outline-none underline-offset-4 cursor-pointer"
                //     data-clickeventname="cta_click"
                //     data-title={isExpanded ? "Show Less" : "Show More"}
                //     data-eventcategory={sectionTitle}
                //     data-tag={post.title}
                //     data-index={window.location.origin + pathname}
                //   >

                //     <span className="text-[18px]  font-medium text-[#141414] leading-6">
                //       {isExpanded ? "Show Less" : "Show More"}
                //     </span>
                //     <div
                //       className={`text-[#000000] transition-transform flex items-center justify-center duration-500 w-6 h-6 ${isExpanded ? "rotate-180" : ""}`}
                //     >
                //       <i className="icon-chevron-arrow rotate-180 text-[10px]"></i>
                //     </div>
                //   </Link>
                // </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`border-t border-[#A7A7A740] p-4 md:p-6 ${isJobCard ? "p-6" : ""}`}
          >
            <div
              className={`text-[16px] md:text-[16px] text-[#646464] leading-6 font-normal ${isJobCard ? "careers-detail" : ""}`}
              dangerouslySetInnerHTML={{ __html: detailedContent }}
            />

            {isJobCard
              ? post.link && (
                  <div className="mt-6">
                    <Link
                      className="text-(--dark-heading) text-lg leading-6 font-medium"
                      href={post.link}
                    >
                      Apply Online
                    </Link>
                  </div>
                )
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
