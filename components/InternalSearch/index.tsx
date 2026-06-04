"use client";

import { BlockData, PostCardsProps, TaxonomyTerm } from "@/types/global";
import React, { useEffect, useRef, useState } from "react";
import { pushCardsToDataLayer } from "@/utils/utility";

export default function InternalSearch({
  data,
  onResult,
  uiStyle,
  className,
  categoriesList,
  tagsList,
  offset,
  catFilterType,
}: {
  data: BlockData;
  uiStyle?: boolean;
  className?: string;
  children?: string;
  categoriesList?: TaxonomyTerm[];
  tagsList?: TaxonomyTerm[];
  offset?: number;
  catFilterType?: string
  onResult?: (payload: {
    results: PostCardsProps[];
    loading: boolean;
    hasMinChars: boolean;
    wasSubmitted?: boolean;
    isCategoryResult?: boolean;
    isTagCatgResult?:boolean;
    isLetterResult?: boolean;
  }) => void;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<PostCardsProps[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const onResultRef = useRef(onResult);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTagCategory, setSelectedTagCategory] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const enableFilter = data?.enable_filters?.includes("yes");
  const enableCatg = data?.enable_category?.includes("yes");
  const enableTagCatg = data?.enable_tag_category?.includes("yes");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortingDropdown, setIsSortingDropdown] = useState(false);
  const [isTagDropdown, setIsTagDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const sortingRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLDivElement | null>(null);
  const postType = data.post_type ? data.post_type : "";
  const limit = -1;

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) setIsDropdownOpen(false);
      if (sortingRef.current && !sortingRef.current.contains(target)) setIsSortingDropdown(false);
      if (tagRef.current && !tagRef.current.contains(target)) setIsTagDropdown(false);
    };
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsTagDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const performSearch = async (
    query: string,
    isManualSubmit: boolean = false,
    categoryId = selectedCategory,
    tagCatg = selectedTagCategory,
    letter = selectedLetter,
  ) => {
    const hasMinChars = query.trim().length >= 2;
    const isCategorySearch = !!categoryId; 
    const isTagCatgSearch = !!tagCatg;
    const isLetterSearch = !!letter;
    
    let termTaxonomy = "";

    if (data.post_type && data.post_taxonomy && data.post_taxonomy.length > 0) {
      termTaxonomy = JSON.stringify({
        post_taxonomy: data.post_taxonomy,
      }).replace(/"/g, '\\"');
    }

    if (query.trim().length < 2 && !isCategorySearch && !isTagCatgSearch && !isLetterSearch) {
      setResults([]);
      onResultRef.current?.({
        results: [],
        loading: false,
        hasMinChars: false,
        wasSubmitted: false,
        isCategoryResult: false,
        isTagCatgResult:false,
        isLetterResult: false,
      });
      return;
    }

    setLoading(true);
    onResultRef.current?.({
      results: [],
      loading: true,
      hasMinChars,
      wasSubmitted: isManualSubmit,
      isCategoryResult: isCategorySearch,
      isTagCatgResult: isTagCatgSearch,
      isLetterResult: isLetterSearch,
    });
    try {
      const response = await fetch("/api/internalSearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postType,
          limit,
          offset: offset || 0,
          termTaxonomy: termTaxonomy,
          mallLoc: process.env.NEXT_PUBLIC_MALL_KEY,
          query,
          letter: letter || "",
          catFilterType : catFilterType || 'include',
          // excludCategories : excludecat ? excludecat : '',
          selectedCatSlug : categoryId || '',
          selectedTagCatgSlug : tagCatg || ''
        }),
      });

      const data = await response.json();
      const searchResults = data?.internalSearch || {};
      const rawResults = (data?.internalSearch?.posts || []) as Record<
        string,
        unknown
      >[];

      const finalResult = rawResults.map((item) => {
        const content = typeof item.content === "string" ? item.content : "";

        return {
          ...item,
          content:
            content.length > 500 ? `${content.substring(0, 500)}...` : content,
        } as PostCardsProps;
      });
      setResults(finalResult);

      onResultRef.current?.({
        results: finalResult,
        loading: false,
        hasMinChars,
        wasSubmitted: isManualSubmit,
        isCategoryResult: isCategorySearch,
        isTagCatgResult: isTagCatgSearch,
        isLetterResult: isLetterSearch,
      });

      if (inputRef.current) {
        inputRef.current.setAttribute(
          "data-index",
          (searchResults?.posts?.length || 0).toString(),
        );
        pushCardsToDataLayer(inputRef.current as HTMLElement);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent, selectedTerm?: string) => {
    e?.preventDefault();
    const query = selectedTerm || term;
    if (query.trim().length < 2) return;
    performSearch(query, true, selectedCategory, selectedTagCategory, selectedLetter);
  };

  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  const handleCategoryClick = (categoryName: string, catSlug:string) => {
    const dynamicTaxonomy =
      Object.keys(categoriesList || {})[0] || "store-category";
    if (inputRef.current) {
      inputRef.current.setAttribute("data-title", categoryName);
    }

    const isSelected = selectedCategory === categoryName;
    const newCatName = isSelected ? null : categoryName;

    const rawJson = newCatName
      ? JSON.stringify({
          post_taxonomy: [
            {
              taxonomy_slug: dynamicTaxonomy,
              terms: [{ slug: catSlug, name: newCatName }],
            },
          ],
        })
      : "";

    const escapedTaxonomy = rawJson.replace(/"/g, '\\"');
    setSelectedCategory(escapedTaxonomy);

    performSearch(term, false, escapedTaxonomy, selectedTagCategory, selectedLetter);
    onResultRef.current?.({
      results: [],
      loading: true,
      hasMinChars: term.length >= 2,
      isCategoryResult: true,
      isTagCatgResult: true,
      isLetterResult: true,
    });
  };

  const handleTagCategoryClick = (tagCatName: string, tagCatSlug:string) => {
    const dynamicTaxonomy = Object.keys(tagsList || {})[0] || "tags";
    if (inputRef.current) {
      inputRef.current.setAttribute("data-title", tagCatName);
    }

    const isSelected = selectedTagCategory === tagCatName;
    const newCatName = isSelected ? null : tagCatName;

    const rawJson = newCatName
      ? JSON.stringify({
          post_taxonomy: [
            {
              taxonomy_slug: dynamicTaxonomy,
              terms: [{ slug: tagCatSlug, name: newCatName }],
            },
          ],
        })
      : "";

    const escapedTaxonomy = rawJson.replace(/"/g, '\\"');
    setSelectedTagCategory(escapedTaxonomy);

    performSearch(term, false, selectedCategory, escapedTaxonomy, selectedLetter);
    onResultRef.current?.({
      results: [],
      loading: true,
      hasMinChars: term.length >= 2,
      isCategoryResult: true,
      isTagCatgResult:true,
      isLetterResult: true,
    });
  };
  const handleLetterClick = (l: string) => {
    const isDeselecting = selectedLetter === l;
    const newLetter = isDeselecting ? null : l;

    if (inputRef.current && newLetter) {
      inputRef.current.setAttribute("data-title", newLetter);
    }
    setSelectedLetter(newLetter);
    performSearch(term, false, selectedCategory, selectedTagCategory, newLetter);
    if (isDeselecting && term.length < 2 && !selectedCategory && !selectedTagCategory) {
      setResults([]);
      onResultRef.current?.({
        results: [],
        loading: false,
        hasMinChars: false,
        isCategoryResult: false,
        isTagCatgResult: false,
        isLetterResult: false,
      });
    }
  };

  const handleReset = () => {
    setTerm("");
    setSelectedCategory(null);
    setSelectedLetter(null);
    setSelectedTagCategory(null);
    setResults([]);
    onResultRef.current?.({
      results: [],
      loading: false,
      hasMinChars: false,
      wasSubmitted: false,
      isCategoryResult: false,
      isTagCatgResult: false,
      isLetterResult: false,
    });
  };

  return (
    <div
      className={`tru-block search_block flex justify-center
        ${
          uiStyle == true
            ? ""
            : data?.additional_classes
              ? data?.additional_classes
              : " "
        }  ${className || ""}
        md:pt-(--spaceTop)
        md:pb-(--spaceBottom)
        pb-(--spaceBottomMobile)
        pt-(--spaceTopMobile)`}
      style={spacingStyles}
    >
      <div className="container">
        <div className={`w-full flex gap-3 items-center relative  justify-center mx-auto py-1.5  search-form flex-wrap  
          ${enableCatg && enableFilter && enableTagCatg? "xxxl:flex-nowrap" :"lg:flex-nowrap"}`}>
          <form
            onSubmit={handleSearch}
            className={`relative w-full   min-h-12 border-b border-[#646464] ${enableCatg && enableFilter && enableTagCatg? "xxxl:w-auto" :"lg:w-auto"}`}
          >
            <input
              ref={inputRef}
              placeholder={`${data.placeholder}`}
              onChange={(e) => setTerm(e.target.value)}
              name="search"
              id="search"
              type="text"
              value={term}
              className="w-full text-(--dark-heading) text-[28px] md:text-[32px] ps-4 pr-10 leading-3 md:leading-7 placeholder:text-(--primary-text) placeholder:font-light focus:outline-none"
              data-clickeventname="view_search_results"
              data-vieweventname="view_search_results"
              data-title={term}
              data-eventcategory={
                data.search_type == "global" ? "Global Search" : "Landing page"
              }
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute top-[50%] right-4 translate-y-[-50%] cursor-pointer border-none bg-transparent p-0"
            >
              <i className="text-lg before:text-[22px] text-(--dark-heading) leading-0 icon-search before:m-0!"></i>
            </button>
          </form>
          <div
            className={`flex gap-3 w-full  flex-wrap
            ${enableFilter === true || enableCatg === true || enableTagCatg == true ? "sm:flex-nowrap [&_.filterButtons]:md:w-auto [&_.filterButtons]:w-full xxxl:w-auto" : ""}  ${enableCatg && enableFilter && enableTagCatg? "xxxl:flex-nowrap" :"lg:flex-nowrap lg:w-auto" }`}
          >
              {enableCatg && (
                <div
                  ref={filterRef}
                  onBlur={(e) => {
                  
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsDropdownOpen(false);
                    }
                  }}
                  className="filterButtons"
                
                >
                  <div
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    aria-controls="category-listbox"
                    id="category-label"
                    tabIndex={0}
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      setIsSortingDropdown(false);
                      setIsTagDropdown(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault(); 
                        setIsDropdownOpen(!isDropdownOpen);
                        setIsSortingDropdown(false);
                        setIsTagDropdown(false)
                      }
                    }}
                    className=" min-w-[40%] lg:shrink-0 relative inline-flex items-center min-h-12 justify-between border border-[#0000001A] px-4 py-1 cursor-pointer w-full lg:w-auto "
                  >
                    <div className="flex items-center gap-2.5 sm:gap-4 w-full lg:w-auto text-black justify-between">
                      <i className="icon-category"></i>
                      <span
                        className={`font-light leading-4 md:leading-6 text-lg xm:text-sm md:text-lg ${selectedCategory ? "md:text-base!" : ""}`}
                      >
                        {selectedCategory
                          ? JSON.parse(
                              selectedCategory.replace(/\\"/g, '"'),
                            ).post_taxonomy[0].terms[0].name.replace(
                              /&amp;/g,
                              "&",
                            )
                          : "Categories"}
                      </span>
                      <i className="icon-arrow-down text-[8px] font-light"></i>
                    </div>
                    <ul
                      id="category-listbox"
                      role="listbox"
                      aria-labelledby="category-label"
                      className={`absolute z-1 ${isDropdownOpen ? "block" : "hidden"} max-h-[400px] overflow-y-scroll shadow left-0 top-full cursor-pointer font-bold list-none bg-white w-full m-0 mt-1 border-b border-b-(--border-gray-light) last:border-b-0`}
                    >
                      {categoriesList &&
                        (
                          categoriesList as unknown as Record<
                            string,
                            TaxonomyTerm[]
                          >
                        )[Object.keys(categoriesList)[0]]?.map(
                          (cat, ind: number) => (
                            <li
                              key={ind}
                              role="option"
                              tabIndex={0}
                              aria-selected={selectedCategory === cat.name}
                              onClick={() => handleCategoryClick(cat.name, cat.slug)}
                              className="font-normal hover:bg-gray-100 text-black cursor-pointer"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleCategoryClick(cat.name, cat.slug);
                                  setIsDropdownOpen(false); 
                                }
                              }}
                            >
                              <span
                                className={`w-full text-[16px] px-6 py-4 my-0 block ${selectedCategory === cat.name ? "font-semibold" : "font-normal"}`}
                                dangerouslySetInnerHTML={{ __html: cat.name }}
                              >
                                {/* {cat.name.replace(/&amp;/g, '&')} */}
                              </span>
                            </li>
                          ),
                        )}
                    </ul>
                  </div>
                </div>
              )}

            {enableTagCatg && (
              // tagsList && tagsList.length > 0 &&
              <div
                ref={tagRef}
                onBlur={(e) => {
                 
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsTagDropdown(false);
                  }
                }}
                className="filterButtons"
              >
                <div
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-expanded={isTagDropdown}
                  aria-controls="category-listbox"
                  id="category-label"
                  tabIndex={0}
                  onClick={() => {
                    setIsTagDropdown(!isTagDropdown);
                    setIsSortingDropdown(false);
                    setIsDropdownOpen(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault(); 
                      setIsTagDropdown(!isTagDropdown);
                      setIsSortingDropdown(false);
                      setIsDropdownOpen(false)
                    }
                  }}
                  className=" min-w-[40%] lg:shrink-0 relative inline-flex items-center min-h-12 justify-between border border-[#0000001A] px-4 py-1 cursor-pointer w-full lg:w-auto "
                >
                  <div className="flex items-center gap-2.5 sm:gap-4 w-full lg:w-auto text-black justify-between">
                    <i className="icon-category"></i>
                    <span
                      className={`font-light leading-4 md:leading-6 text-lg xm:text-sm md:text-lg ${selectedTagCategory ? "md:text-base!" : ""}`}
                    >
                      {selectedTagCategory
                        ? JSON.parse(
                            selectedTagCategory.replace(/\\"/g, '"'),
                          ).post_taxonomy[0].terms[0].name.replace(
                            /&amp;/g,
                            "&",
                          )
                        : "Explore By"}
                    </span>
                    <i className="icon-arrow-down text-[8px] font-light"></i>
                  </div>
                  <ul
                    id="category-listbox"
                    role="listbox"
                    aria-labelledby="category-label"
                    className={`absolute z-1 ${isTagDropdown ? "block" : "hidden"} max-h-[400px] overflow-y-scroll shadow left-0 top-full cursor-pointer font-bold list-none bg-white w-full m-0 mt-1 border-b border-b-(--border-gray-light) last:border-b-0`}
                  >
                    {tagsList &&
                      (
                        tagsList as unknown as Record<
                          string,
                          TaxonomyTerm[]
                        >
                      )[Object.keys(tagsList)[0]]?.map(
                        (cat, ind: number) => (
                          <li
                            key={ind}
                            role="option"
                            tabIndex={0}
                            aria-selected={selectedTagCategory === cat.name}
                            onClick={() => handleTagCategoryClick(cat.name, cat.slug)}
                            className="font-normal hover:bg-gray-100 text-black cursor-pointer"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleTagCategoryClick(cat.name, cat.slug);
                                setIsTagDropdown(false); 
                              }
                            }}
                          >
                            <span
                              className={`w-full text-[16px] px-6 py-4 my-0 block ${selectedTagCategory === cat.name ? "font-semibold" : "font-normal"}`}
                              dangerouslySetInnerHTML={{ __html: cat.name }}
                            >
                            </span>
                          </li>
                        ),
                      )}
                  </ul>
                </div>
              </div>
            )}

            {enableFilter && (
              <div
                ref={sortingRef}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsSortingDropdown(false);
                  }
                }}
                 className="filterButtons"
              >
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isSortingDropdown}
                  aria-controls="alphabet-listbox"
                  aria-label={`Sort by letter. Current selection: ${selectedLetter || "A to Z"}`}
                  onClick={() => {
                    setIsSortingDropdown(!isSortingDropdown);
                    setIsDropdownOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsSortingDropdown(false);
                  }}
                  className={`relative flex items-center min-w-[30%]  lg:min-w-[124px]  min-h-12 justify-between border border-[#0000001A] px-4 py-1 cursor-pointer w-full   lg:w-auto ${enableCatg && enableFilter && enableTagCatg ? "w-auto sm:w-full" : " "}`}
                >
                  <div className="flex items-center gap-4 w-full text-black justify-between">
                    <i className="icon-filter-list text-[11px]"></i>
                    <span className="font-light text-lg xm:text-sm  md:text-lg whitespace-nowrap">
                      {selectedLetter ? selectedLetter : "A-Z"}
                    </span>
                    <i className="icon-arrow-down text-[8px] font-light"></i>
                  </div>
                  <ul
                    id="alphabet-listbox"
                    role="listbox"
                    className={`absolute min-w-[200px] grid grid-cols-6 text-center z-1 ${isSortingDropdown ? "block" : "hidden"} shadow p-4 py-4 left-0 top-full cursor-pointer font-bold list-none bg-white w-full m-0 mt-1 p-0 border-b border-b-(--border-gray-light) last:border-b-0`}
                  >
                    {Array.from({ length: 26 }, (_, i) =>
                      String.fromCharCode(65 + i),
                    ).map((char) => (
                      <li
                        key={char}
                        className={`font-normal hover:bg-gray-100  hover:text-black cursor-pointer ${selectedLetter === char ? "bg-black text-white text-s" : "text-black"}`}
                        onClick={() => {
                          setIsSortingDropdown(false);
                          handleLetterClick(char);
                        }}
                        onKeyDown={(e) => {
                         
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault(); 
                            handleLetterClick(char);
                            setIsSortingDropdown(false);
                             sortingRef.current
                              ?.querySelector("button")
                              ?.focus();
                          } else if (e.key === "Escape") {
                            setIsSortingDropdown(false);
                            sortingRef.current
                              ?.querySelector("button")
                              ?.focus();
                          }
                        }}
                        tabIndex={isSortingDropdown ? 0 : -1}
                      >
                        {char}
                      </li>
                    ))}
                  </ul>
                </button>
              </div>
            )}

            {(enableCatg || enableFilter || enableTagCatg) && (
              <button
                onClick={handleReset}
                type="button"
                aria-label="Reset all filters"
                className={` focus-visible:outline-offset-2 focus-visible:outline-blue-600  active:bg-gray-100  relative flex items-center w-auto xm:min-w-auto w-full md:min-h-12 justify-between border border-[#0000001A] px-4 py-2 cursor-pointer min-w-30 lg:w-auto ${enableFilter === true || enableCatg === true ? "sm:w-[100px] " : ""}`}
              >
                <div className="items-center w-full text-black text-center">
                  <span className="font-light text-lg xm:text-sm  md:text-lg  whitespace-nowrap">
                    Reset
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
