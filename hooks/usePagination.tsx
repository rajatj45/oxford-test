"use client";
import { useState, useEffect, useRef } from "react";
import { getPostsAction } from "@/utils/posts";
import { PostCardsProps, BlockData } from "@/types/global";

export function usePagination(block: BlockData) {
  const [items, setItems] = useState<PostCardsProps[]>([]);
  const [status, setStatus] = useState('');

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialized = useRef(false);
  const limit = Number(block?.number_of_posts) || 2;
  const filterType = block.cat_filter_type || 'include';
  const excludCategories = block.exclude_cat ? JSON.stringify(block.exclude_cat).replace(/"/g, '\\"') : '';

  const taxonomy = JSON.stringify({
    post_taxonomy: block?.post_taxonomy || [],
  }).replace(/"/g, '\\"');

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const result = await getPostsAction(
        block.post_type || "post",
        limit,
        offset,
        block?.post_taxonomy ? taxonomy : '',
        filterType,
        block.exclude_cat ? excludCategories : ''
      );
      setItems((prev) => [...prev, ...result.posts]);
      setStatus(result.status)
      setOffset((prev) => prev + result.posts.length);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initialFetch = async () => {
      setIsLoading(true);
      try {
        const result = await getPostsAction(
          block.post_type || "post",
          limit,
          0,
          block?.post_taxonomy ? taxonomy : '',
          filterType,
          block.exclude_cat ? excludCategories : ''
        );
        setItems(result.posts);
        setStatus(result.status)
        setOffset(result.posts.length);
        setHasMore(result.hasMore);
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();
  }, [limit, taxonomy, block.post_type]);

  return { items, loadMore, hasMore, isLoading, offset, status };
}
