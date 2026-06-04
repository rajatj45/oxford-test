"use client";

import { getBaseUrl, pushCardsToDataLayer } from "@/utils/utility";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  sectionTitle?:string;
  className?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onLoadMore,
  hasMore,
  loading,
  className,
  sectionTitle
}) => {
  if (!hasMore) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e?.currentTarget;
    const href = target?.getAttribute('href') || "";

    if (!href || href.trim() === "") {
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      target?.setAttribute("data-index", currentUrl);
    } else {
      target?.setAttribute("data-index", `${getBaseUrl().replace(/\/$/, '')}/${href.replace(/^\//, '')}`);
    }
    pushCardsToDataLayer(e.currentTarget,e.type)

    onLoadMore();
  };

  return (
    <div className={`text-center ${className}`}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          text-[#141414] underline hover:no-underline text-[18px] font-medium cursor-pointer leading-6
          ${loading ? "opacity-50 cursor-not-allowed" : "hover:text-gray-600 active:scale-95"}
        `}
        data-clickeventname="button_click"
        data-title={"Load More"}
        data-eventcategory={sectionTitle}
        data-tag={sectionTitle}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            Loading...
          </span>
        ) : (
          "Load More"
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;
