import { clickPushToDataLayer } from "@/utils/utility";
import Link from "next/link";
import React from "react";

interface SectionProps {
  title: string;
  viewAllHref?: string;
  withBorder?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const sectionWrapperClass = "pr-0 md:pr-10";
const sectionBorderClass = "md:border-l md:border-(--bg-gray) md:pl-10";
const sectionHeaderClass = "flex justify-between items-center mb-8 [&_h3]:text-[40px]";
const viewAllBtnClass =
  " flex items-center text-lg text-(--dark-heading) font-medium underline";

const  Section = ({
  title,
  viewAllHref = "#",
  withBorder = false,
  className = "",
  children,
  onClick
}: SectionProps) => {

  return (
    <div className={`${withBorder ? sectionBorderClass : sectionWrapperClass} ${className}`}>
      <div className={sectionHeaderClass} onClick={onClick}>
        <h3 className="font-(family-name:--font-secondary) text-[28px]! md:text-[32px]!   leading-9 font-normal">{title}</h3>
        <Link href={viewAllHref} className={viewAllBtnClass} onClick={(e) => clickPushToDataLayer(e)} data-clickeventname="button_click" data-eventcategory={title} data-tag={title} data-title="View All">
          View All
        </Link>
      </div>
      {children}
    </div>
  );
};

export default Section;