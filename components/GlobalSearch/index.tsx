
import { BlockData, SearchResult } from "@/types/global";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Preloader from "../Preloader";
import Card from "../Card";
import Carousel from "../Carousel";
import { Settings } from "react-slick";
import Section from "./sections";
import CustomSearch from "../CustomSearch";
import Link from "next/link";

interface searchBarPorps {
  className?: string;
  placeHolder?: string;
  onClearHandle?: () => void;
  inputClass?: string;
}

export const SearchBar = ({
  className,
  placeHolder,
  inputClass,
  onClearHandle,
}: searchBarPorps) => {
  const iconRef = useRef<HTMLElement>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [term, setTerm] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState(['']);
  const [parentLoading, setParentLoading] = useState(false);

  const handleResults = useCallback(({
    results: allResults,
    suggestions,
    loading,
    hasMinChars,
    wasSubmitted
  }: {
    results: SearchResult[],
    suggestions: string[],
    loading: boolean,
    hasMinChars: boolean,
    wasSubmitted?: boolean
  }) => {
    setResults(allResults);
    setSuggestions(suggestions)
    setParentLoading(loading);
    setTerm(hasMinChars);
    if (wasSubmitted) {
      if(onClearHandle){
        onClearHandle()
      }
    }
  }, [onClearHandle]);

  const groupedResults = useMemo(() => {
    return {
      page: results.filter((r) => r.post_type === `${process.env.NEXT_PUBLIC_PAGE_TYPE}`),
      store: results.filter((r) => r.post_type === "store"),
      storeOffers: results.filter((r) => r.post_type === "store-offers"),
      blog: results.filter((r) => r.post_type === "post"),
      events: results.filter((r) => r.post_type === "event"),
    };
  }, [results]);
  const hasNoResults = term && !parentLoading && results.length === 0 && suggestions.length === 0;

 const [slidesToShow, setSlidesToShow] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(window.innerWidth < 768 ? 1 : 2);
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



const sliderSettingsBlog: Settings = {
  slidesToShow: slidesToShow,
  slidesToScroll: 1,
  dots: false,
  arrows: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        centerMode: true,
        centerPadding: "20px",
      },
    },
  ],
};
const sliderSettingsPage: Settings = {
  slidesToShow: slidesToShow,
  slidesToScroll: 1,
  dots: false,
  arrows: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        centerMode: true,
        centerPadding: "20px",
      },
    },
  ],
};
const sliderSettingsStore: Settings = {
   slidesToShow: slidesToShow,
  slidesToScroll: 1,
  dots: false,
  arrows: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        centerMode: true,
        centerPadding: "20px",
      },
    },
  ],
};
const sliderSettingsEvents: Settings = {
    slidesToShow: slidesToShow,
  slidesToScroll: 1,
  dots: false,
  arrows: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        centerMode: true,
        centerPadding: "20px",
      },
    },
  ],
};


  return (
    <div className={`w-full static ${className}`}>
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full flex justify-between items-center gap-4">
          <CustomSearch
            data={{
              search_type: 'global',
              placeholder: placeHolder
            }as BlockData}
            onResult={handleResults}
            className={`w-full [&_.search-form]:max-w-full  [&_input]:placeholder:font-normal [&_.container]:px-0! [&_input]:text-(--dark-heading) py-0! mt-0!
            [&_input]:placeholder:text-(--dark-heading) ${inputClass}`}
              />
             {term && (
          <button
            onClick={onClearHandle}
            className="cursor-pointer underline hover:no-underline font-medium text-(--dark-heading)"
          >
            <span>Clear</span>
          </button>
        )}
        </div>

      </div>
      {parentLoading ? (
        <div className="flex items-center justify-center h-screen">
          <span>
            <Preloader isLoading={parentLoading}/>
          </span>
        </div>
      ) : (
        <>
          <div
            className={`w-full  h-screen pb-60 overflow-auto  absolute left-0 right-0 z-999 bg-white ${term ? "block" : "hidden"}`}
          >

            {hasNoResults ? (
                <div className="container">
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 max-w-md">
                  <h2 className="text-2xl font-bold text-gray-800">Not Found</h2>
                </div>
              </div>
            </div> ) : (
              <>
               <div className="container">
                {!parentLoading && groupedResults.store.length > 0 && (
                  <div className="flex items-center md:flex-nowrap flex-wrap text-(--dark-heading) [&_img]:relative! [&_img]:w-auto! [&_img]:h-auto!  [&_span]:bg-white mt-10 gap-4">
                    <label>View Stores:</label>
                    <div className="flex flex-wrap gap-4" >
                    {groupedResults.store.slice(0, 4).map((item, i) => (
                      <span
                        className="flex text-(--dark-heading) font-medium items-center justify-center relative"
                        key={i}
                      >
                        <Link href={`/${item.post_type}/${item.slug}`} onClick={onClearHandle}>
                         {item.title.replace(/&amp;/g, '&')}
                        </Link>
                      </span>
                    ))}
                  </div>
                  </div>
                )}  </div>
                <div className="container overflow-hidden">
                <div className="my-8 grid grid-cols-1  md:grid-cols-2
                [&>*:nth-child(2)]:pr-0
                [&>*:nth-child(4)]:pr-0
                [&>*:nth-child(2)]:border-(--border-gray-light)
                [&>*:nth-child(2)]:border-0
                 [&>*:nth-child(2)]:md:border-l
                [&>*:nth-child(2)]:md:pl-10
                [&>*:nth-child(4)]:border-0
                [&>*:nth-child(4)]:md:border-l
                [&>*:nth-child(4)]:border-(--border-gray-light)
                [&>*:nth-child(4)]:md:pl-10 ">
                  {!parentLoading && groupedResults.blog.length > 0 && (
                    <Section title="Blogs"  className="mt-10" onClick={onClearHandle}  viewAllHref="/blog">
                      <Carousel
                        settings={sliderSettingsBlog}
                        className={`[&_.slick-list]:pl-0! [&_.slick-list]:overflow-visible!  md:[&_.slick-list]:-mx-2.5!
                        ${groupedResults.blog.length == 1 ? "[&_.slick-track]:ml-0!" : ""}`}
                      >
                        {groupedResults.blog.slice(0, 2).map((item, i) => (
                          
                          <div onClick={onClearHandle}  key={i}>
                            <Card
                              card_style="info-card"
                              item={{
                                imageSrc: item?.thumbnail?.url || "/images/img-placeholder.jpg",
                                title: item.title,

                                cardLink: `/blog/${item.slug}`,
                              }}
                              contentClass="line-clamp-2"
                              mainCardClass="[&_.learnMore]:hidden"
                              titleClass="line-clamp-1 truncate text-[20px]! leading-[30px]! md:text-[24px]! md:leading-[36px]!"
                              imgWrapperClass="aspect-[402/240] md:min-h-auto min-h-[250px]"
                              wrapperClass="px-0 pr-4 md:px-3"
                              isSearchCards={true}
                            />
                          </div>
                        ))}
                      </Carousel>
                    </Section>
                  )}

                  {!parentLoading && groupedResults.page.length > 0 && (
                    <Section title="Pages" className="mt-10" onClick={onClearHandle} viewAllHref="/">
                      <Carousel
                        settings={sliderSettingsPage}
                        className={`[&_.slick-list]:pl-0! [&_.slick-list]:overflow-visible!  md:[&_.slick-list]:-mx-2.5!
                         ${groupedResults.page.length == 1 ? "[&_.slick-track]:ml-0!" : ""} `}
                      >
                       {groupedResults.page.slice(0, 2).map((item, i) => {
                        return (
                          <div onClick={onClearHandle} key={i}>
                            <Card
                              card_style="info-card"
                              item={{
                                imageSrc: item?.thumbnail?.url || "/images/img-placeholder.jpg",
                                title: item.title,
                              
                                cardLink: `/${item.slug}`,
                              }}
                              contentClass="line-clamp-2"
                              mainCardClass="[&_.learnMore]:hidden"
                              imgWrapperClass="aspect-[402/240] md:min-h-auto min-h-[250px]"
                              titleClass="line-clamp-1 truncate text-[20px]! leading-[30px]! md:text-[24px]! md:leading-[36px]!"
                              wrapperClass="px-0 pr-4 md:px-3"
                              isSearchCards={true}
                            />
                          </div>
                        );
                      })}
                      </Carousel>
                    </Section>
                  )}

                   {!parentLoading && groupedResults.storeOffers.length > 0 && (
                    <Section title="Store Offers" className="mt-10 " onClick={onClearHandle} viewAllHref="/store-offers">
                      <Carousel
                        settings={sliderSettingsStore}
                        className={`[&_.slick-list]:pl-0! [&_.slick-list]:overflow-visible!  md:[&_.slick-list]:-mx-2.5!
                                                  ${groupedResults.storeOffers.length == 1 ? "[&_.slick-track]:ml-0!" : ""}`}
                      >
                        {groupedResults.storeOffers.slice(0, 2).map((item, i) => (
                          <div onClick={onClearHandle}  key={i}>
                            <Card
                              card_style="info-card"
                              item={{
                                imageSrc: item?.thumbnail?.url || "/images/img-placeholder.jpg",
                                title: item.title,

                                cardLink: ``,
                              }}
                              contentClass="line-clamp-2"
                              mainCardClass="[&_.learnMore]:hidden"
                              titleClass="line-clamp-1 truncate text-[20px]! leading-[30px]! md:text-[24px]! md:leading-[36px]!"
                              imgWrapperClass="aspect-video md:min-h-auto min-h-[250px]"
                              wrapperClass="px-0 pr-4 md:px-3"
                              isSearchCards={true}
                            />
                          </div>
                        ))}
                      </Carousel>
                    </Section>
                  )}

                  {!parentLoading && groupedResults.events.length > 0 && (
                    <Section title="Events"   className="mt-10 " onClick={onClearHandle} viewAllHref="/events">
                      <Carousel
                        settings={sliderSettingsEvents}
                        className={`[&_.slick-list]:pl-0!   [&_.slick-list]:overflow-visible!  md:[&_.slick-list]:-mx-2.5!
                                              ${groupedResults.events.length == 1 ? "[&_.slick-track]:ml-0!" : ""} `}
                      >
                        {groupedResults.events.slice(0, 2).map((item, i) => (
                          <div onClick={onClearHandle}  key={i}>
                            <Card
                              card_style="info-card"
                              item={{
                                imageSrc: item?.thumbnail?.url || "/images/img-placeholder.jpg",
                                title: item.title,

                                cardLink: `/${item.post_type}/${item.slug}`,
                              }}
                              contentClass="line-clamp-2"
                              titleClass="line-clamp-1 truncate text-[20px]! leading-[30px]! md:text-[24px]! md:leading-[36px]!"
                              mainCardClass="[&_.learnMore]:hidden"
                              imgWrapperClass="aspect-[402/240]  md:min-h-auto min-h-[250px]"
                              wrapperClass="px-0 pr-4 md:px-3"
                              isSearchCards={true}
                            />
                          </div>
                        ))}
                      </Carousel>
                    </Section>
                  )}
                </div>
                </div>
              </>
            )}

          </div>

        </>
      )}
    </div>
  );
};
