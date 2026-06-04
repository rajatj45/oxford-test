"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuItem, SubMenu } from "@/types/global";
import { clickPushToDataLayer, getBaseUrl, pushCardsToDataLayer } from "@/utils/utility";

const cx = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");

interface MenuProps {
  menuItems: MenuItem[];
  location?: "header" | "footer";
  arialabelledBy?: string;
  menuClass?: string;
  itemClass?: string;
  subMenuClass?: string;
  menuLinkClass?: string;
  subItemMenuClass?: string;
  subItemLinkClass?: string;
  activeClassName?: string;
  matchMode?: "exact" | "startsWith";
   menuArrowClick?: (index: number) => void;
}

const isActiveLink = (item: MenuItem | SubMenu, path: string, mode: "exact" | "startsWith" = "exact"): boolean => {
  const itemUrl = item.url?.replace(/\/+$/, "") || "";
  const currentPath = path.replace(/\/+$/, "");
  const active = mode === "exact" ? itemUrl === currentPath : itemUrl && currentPath.startsWith(itemUrl);
  return !!(active || item.children?.some(child => isActiveLink(child, path, mode)));
};

const NavItem = ({ item, props, depth = 0 }: { item: MenuItem | SubMenu; props: MenuProps; depth?: number }) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const active = useMemo(() => isActiveLink(item, pathname, props.matchMode), [item, pathname, props.matchMode]);
const isExternal = item.url?.startsWith("http");
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    clickPushToDataLayer(e);

    if (!item.url || item.url === "#") {
      e.preventDefault();
      const firstChildUrl = item.children?.[0]?.url;
      if (firstChildUrl) window.location.href = firstChildUrl;
    }
  };

  const isSub = depth > 0;
  const hasChildren = !!item.children?.length;

  function menuArrowClick() {
    throw new Error("Function not implemented.");
  }

  return (
    <li
      className={cx(isSub ? props.subItemMenuClass : props.itemClass,
          !isSub && active && (props.activeClassName || "active"))}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setExpanded(false)}
    >
      <Link
        href={item.url || "#"}
        onClick={handleClick}
        prefetch={false}
        className={cx(isSub ? props.subItemLinkClass : props.menuLinkClass, item.title.replace(/\s+/g, "-"))}
        data-clickeventname={props.location === "footer" ? "nav_footer" : "nav_header"}
        data-title={item.title}
         target={isExternal ? "_blank" : undefined}

      >
        {item.title}
        {isSub && <span className="w-4 h-4"><i className="invisible text-(--dark-heading) text-[11px] group-hover/item:visible icon-arrow-right" /></span>}
      </Link>

      {hasChildren && (
        <>
          <button aria-expanded={expanded}  onClick={() => {
            setExpanded(!expanded);
            menuArrowClick();
          }}
  type="button">
            <span className="leading-0 duration-500 ease-in-out group-hover:rotate-180 flex items-center">
              <i className="icon-arrow-down text-[6px] text-(--dark-heading)"></i>
              <span className="invisible absolute">arrow down</span>
            </span>
          </button>
          <ul className={cx("sub", props.subMenuClass, !expanded && !isSub && "hidden")}>
            {item.children?.map((child, i) => (
              <NavItem key={i} item={child} props={props} depth={depth + 1}    />
            ))}
          </ul>
        </>
      )}
    </li>
  );
};

export default function MenuList(props: MenuProps) {
  const menuItems = Array.isArray(props.menuItems)
  ? props.menuItems
  : [];

  return (
    <nav aria-labelledby={props.arialabelledBy}>
      <ul className={cx("menu-list", props.menuClass)}>
        {menuItems.map((item, i) => (
          <NavItem key={i} item={item} props={props} />
        ))}
      </ul>
    </nav>
  );
}
