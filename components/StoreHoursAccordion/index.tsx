"use client";
import { BlockData } from "@/types/global";
import SectionIntroBlock from "../SectionIntroBlock";
import Link from "next/link";
import { useState } from "react";
import { clickPushToDataLayer } from "@/utils/utility";

const CARD_WRAPPER_CLASS =
  "item-wrapper h-full xl:p-8 py-4 md:[&_h5]:text-2xl [&_h5]:text-xl px-6 border border-[#A7A7A740] bg-white";

const ACCORDION_HEADER_CLASS =
  "flex justify-between items-center cursor-pointer md:cursor-default";

const ACCORDION_CONTENT_BASE =
  "grid transition-all duration-300 ease-in-out overflow-hidden";

const LIST_ITEM_CLASS =
  "py-6 first:pt-3 first:border-t-0 border-t border-[#A7A7A740] my-0! list-none";

const NOTICE_TEXT_CLASS = "mt-6 text-sm text-gray-500 mb-0";

const CTA_LINK_CLASS =
  "underline mt-6 text-(--dark-heading)! layout-cta inline-block font-medium";

type MallHoursBlockProps = {
  data: BlockData;
};

const WEEK_DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tues", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thurs", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

function groupOpeningHours(hours: Record<string, string>) {
  const result: { label: string; hours: string }[] = [];

  let startIndex = 0;
  let prevHours = "";
  let isFirst = true;

  WEEK_DAYS.forEach((day, index) => {
    const currentHours = hours[day.key];
    if (!currentHours) return;

    if (isFirst) {
      startIndex = index;
      prevHours = currentHours;
      isFirst = false;
      return;
    }

    if (currentHours !== prevHours) {
      const startDay = WEEK_DAYS[startIndex].label;
      const endDay = WEEK_DAYS[index - 1].label;

      result.push({
        label: startDay === endDay ? startDay : `${startDay} to ${endDay}`,
        hours: prevHours,
      });

      startIndex = index;
      prevHours = currentHours;
    }
  });

  if (!isFirst) {
    const startDay = WEEK_DAYS[startIndex].label;
    const endDay = WEEK_DAYS[WEEK_DAYS.length - 1].label;

    result.push({
      label: startDay === endDay ? startDay : `${startDay} to ${endDay}`,
      hours: prevHours,
    });
  }

  return result;
}

export default function StoreHoursAccordion({ data }: MallHoursBlockProps) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  function formatHours(hours: string) {
    return hours
      .replace(/(am|pm)/gi, (m) => ` ${m.toUpperCase()}`)
      .replace(/\s+/g, " ") // Clean up any resulting double spaces
      .replace(/\s*-\s*/g, " – ")
      .trim();
  }

  const parsedMallData = data?.mall_data ? JSON.parse(data.mall_data) : null;

  const mallHoursData = parsedMallData?.mall_hours ?? null;
  const StatutoryHolidayHours = parsedMallData?.statutory_holiday_hours ?? null;
  const StatutoryHoliday = parsedMallData?.statutory_holidays ?? null;

  const groupedHours = data.mallHours?.hours
    ? groupOpeningHours(data.mallHours.hours)
    : [];

  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;
  return (
    <div
      className={`tru-block store-hours-block ${data?.additional_classes}
      md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)`}
      style={spacingStyles}
    >
      <div className="main-container">
        {(data?.section_title || data?.section_subTitle || data?.cta?.url) && (
          <SectionIntroBlock data={data} />
        )}
        <div className="container">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 ">
            <div key={1} className="h-full">
              <div className={`relative ${CARD_WRAPPER_CLASS}`}>
                <div
                  className={ACCORDION_HEADER_CLASS}
                  onClick={() => toggleAccordion(1)}
                >
                  <h5 className="text-[24px] text-(--dark-heading)! font-semibold mb-0 tru-tile-heading">
                    {mallHoursData?.title}
                  </h5>
                  <div
                    className={`md:hidden text-(--dark-heading)! transition-transform origin-center duration-300 ${
                      openAccordion === 1 ? "rotate-180" : ""
                    }`}
                  >
                    <i className="icon-icon-down text-sm "></i>
                  </div>
                </div>

                <div
                  className={`${ACCORDION_CONTENT_BASE}
                  ${
                    openAccordion === 1
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  } md:grid-rows-[1fr] md:opacity-100 md:mt-2`}
                >
                  <div className="min-h-0">
                    <div>
                      <div>
                        {mallHoursData?.subtitle && (
                          <div
                            className="mt-2 text-(--primary-text)"
                            dangerouslySetInnerHTML={{
                              __html: mallHoursData?.subtitle,
                            }}
                          ></div>
                        )}
                        <ul className="mt-6 [&_p]:mb-0! ml-0">
                          {groupedHours.map((item, index) => (
                            <li key={index} className={LIST_ITEM_CLASS}>
                              <div className="flex  lg:flex-col 3xl:flex-row flex-col md:gap-4 xl:flex-nowrap flex-wrap xm:flex-row sm:flex-nowrap md:flex-wrap xxl:flex-nowrap  sm:flex-row gap-4 ">
                                <p className=" min-w-40 text-(--dark-heading)!  font-medium">
                                  {item.label}
                                </p>
                                <p className="flex gap-2   text-(--dark-heading)! items-center">
                                  <i className="icon-clock"></i>
                                  <span>{formatHours(item.hours)}</span>
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="relative md:absolute bottom-0 md:px-6 px-0  left-0 right-0  pb-0 md:pb-8">
                        {mallHoursData?.notice ? (
                          <p className={NOTICE_TEXT_CLASS}>
                            {mallHoursData.notice}
                          </p>
                        ) : null}
                        {mallHoursData?.cta?.url && (
                          <Link
                            href={mallHoursData.cta.url || "#"}
                            className={CTA_LINK_CLASS}
                            target={mallHoursData.cta.target || "_self"}
                            onClick={clickPushToDataLayer}
                            data-clickeventname="cta_click"
                            data-title={mallHoursData.cta.title}
                            data-eventcategory={data?.section_title}
                            data-tag={mallHoursData?.title}
                          >
                            {mallHoursData.cta.title}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div key={2} className="h-full">
              <div className={CARD_WRAPPER_CLASS}>
                <div
                  className={ACCORDION_HEADER_CLASS}
                  onClick={() => toggleAccordion(2)}
                >
                  <h5 className="text-[24px] text-(--dark-heading)! font-semibold mb-0 tru-tile-heading">
                    {StatutoryHolidayHours?.title}
                  </h5>
                  <div
                    className={`md:hidden text-(--dark-heading)! transition-transform duration-300 ${
                      openAccordion === 2 ? "rotate-180" : ""
                    }`}
                  >
                    <i className="icon-icon-down text-sm"></i>
                  </div>
                </div>

                <div
                  className={`${ACCORDION_CONTENT_BASE}
                  ${
                    openAccordion === 2
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  } md:grid-rows-[1fr] md:opacity-100 md:mt-2`}
                >
                  <div className="min-h-0">
                    {StatutoryHolidayHours?.subtitle && (
                      <div
                        className="mt-2 text-(--primary-text)"
                        dangerouslySetInnerHTML={{
                          __html: StatutoryHolidayHours?.subtitle,
                        }}
                      ></div>
                    )}
                    <div></div>

                    {Array.isArray(data.holidayHours) &&
                      data.holidayHours.length > 0 && (
                        <ul className="mt-6 [&_p]:mb-0! ml-0">
                          {data.holidayHours.map((holiday, index) => (
                            <li key={index} className={LIST_ITEM_CLASS}>
                              <div className=" flex flex-row md:gap-6 flex-wrap xl:flex-nowrap xl:flex-row gap-4 sm:gap-6 [&_.dayLabel]:md:w-40! [&_.dayLabel]:w-full!">
                                <div className=" dayLabel min-w-40  text-(--dark-heading)! font-medium">
                                  {holiday.day}
                                </div>
                                <div className="flex gap-2  text-(--dark-heading)! 5xl:flex-wrap xl:items-start items-start md:items-center">
                                  <span>
                                    <i className="icon-date"></i>
                                  </span>
                                  <span>
                                    <span
                                      className={`xl:block sm:inline-block ${(() => {
                                        const [day, month, year] = holiday.date
                                          .split("/")
                                          .map(Number);

                                        const dateObj = new Date(year, month - 1, day);

                                        const monthLength = dateObj.toLocaleDateString("en-US", {
                                          month: "long",
                                        }).length;

                                        return `${monthLength > 6 ? "md:block" : "5xl:inline-block"} `;
                                      })()}`}
                                    >
                                      {(() => {
                                        const [day, month, year] = holiday.date
                                          .split("/")
                                          .map(Number);
                                        const dateObj = new Date(
                                          year,
                                          month - 1,
                                          day,
                                        );

                                        return dateObj.toLocaleDateString(
                                          "en-US",
                                          {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                          },
                                        );
                                      })()}{" "}
                                    </span>
                                    <span className="mx-0.5 hidden 5xl:inline-block xl:hidden sm:inline-block">
                                      |
                                    </span>
                                    <span className="uppercase">
                                      {holiday.open} – {holiday.close}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    {StatutoryHolidayHours?.notice ? (
                      <p className={NOTICE_TEXT_CLASS}>
                        {StatutoryHolidayHours.notice}
                      </p>
                    ) : null}
                    {StatutoryHolidayHours?.cta?.url && (
                      <Link
                        href={StatutoryHolidayHours.cta.url || "#"}
                        className={CTA_LINK_CLASS}
                        target={StatutoryHolidayHours.cta.target || "_self"}
                        onClick={clickPushToDataLayer}
                        data-clickeventname="cta_click"
                        data-title={StatutoryHolidayHours.cta.title}
                        data-eventcategory={data?.section_title}
                        data-tag={StatutoryHolidayHours?.title}
                      >
                        {StatutoryHolidayHours.cta.title}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div key={3} className="h-full">
              <div className={CARD_WRAPPER_CLASS}>
                <div
                  className={ACCORDION_HEADER_CLASS}
                  onClick={() => toggleAccordion(3)}
                >
                  <h5 className="text-[24px] text-(--dark-heading)! font-semibold mb-0 tru-tile-heading">
                    {StatutoryHoliday?.title}
                  </h5>
                  <div
                    className={`md:hidden transition-transform duration-300 ${
                      openAccordion === 3 ? "rotate-180" : ""
                    }`}
                  >
                    <i className="icon-icon-down text-(--dark-heading)! text-sm"></i>
                  </div>
                </div>

                <div
                  className={`${ACCORDION_CONTENT_BASE}
                  ${
                    openAccordion === 3
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  } md:grid-rows-[1fr] md:opacity-100 md:mt-2`}
                >
                  <div className="min-h-0">
                    {StatutoryHoliday?.subtitle && (
                      <div
                        className="mt-2 text-(--primary-text)"
                        dangerouslySetInnerHTML={{
                          __html: StatutoryHoliday?.subtitle,
                        }}
                      ></div>
                    )}
                    <div></div>
                    {Array.isArray(data.holidays) &&
                      data.holidays.length > 0 && (
                        <ul className="mt-6 [&_p]:mb-0! ml-0">
                          {data.holidays.map((holiday, index) => (
                            <li key={index} className={LIST_ITEM_CLASS}>
                              <div className="flex flex-col md:gap-4 flex-wrap xm:flex-row md:flex-col xl:flex-row xl:flex-nowrap sm:flex-row gap-4">
                                <p className="min-w-40 sm:basis-40  md:basis-0 text-(--dark-heading)! font-medium">
                                  {holiday.day}
                                </p>
                                <p className="flex shrink-0 gap-2 text-(--dark-heading)! items-center">
                                  <i className="icon-date"></i>
                                  {(() => {
                                    const [day, month, year] = holiday.date
                                      .split("/")
                                      .map(Number);
                                    const dateObj = new Date(
                                      year,
                                      month - 1,
                                      day,
                                    );
                                    return dateObj.toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    });
                                  })()}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    {StatutoryHoliday?.notice ? (
                      <p className={NOTICE_TEXT_CLASS}>
                        {StatutoryHoliday.notice}
                      </p>
                    ) : null}
                    {StatutoryHoliday?.cta?.url && (
                      <Link
                        href={mallHoursData.cta.url || "#"}
                        className={CTA_LINK_CLASS}
                        target={mallHoursData.cta.target || "_self"}
                        onClick={clickPushToDataLayer}
                        data-clickeventname="cta_click"
                        data-title={mallHoursData.cta.title}
                        data-eventcategory={data?.section_title}
                        data-tag={StatutoryHoliday?.title}
                      >
                        {mallHoursData.cta.title}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
