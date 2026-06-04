"use client";

import { COMPONENT_MAP, getBaseUrl, pushCardsToDataLayer } from "@/utils/utility";
import Button from "@/components/Button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BlockData, Tab } from "@/types/global";
import React from "react";

export default function TabsBlock({ data }: { data: BlockData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabData: Tab[] = data?.tab_data ? JSON.parse(data.tab_data) : [];

  const currentTabName = searchParams.get("displayView");
  const activeTabIndex = tabData.findIndex(
    (tab) => tab.tab_slug.toLowerCase() === currentTabName?.replaceAll("-", " ").toLowerCase()
  );
  const safeActiveIndex = React.useMemo(() => {
    if (!currentTabName) return 0;

    const index = tabData.findIndex(
      (tab) => tab.tab_slug.toLowerCase().replaceAll(" ", "-") === currentTabName.toLowerCase()
    );

    return index === -1 ? 0 : index;
  }, [currentTabName, tabData]);

  const handleTabClick = (index: number, slug: string, e?: React.MouseEvent<HTMLElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const paramUrl = slug.toLowerCase().replaceAll(" ", "-");
    params.set("displayView", paramUrl);
    router.push(pathname + "?" + params.toString(), { scroll: false });
    const target = e?.currentTarget;
    const href = target?.getAttribute('href') || "";
    if (!href || href.trim() === "") {
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";

      target?.setAttribute("data-index", currentUrl);
    } else {
      target?.setAttribute("data-index", `${getBaseUrl().replace(/\/$/, '')}/${href.replace(/^\//, '')}`);
    }
    pushCardsToDataLayer(e?.currentTarget, e?.type);
  };

  const customTabClass = `tab-style-${pathname.replace("/", "")}`;

  return (
    <div className={`tabs-block-container my-16 md:my-20 ${customTabClass} ${data.additional_classes}
     `}>
      <div className="flex justify-start md:justify-center border-b border-[#d6d6d6] tab-outer relative overflow-x-scroll">
        {tabData.map((tab, index) => {
          const sectionTitle = tab.tab_blocks[0]?.section_title?.trim() || tab.tab_name;
          return (
            <div key={`btn-${index}`} className="tab-name">
              <Button
                sectionTitle={sectionTitle}
                onClick={(e) => handleTabClick(index, tab.tab_slug, e)}
                mainClass={`tab-button font-normal flex items-center gap-2 whitespace-nowrap text-lg no-underline! min-w-[247px] px-2 md:px-4 py-2 md:py-3.5 cursor-pointer border-b-2 ${
                  safeActiveIndex === index ? "tab-active border-(--secondary)" : "border-transparent"
                }`}
                item={{ title: tab.tab_name, beforeIcon:  tab.tab_icon}}

              />

            </div>
          );
        })}
      </div>

      <div className="tab-panels-wrapper w-full">
        {tabData.map((tab, index) => (
          <div
            key={`panel-${index}`}
            className={safeActiveIndex === index ? "block" : "hidden"}
          >
            {tab.tab_blocks.map((block, idx) => {
              const Component = COMPONENT_MAP[block.tag as keyof typeof COMPONENT_MAP];
              return Component ? <Component key={idx || `${block.tag}-${idx}`} data={block} /> : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
