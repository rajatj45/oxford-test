"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { OpeningHoursData, HolidayHoursDay, HolidayHour } from "@/types/global";
import { clickPushToDataLayer, pushCardsToDataLayer } from "@/utils/utility";

interface OpeningHoursProps {
  className?: string;
  data: OpeningHoursData;
  holidayOpenHoursData: HolidayHoursDay[];
  holidaysClosedData: HolidayHour[];
}

const WEEK_DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tues", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thurs", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function OpeningHoursDropdown({
  className,
  data,
  holidayOpenHoursData,
  holidaysClosedData,
}: OpeningHoursProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!data) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".hours-dropdown")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [data]);

  function formatHours(hours: string) {
    return hours
      .replace(/\s*(am|pm)/gi, " $1")
      .replace(/(am|pm)/g, (m) => m.toUpperCase())
      .replace(/-/g, " – ");
  }

  const ctas = Array.isArray(data?.cta)
    ? data.cta
    : data?.cta
      ? [data.cta]
      : [];

  const handleRedirect = (url: string) => {
    setOpen(false);
    window.location.href = url;
  };
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const isCurrentWeek = (dateStr: string | undefined) => {
    if (!dateStr) return false;

    const holidayDate = parseDate(dateStr);
    const today = new Date();

    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate Sunday of the current week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return holidayDate >= startOfWeek && holidayDate <= endOfWeek;
  };

  const getDayName = (dateStr: string) => {
    return parseDate(dateStr).toLocaleDateString("en-US", { weekday: "long" });
  };

 const currentWeekOpen = Array.isArray(holidayOpenHoursData)
  ? holidayOpenHoursData.filter(
      (h) => h.date && isCurrentWeek(h.date)
    )
  : [];

const currentWeekClosed = Array.isArray(holidaysClosedData)
  ? holidaysClosedData.filter(
      (h) => h.date && isCurrentWeek(h.date)
    )
  : [];

  const holidayDayNames = [
    ...currentWeekOpen.map((h) => (h.date ? getDayName(h.date) : h.day)),
    ...currentWeekClosed.map((h) => (h.date ? getDayName(h.date) : h.day)),
  ];

  const filteredWeekDays = WEEK_DAYS.filter(
    (day) => !holidayDayNames.includes(day.label),
  );

  const fullWeekSchedule = WEEK_DAYS.map((day) => {
    const dayName = day.label;

    const closedDay = currentWeekClosed.find(
      (h) => (h.date ? getDayName(h.date) : h.day) === dayName,
    );
    if (closedDay) return { label: dayName, hours: "CLOSED", isHoliday: true };

    const openDay = currentWeekOpen.find(
      (h) => (h.date ? getDayName(h.date) : h.day) === dayName,
    );
    if (openDay)
      return {
        label: dayName,
        hours: `${openDay.open} – ${openDay.close}`,
        isHoliday: true,
      };

    return {
      label: dayName,
      hours: data?.hours?.[day.key] || "",
      isHoliday: false,
    };
  });

  const finalDisplayList: { label: string; hours: string }[] = [];
  let startIdx = 0;

  fullWeekSchedule.forEach((day, index) => {
    const isLast = index === fullWeekSchedule.length - 1;
    const nextDay = fullWeekSchedule[index + 1];

    if (
      isLast ||
      day.hours !== nextDay.hours ||
      day.isHoliday ||
      nextDay.isHoliday
    ) {
      const startLabel = fullWeekSchedule[startIdx].label;
      const endLabel = day.label;

      finalDisplayList.push({
        label:
          startLabel === endLabel ? startLabel : `${startLabel} to ${endLabel}`,
        hours: day.hours,
      });
      startIdx = index + 1;
    }
  });

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaySchedule = fullWeekSchedule.find((d) => d.label === todayName);
  const isTodayClosed = todaySchedule?.hours === "CLOSED";
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to ensure scroll returns if component closes unexpectedly
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);
  return (
    <>
      <div className={`static sm:relative text-sm hours-dropdown ${className}`}>
        <div className="flex gap-1">
          <div
            className={`${isTodayClosed ? " flex items-center " : "flex-wrap"}`}
          >
            {data.showing && (
              <span className="font-medium text-(--dark-heading) xm:text-[14px]  3xl:text-base">
                {isTodayClosed ? "Closed Today" : data.showing}
              </span>
            )}

            <button
              onClick={(e) => {
                setOpen((prev) => !prev);
                pushCardsToDataLayer(e?.currentTarget, e?.type || "click");
              }}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="flex items-center lg:items-start gap-2 font-medium"
              data-clickeventname="button_click"
              data-title={data.showing}
              data-eventcategory={data.showing}
              data-tag={data.showing}
            >
              <div className="flex flex-col items-start">
                <div
                  className={`flex items-center gap-2 ${isTodayClosed ? "lg:items-center" : "lg:items-start"}`}
                >
                  <div className={`flex flex-col items-start `}>
                    {!isTodayClosed && (
                      <div
                        className={`flex items-start md:items-center  3xl:gap-2 cursor-pointer ${open}`}
                      >
                        <span className="text-(--dark-heading) uppercase font-normal whitespace-nowrap 2xl:text-base text-[12px] xm:text-[13px] 3xl:text-base">
                          {formatHours(
                            todaySchedule?.hours || data.today_hours,
                          )}
                        </span>
                        <span className="w-6 h-6 hidden md:block">
                          <i
                            className={`icon-caret-down text-[7px] text-(--dark-heading) cursor-pointer hidden lg:inline-block transition-transform  ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {isTodayClosed && (
                <i
                  className={`icon-caret-down text-[7px] text-(--dark-heading) cursor-pointer hidden lg:inline-block transition-transform  ${
                    open ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          </div>

          <button
            onClick={(e) => {
              setOpen((prev) => !prev);
              pushCardsToDataLayer(e?.currentTarget, e?.type || "click");
            }}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex  items-center font-medium lg:hidden"
            data-clickeventname="button_click"
            data-title={data.showing}
            data-eventcategory={data.showing}
            data-tag={data.showing}
          >
            <span className="w-6 h-6">
              <i
                className={`icon-caret-down  text-[8px] xl:text-[10px] cursor-pointer lg:hidden inline-block transition-transform text-black ${
                  open ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
        </div>
        {open && (
          <div className="absolute w-full right-0 lg:left-0 mt-4 sm:w-92.5 bg-white shadow-md z-999">
            <ul className="px-4 ml-0">
              {finalDisplayList.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between text-(--dark-heading) py-6 border-b border-(--border-gray-light) last:border-b-0"
                >
                  <span className="font-medium min-w-[120px]">
                    {item.label}
                  </span>
                  <span className="flex gap-2 items-center">
                    {item.hours !== "CLOSED" && (
                      <i className="icon-clock w-4"></i>
                    )}
                    <span
                      className={
                        item.hours === "CLOSED"
                          ? "text-xs font-semibold uppercase"
                          : ""
                      }
                    >
                      {item.hours === "CLOSED"
                        ? "Closed"
                        : formatHours(item.hours)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {ctas.length > 0 && (
              <div className="p-4 border-t border-(--border-gray-light)">
                {ctas.map((item, index) => (
                  <Button
                    key={index}
                    item={{
                      title: item.title,
                      url: item.url,
                      ariaLabel: item.title,
                    }}
                    button_style="solid"
                    mainClass="w-full min-w-full font-normal no-underline"
                    onClick={(e) =>
                      item.url
                        ? (setOpen(false), (window.location.href = item.url))
                        : clickPushToDataLayer ||
                          pushCardsToDataLayer(
                            e?.currentTarget,
                            e?.type || "click",
                          )
                    }
                    sectionTitle={data.showing}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {open && (
        <div className="fixed top-55 dropDownOverlay xm:top-50 block sm:hidden inset-0 bg-black/50 z-40" />
      )}
    </>
  );
}
