'use client'

import { BlockData, SearchResponse, SearchResult, TaxonomyTerm } from "@/types/global";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Preloader from "../Preloader";
import { pushCardsToDataLayer } from "@/utils/utility";
import Link from "next/link";

export default function CustomSearch({ data, onResult, uiStyle, className, categoriesList }: {
  data: BlockData,
  uiStyle?: boolean,
  className?: string,
  children?: string,
  categoriesList?: TaxonomyTerm[];
  onResult?: (payload: {
    results: SearchResult[],
    suggestions: string[],
    loading: boolean,
    hasMinChars: boolean,
    wasSubmitted?: boolean,
    isCategoryResult?: boolean
    isLetterResult?: boolean
  }) => void;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const onResultRef = useRef(onResult);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const enableFilter = data?.enable_filters?.includes("yes");
  const enableSorting = data?.enable_sorting?.includes("yes");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortingDropdown, setIsSortingDropdown] = useState(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const fetchSearchResults = useCallback(async (query: string, isManualSubmit: boolean = false, categoryId: string | null = null, letter: string | null = null,isOnChange:boolean = false) => {
    const hasMinChars = query.trim().length >= 2;
    const isCategorySearch = categoryId !== null;
    const isLetterSearch = letter !== null;

    if (query.trim().length < 2 && !isCategorySearch && !isLetterSearch) {
      setResults([]);
      setSuggestions([]);
      onResultRef.current?.({ results: [], suggestions: [], loading: false, hasMinChars: false, wasSubmitted: false, isCategoryResult: false, isLetterResult: false });
      return;
    }

    setLoading(true);
    onResultRef.current?.({ results: [], suggestions: [], loading: true, hasMinChars, wasSubmitted: isManualSubmit, isCategoryResult: isCategorySearch, isLetterResult:isLetterSearch });
    try {
      let url = `/api/search?query=${encodeURIComponent(query)}`;
      if (categoryId) url += `&category=${categoryId}`;
      if (letter) url += `&letter=${letter}`;

      if (data.search_type !== 'all' && data.search_type !== 'global' && data.post_type) {
        url += `&post_type=${data.post_type}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      const searchData: SearchResponse = await res.json();

      let newResults = searchData.results || [];
      const newSuggestions = searchData.suggestions || [];

      if (data.search_type !== 'all' && data.search_type !== 'global') {
        newResults = newResults.filter(item => item.post_type === data.search_type);
      }

      setResults(newResults);
      setSuggestions(newSuggestions);

      onResultRef.current?.({
        results: newResults,
        suggestions: newSuggestions,
        loading: false,
        hasMinChars,
        wasSubmitted: isManualSubmit,
        isCategoryResult: isCategorySearch,
        isLetterResult: isLetterSearch
      });

    } catch (err) {
      setLoading(false);
      onResultRef.current?.({ results: [], suggestions: [], loading: false, hasMinChars, wasSubmitted: isManualSubmit, isCategoryResult: isCategorySearch, isLetterResult: isLetterSearch });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isAutoFetch = data.search_type;
    if (!isAutoFetch) return;

    if (term.trim().length < 2 || term.trim().length === 0) return;

    const delayDebounce = setTimeout(() => {
      fetchSearchResults(term, false);
    }, 400);
    return () => clearTimeout(delayDebounce);

  }, [term, data.search_type, fetchSearchResults]);

  const handleSearch = (e?: React.FormEvent, selectedTerm?: string) => {
    e?.preventDefault();
    const rawQuery = selectedTerm || term;
    const query = rawQuery?.trim() || "";
    // const query = selectedTerm || term;

    if (!query || query.length < 2) {
      return;
    }

    if (data.search_type === 'global') {
      fetchSearchResults(query, true);
    }

    // if (data.search_type === 'all' || data.search_type === 'global') {
      router.push(`/search?query=${encodeURIComponent(query)}&global_search=true`);
    // }else{
    //   fetchSearchResults(query, true, selectedCategoryId, selectedLetter);
    // }
  };
const spacingStyles: React.CSSProperties = {
  "--spaceTop": `${data?.top_spacing ?? 0}px`,
  "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
  "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
  "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
} as React.CSSProperties;

  const handleCategoryClick = (id: string) => {
    const newId = selectedCategoryId === id ? null : id;
    setSelectedCategoryId(newId);
    fetchSearchResults(term, false, newId);
    onResultRef.current?.({
      results: [],
      suggestions: [],
      loading: true,
      hasMinChars: term.length >= 2,
      isCategoryResult: true,
      isLetterResult: true
    });
  };
  const handleLetterClick = (l: string) => {
    const newLetter = selectedLetter === l ? null : l;
    setSelectedLetter(newLetter);
    fetchSearchResults(term, false, selectedCategoryId, newLetter);
    onResultRef.current?.({ results: [], suggestions: [], loading: true, hasMinChars: false, isCategoryResult: true, isLetterResult: true });
  };

  return (
    <div
      className={`tru-block search_block flex justify-center
        ${uiStyle == true ? '' : data?.additional_classes ? data?.additional_classes : " "
        }  ${className || ""}
        md:pt-(--spaceTop)
        md:pb-(--spaceBottom)
        pb-(--spaceBottomMobile)
        pt-(--spaceTopMobile)`}
     style={spacingStyles}>
      <div className="container">
        <div className="w-full flex gap-3 items-center relative  max-w-[828px]  mx-auto py-1.5 search-form flex-wrap md:flex-nowrap">
          <form onSubmit={handleSearch} className="relative w-full min-h-12 border-b border-[#646464] flex align-items-center">
            <input
              ref={inputRef}
              placeholder={`${data.placeholder}`}
              onChange={(e) => setTerm(e.target.value)}
              name="search"
              id="search"
              type="text"
              value={term}
              className="w-full md:text-[32px] text-(--dark-heading) xm:text-[28px] pl-4 pr-12 text-[20px] md:ps-4 xm:leading-9 leading-9 placeholder:text-(--primary-text) placeholder:font-light focus:outline-none"
              data-clickeventname="view_search_results"
              data-vieweventname="view_search_results"
              data-title={term}
              data-eventcategory={data.search_type == "global" ? "Global Search" : "Landing page"}
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute top-[50%] right-4 translate-y-[-50%] cursor-pointer border-none bg-transparent p-0"
            >
              <i className="text-lg before:text-[22px] text-(--dark-heading) leading-0 icon-search before:m-0!"></i>
            </button>
          </form>
          {enableFilter && enableSorting && (
          <div className="flex gap-3 w-full md:w-auto xs:flex-wrap xm:flex-nowrap">
          {enableFilter && <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className=" w-full md:w-[205px] relative flex items-center min-h-12 justify-between border border-[#0000001A] px-4 py-1 cursor-pointer">
            <div className="flex items-center gap-4 w-full text-black justify-between">
              <i className="icon-category"></i>
              <span className={`font-light ${selectedCategoryId ? 'text-sm' : 'text-lg'}`}>{selectedCategoryId ? selectedCategoryId.replace(/&amp;/g, "& ") : "Categories"}</span>
              <i className="icon-arrow-down text-[8px] font-light"></i>
            </div>
            <ul className={`absolute z-1 ${isDropdownOpen ? 'block' : 'hidden'} max-h-[400px] overflow-y-scroll shadow p-6 py-4 rigt-0 left-0 top-full cursor-pointer font-bold list-none bg-white w-full m-0 mt-1 border-b border-b-(--border-gray-light) last:border-b-1  `}>
              {categoriesList?.map((cat, ind) => (
                <li key={ind} className="w-full text-[16px] py-2 my-0 font-normal text-black">
                  <span
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`${selectedCategoryId === cat.name
                      ? "font-semibold"
                      : "font-normal"
                      }`}
                  >
                    {cat.name.replace(/&amp; /g, "& ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>}

          {enableSorting && <div onClick={() => setIsSortingDropdown(!isSortingDropdown)} className=" md:w-auto w-full relative flex items-center min-h-12 justify-between border border-[#0000001A] px-4 py-1 cursor-pointer">
            <div className="flex items-center gap-3 w-full justify-between text-black">
              <i className="icon-filter-list text-[11px]"></i>
              <span className="font-light text-lg whitespace-nowrap">A-Z</span>
              <i className="icon-arrow-down text-[8px] font-light"></i>

            </div>
            <ul className={`absolute min-w-60  grid grid-cols-6 z-1 ${isSortingDropdown ? 'block' : 'hidden'} shadow mt-1   py-1 right-0 top-full cursor-pointer font-bold list-none bg-white w-full m-0 p-0 border-(--border-default) border `}>
              {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((char) => (
                <li
                  key={char}

                  className={`font-normal flex flex-col text-lg leading-6 text-(--text-primary) hover:bg-(--border-gray-light) h-10 w-10 items-center justify-center ${selectedLetter === char ? "bg-black text-white" : "text-black"
                    }`}
                  onClick={() => {
                    setIsSortingDropdown(false);
                    handleLetterClick(char)
                  }}
                >
                  {char}
                </li>
              ))}
            </ul>
          </div>}
           </div>
)}

          {data.search_type !== 'global' &&
            <div className={`w-full bg-white mt-2 px-4 absolute top-[50px] left-0 right-0 z-10  overflow-auto   shadow-md
          ${results.length > 0 ? 'max-h-[260px]' : ''}
          ${term.length === 0 && 'hidden'}`}>
              {loading ?
                <div className={`flex items-center justify-center`}>
                  <span className="text-xl italic">
                    <Preloader isLoading={loading} />
                  </span>
                </div>
                : results.length > 0 &&
                results.slice(0, 12).map((s, i) => (
                  <ul
                    key={i}
                    className={`cursor-pointer font-bold list-none bg-white w-full m-0 p-0 border-b border-b-(--border-gray-light) last:border-b-0  `}
                  >
                    <li className="w-full py-4 flex bg-white gap-4 " >
                      <i className="icon-search text-(--dark-heading)"></i>
                      {s.post_type === 'store-offers' ? (
                        <span className="no-underline font-normal my-0 text-lg leading-6 text-(--dark-heading)">
                          {s.title.replace(/&amp;/g, " & ")}
                        </span>
                      ) : (
                        <Link 
                          className="no-underline font-normal my-0 text-lg leading-6 text-(--dark-heading)"
                          href={`${s.post_type == `${process.env.NEXT_PUBLIC_PAGE_TYPE}` ? '' : s.post_type == 'post' ? 'blog' : s.post_type}/${s.slug}`}
                        >
                          {s.title.replace(/&amp;/g, " & ")}
                        </Link>
                      )}
                      {/* <Link className="no-underline font-normal my-0 text-lg leading-6 text-(--dark-heading)"
                        href={`${s.post_type == `${process.env.NEXT_PUBLIC_PAGE_TYPE}` ? '' : s.post_type == 'post' ? 'blog' : s.post_type}/${s.slug}`}>
                        {s.title.replace(/&amp;/g, " & ")}
                      </Link> */}
                    </li>
                  </ul>
                ))
              }
            </div>
          }
        </div>

        {data.search_type == 'global' &&
          <div className="absolute z-99999">
            {!loading &&
              results.length === 0 &&
              term.length >= 2 &&
              (suggestions.length > 0 ? (
                <>
                  <p className="text-lg text-(--dark-heading) mb-0 mt-10">
                    Did you mean {" "}
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setTerm(s); fetchSearchResults(s, false); }}
                        className="cursor-pointer font-bold"
                      >
                        &ldquo;{s}
                        {i < suggestions.length - 1 ? "," : ""}&rdquo;
                      </button>
                    ))} ?
                  </p>
                  <p className="text-lg text-(--dark-heading)">
                    Showing search results for{" "}
                    <strong>&ldquo;{suggestions.map((i) => i)}&rdquo;</strong>
                  </p>
                </>
              ) : (
                <></>
              ))}
          </div>
        }
      </div>
    </div>
  );
}