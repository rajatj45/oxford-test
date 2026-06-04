"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { BlockData } from "@/types/global";

import SectionIntroBlock from "../SectionIntroBlock";

import { pushCardsToDataLayer } from "@/utils/utility";

import LoadMoreButton from "../LoadMoreButton";

import { usePagination } from "@/hooks/usePagination";

import { usePopup } from "@/context/PopupContext";

const Accordian = ({ data }: { data: BlockData }) => {
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

  const accordianRef = useRef<HTMLDivElement>(null);

  const { isPopupOpen } = usePopup();

  const paginationConfig = useMemo(
    () => ({
      ...data,

      posts_per_page: data?.number_of_posts?.toString(),
    }),

    [data],
  );

  const { items, status, loadMore, hasMore, isLoading } =
    usePagination(paginationConfig);

  useEffect(() => {
    if (isPopupOpen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pushCardsToDataLayer(entry.target as HTMLElement);

          observer.unobserve(entry.target);
        }
      },

      { threshold: 0.2 },
    );

    if (accordianRef.current) observer.observe(accordianRef.current);

    return () => observer.disconnect();
  }, [isPopupOpen]);

  if (!data) return null;

  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,

    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,

    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,

    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  return (
    <>
      <div
        className={`tru-block accordian ${data?.additional_classes}

        md:pt-(--spaceTop)

        md:pb-(--spaceBottom)

        pb-(--spaceBottomMobile)

        pt-(--spaceTopMobile)`}
        ref={accordianRef}
        data-vieweventname="accordian_view"
        data-title={data?.section_title}
        data-index={data?.section_title}
        data-eventcategory={data?.section_title}
        data-tag={data?.section_title}
        style={spacingStyles}
      >
        {items.length === 0 ? (
          status === "error" ? (
            <div className="text-center">
              <h2 className="text-3xl font-bold">Unauthorized access!</h2>
            </div>
          ) : (
            <></>
          )
        ) : (
          <div className="main-container">
            {(data.section_title || data.section_subTitle || data.cta) && (
              <SectionIntroBlock data={data} />
            )}
            <div className="container">
              <div className="border border-[#A7A7A740]">
                {items.map((item, index) => {
                  const isOpen = openItemIndex === index;

                  const id = `accordion-header-${index}`;

                  const panelId = `accordion-panel-${index}`;

                  return (
                    <div
                      key={index}
                      className="border-b border-[#A7A7A740] last:border-b-0"
                    >
                      <h3>
                        <button
                          type="button"
                          id={id}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="cursor-pointer  flex justify-between items-center w-full min-h-[72px] px-7 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hover:bg-gray-50 transition-colors duration-150"
                          //onClick={() => setOpenItemIndex(isOpen ? null : index)}

                          onClick={(e) => {
                            setOpenItemIndex(isOpen ? null : index);

                            pushCardsToDataLayer(e.currentTarget, e.type);
                          }}
                          data-clickeventname="button_click"
                          data-title={item.title}
                          data-index={index + 1}
                          data-eventcategory={data?.section_title}
                          data-tag={data?.section_title}
                        >
                          {item.title && (
                            <span
                              className="text-[18px] text-gray-800 font-(family-name:--font-secondary) leading-6"
                              dangerouslySetInnerHTML={{ __html: item.title }}
                            />
                          )}
                          <span className="w-6 h-6 shrink-0 flex items-center justify-center">
                            <i
                              className={`demo-icon icon-arrow-down text-[#141414] transition-transform duration-300 ${
                                isOpen ? "rotate-180" : "rotate-0"
                              }`}
                              style={{ fontSize: "9px" }}
                              aria-hidden="true"
                            ></i>
                          </span>
                        </button>
                      </h3>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={id}
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0 pointer-events-none"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-7 py-4 border-t border-[#A7A7A740]">
                            <div
                              className="text-gray-600 text-base"
                              dangerouslySetInnerHTML={{
                                __html: item.content || "",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {data.enable_load_more?.includes("yes") && hasMore && (
                <div className="mt-10">
                  <LoadMoreButton
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    loading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Accordian;
