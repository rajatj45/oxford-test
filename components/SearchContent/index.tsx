"use client";
import { PostCardsProps, SearchResult } from "@/types/global";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import CollapseCard from "../CollapseCard";
import Card from "../Card";
import Preloader from "../Preloader";
import { pushCardsToDataLayer } from "@/utils/utility";
import LoadMoreButton from "../LoadMoreButton";

const SearchContent = () => {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";
  const [term, setTerm] = useState(queryFromUrl);
  const [lastSearchedTerm, setLastSearchedTerm] = useState("");
  const INITIAL_STORES = 6;
  const INITIAL_PAGES = 2;
  const INITIAL_BLOGS = 2;
  const INITIAL_EVENTS = 2;
  const INITIAL_STOREOFFERS = 2;
  const [visibleStores, setVisibleStores] = useState(INITIAL_STORES);
  const [visiblePages, setVisiblePages] = useState(INITIAL_PAGES);
  const [visibleBlogs, setVisibleBlogs] = useState(INITIAL_BLOGS);
  const [visibleEvents, setVisibleEvents] = useState(INITIAL_EVENTS);
  const [visibleStoreOffers, setVisibleStoreOffers] = useState(INITIAL_STOREOFFERS);
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const lastTrackedQuery = useRef("");

  const handleLoadMoreStores = () => setVisibleStores((prev) => prev + INITIAL_STORES);
  const handleLoadMorePages = () => setVisiblePages((prev) => prev + INITIAL_PAGES);
  const handleLoadMoreBlogs = () => setVisibleBlogs((prev) => prev + INITIAL_BLOGS);
  const handleLoadMoreEvents = () => setVisibleEvents((prev) => prev + INITIAL_EVENTS);
  const handleLoadMoreStoreOffers = () => setVisibleStoreOffers((prev) => prev + INITIAL_STOREOFFERS);

  useEffect(() => {
    if (queryFromUrl && queryFromUrl.trim().length >= 2) {
      setTerm(queryFromUrl);
      performSearch(queryFromUrl);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  // if (queryFromUrl) {
  //   setTerm(queryFromUrl);
  //   performSearch(queryFromUrl);
  // }
}, [queryFromUrl]);

  const performSearch = async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) return;
    setLastSearchedTerm(searchTerm)
    setLoading(true);
    const isGlobalSearch = searchParams.get("global_search") === "true";

    try {
      const res = await fetch(
        `/api/search?query=${encodeURIComponent(searchTerm)}`,
      );
      const data = await res.json();
      setResults(data.results || []);
      setSuggestions(data.suggestions || []);

      if (res.ok && lastTrackedQuery.current !== searchTerm) {
        if (inputRef.current) {
          inputRef.current.setAttribute("data-eventcategory", isGlobalSearch ? "Global Search" : "Landing page");
          inputRef.current.setAttribute("data-index", data.results.length.toString());
          pushCardsToDataLayer(inputRef.current as HTMLElement);
          lastTrackedQuery.current = searchTerm;
        }
      }
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (term.trim().length >= 2) {
      router.push(`/search?query=${encodeURIComponent(term)}`);
    }
  };

  const groupedResults = useMemo(() => {
    const formatStore = (r: SearchResult) => ({
      ...r,
      imageSrc: r?.thumbnail?.url || "/images/img-placeholder.jpg",
      cardLink: `/${r.post_type}/${r.slug}` || '',
    });
  const formatPage = (r: SearchResult) => {
    const slug = r.slug || '';
      
    return {
      ...r,
      link: slug,
    };
  };
    const formatBlog = (r: SearchResult) => ({
      ...r,
      link: `/blog/${r.slug}` || '',
    });
    const formatEvent = (r: SearchResult) => ({
      ...r,
      link: `/${r.post_type}/${r.slug}` || '',
    });
    return {
      page: results.filter((r) => r.post_type === `${process.env.NEXT_PUBLIC_PAGE_TYPE}`).map(formatPage),
      store: results.filter((r) => r.post_type === "store").map(formatStore),
      storeOffers: results.filter((r) => r.post_type ===   "store-offers"),
      blog: results.filter((r) => r.post_type === "post").map(formatBlog),
      events: results.filter((r) => r.post_type === "event").map(formatEvent),
    };
  }, [results]);
  return (
    <>
      <div className="py-16 md:py-20 ">
        <div className="container">
          <div className="xl:w-[1112px] w-full mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={inputRef}
                type="text"
                className="peer block w-full px-3 pr-8.75 py-2 border-y border-t-transparent border-x-transparent border-x border-(--primary-text) focus:border focus:border-(--secondary) focus:outline-none focus:border-b focus:border-transparent focus:border-b-(--secondary) text-[28px] leading-[36px] md:text-[40px] md:leading-[42px] text-(--dark-heading)  "
                placeholder="Search..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                data-clickeventname="view_search_results"
                data-vieweventname="view_search_results"
                data-title={term}
                data-eventcategory="Landing page"
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-1/2 cursor-pointer">
                <i className=" text-(--dark-heading) text-xl icon-search"></i>
              </button>
            </form>
            {!loading && results.length > 0 && (
              <div className="mt-[60px] mb-10 wrap-break-word">
                <span>
                  Search results for{" "}
                  <strong className="text-(--dark-heading)">
                    &quot;{lastSearchedTerm}&quot;
                  </strong>
                </span>
              </div>
            )}
          </div>
          {loading ? (
            <div className="container text-center py-20">
              <Preloader isLoading={loading} />
            </div>
          ) : results.length > 0 ? (
            <div className="w-full">
              <div className="xl:w-[1112px] w-full mx-auto">
                {groupedResults.store.length > 0 && (
                  <>
                    <div className="flex justify-between items-center pb-6">
                      <h2 className="font-(family-name:--font-secondary)! text-[28px] leading-7 md:text-[40px] md:leading-10.5">
                        Stores
                      </h2>
                      <p className="mb-0! font-light xm:text-lg xm:leading-6">
                        Showing{" "}
                        {groupedResults.store.slice(0, visibleStores).length} of{" "}
                        {groupedResults.store.length} results
                      </p>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-6 md:grid-cols-2 grid-cols-1">
                      {groupedResults.store
                        .slice(0, visibleStores)
                        .map((item, index) => (
                          <Card
                            key={index}
                            card_style="info-card"
                            item={item}
                            imgWrapperClass="relative p-6 w-full aspect-square md:aspect-video [&_img]:object-cover  "
                            contentClass="line-clamp-2"
                            titleClass="line-clamp-1"
                          />
                        ))}
                    </div>
                    {groupedResults.store.length > visibleStores && (
                      <LoadMoreButton
                        onLoadMore={handleLoadMoreStores}
                        hasMore={true}
                        className="mt-6"
                      />
                    )}
                    <div className="h-px bg-(--border-gray-light) my-10"></div>
                  </>
                )}

                {groupedResults.storeOffers.length > 0 && (
                  <>
                    <div className="flex justify-between items-center pb-6">
                      <h2 className="font-(family-name:--font-secondary)! text-[28px] leading-7 md:text-[40px] md:leading-10.5">
                        Store Offers
                      </h2>
                      <p className="mb-0! font-light xm:text-lg xm:leading-6">
                        Showing{" "}
                        {groupedResults.storeOffers.slice(0, visibleStoreOffers).length} of{" "}
                        {groupedResults.storeOffers.length} results
                      </p>
                    </div>
                    {groupedResults.storeOffers.slice(0, visibleStoreOffers).map((item, index) => (
                      <CollapseCard
                        key={index}
                        cardStyle="horizontal-card"
                        post={item as Partial<PostCardsProps> as PostCardsProps}
                        flexClass="md:flex-[0_0_402px]"
                      />
                    ))}
                    {groupedResults.storeOffers.length > visibleStoreOffers && (
                      <LoadMoreButton
                        onLoadMore={handleLoadMoreStoreOffers}
                        hasMore={true}
                        className="mt-6"
                      />
                    )}
                    <div className="my-10"></div>
                  </>
                )}

                {groupedResults.page.length > 0 && (
                  <>
                    <div className="flex justify-between items-center pb-6">
                      <h2 className="font-(family-name:--font-secondary)! text-[28px] leading-7 md:text-[40px] md:leading-10.5">
                        Pages
                      </h2>
                      <p className="mb-0! font-light xm:text-lg xm:leading-6">
                        Showing{" "}
                        {groupedResults.page.slice(0, visiblePages).length} of{" "}
                        {groupedResults.page.length} results
                      </p>
                    </div>
                    {groupedResults.page.slice(0, visiblePages).map((item, index) => (
                      <CollapseCard
                        key={index}
                        cardStyle="horizontal-card"
                        post={item as Partial<PostCardsProps> as PostCardsProps}
                        flexClass="md:flex-[0_0_402px]"
                      />
                    ))}
                    
                    
                    {groupedResults.page.length > visiblePages && (
                      <LoadMoreButton
                        onLoadMore={handleLoadMorePages}
                        hasMore={true}
                        className="mt-6"

                      />
                    )}
                    
                    <div className="my-10"></div>
                  </>
                )}
                {groupedResults.blog.length > 0 && (
                  <>
                    <div className="flex justify-between items-center pb-6">
                      <h2 className="font-(family-name:--font-secondary)! text-[28px] leading-7 md:text-[40px] md:leading-10.5">
                        Blogs
                      </h2>
                      <p className="mb-0! font-light xm:text-lg xm:leading-6">
                        Showing {groupedResults.blog.slice(0, visibleBlogs).length} of{" "}
                        {groupedResults.blog.length} results
                      </p>
                    </div>
                    {groupedResults.blog.slice(0, visibleBlogs).map((item, index) => (
                      <CollapseCard
                        key={index}
                        cardStyle="horizontal-card"
                        post={item as Partial<PostCardsProps> as PostCardsProps}
                        flexClass="md:flex-[0_0_402px]"
                      />
                    ))}
                    {groupedResults.blog.length > visibleBlogs && (
                      <LoadMoreButton
                        onLoadMore={handleLoadMoreBlogs}
                        hasMore={true}
                        className="mt-6"
                      />
                    )}
                    <div className="my-10"></div>
                  </>
                )}

                {groupedResults.events.length > 0 && (
                  <>
                    <div className="flex justify-between items-center pb-6">
                      <h2 className="font-(family-name:--font-secondary)! text-[28px] leading-7 md:text-[40px] md:leading-10.5">
                        Events
                      </h2>
                      <p className="mb-0! font-light xm:text-lg xm:leading-6">
                        Showing {groupedResults.events.slice(0, visibleEvents).length} of{" "}
                        {groupedResults.events.length} results
                      </p>
                    </div>
                    {groupedResults.events.slice(0, visibleEvents).map((item) => (
                      <CollapseCard
                        key={item.id}
                        cardStyle="horizontal-card"
                        post={item as Partial<PostCardsProps> as PostCardsProps}
                        flexClass="md:flex-[0_0_402px]"
                      />
                    ))}
                    {groupedResults.events.length > visibleEvents && (
                      <LoadMoreButton
                        onLoadMore={handleLoadMoreEvents}
                        hasMore={true}
                        className="mt-6"
                      />
                    )}
                    <div className="my-10"></div>
                  </>
                )}
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="xl:w-[1112px] w-full mx-auto">
              <div className="mt-[48px] md:mt-[60px]">
              <p className="text-lg leading-6 mb-4">We could not find any results.</p>
              <p className="text-lg leading-6 mb-4 text-(--dark-heading)"><strong>Did you mean:</strong></p>
               <ul className="ml-0">
                 {suggestions.map((s, i) => (

                <li key={i} className={`flex list-none m-0 border-b border-b-(--border-gray-light) items-center gap-4 py-4
              ${suggestions.length > 1? "border-b-0" : ''} `}>
                  <i className="icon-search text-(--dark-heading)"></i>
                   <button
                    onClick={() => { setTerm(s); performSearch(s) }}
                    className="cursor-pointer text-lg font-normal text-(--dark-heading) "
                  >
                    {s}{i < suggestions.length - 1 ? "," : ""}
                  </button>
                </li>
                ))}


                </ul>
              {/* {suggestions.map(s => <span key={s}>{s}</span>)} */}
              </div>
            </div>
          ) : (
            lastSearchedTerm && (
              <div className="container">
                <div className="md:w-[1112px] mt-[60px] w-full mx-auto">
                  <p>
                    We could not find anything for{" "}
                    <strong className="text-(--dark-heading)">
                      &quot;{lastSearchedTerm}&quot;
                    </strong>
                  </p>
                  <span>
                    <strong className="text-(--dark-heading)">
                      Search tips
                    </strong>
                  </span>
                  <ul className="mt-4 list-disc ml-7">
                    <li>Check the spelling of your keywords.</li>
                    <li>
                      Try using fewer, different or more general keywords.
                    </li>
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default SearchContent;
