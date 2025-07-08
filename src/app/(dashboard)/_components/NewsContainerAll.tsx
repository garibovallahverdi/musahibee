"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { api } from "~/trpc/react";
import NewsCard from "~/app/_components/common/NewsCard";
import SkeletonLoader from "~/app/_components/general/SkeletonLoader";
import Link from "next/link";


type Article = {
  id: string;
  category: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  multimedia: boolean;
  views:number,
  categorie: {
    name: string;
    urlName: string;

  };
  imageUrl: string[] | null;
  publishedAt: Date | null;
};




type NewsContainerProps = {
  initialData: { articles: Article[]; count: number; nextCursor?: string };
  limit: number;
};

const NewsContainerAll = ({
  initialData,
  limit,
}: NewsContainerProps) => {
 
  const [articles, setArticles] = useState<Article[]>(initialData.articles);
  const [nextCursor, setNextCursor] = useState<string | undefined>(
    initialData.nextCursor
  );
  const [isFetching, setIsFetching] = useState(false);


 

 
  const trpcClient = api.useContext();



 
  const fetchMoreData = useCallback(async () => {
    if (!nextCursor || isFetching) return;

    setIsFetching(true);
    try {

       const  res = await trpcClient.public.article.getNewsAll.fetch({
          limit,
          cursor: nextCursor,
        });

      setArticles((prev) => [...prev, ...(res.articles as Article[])]);
      setNextCursor(res.nextCursor ?? undefined);
    } catch (e) {
      console.error("Infinite-scroll fetch error:", e);
    }
    setIsFetching(false);
  }, [nextCursor, isFetching, limit, trpcClient]);

 
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) void fetchMoreData();
      },
      {
        root: null,         
        rootMargin: "100px",
        threshold: 0.1,    
      }
    );
  
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchMoreData, nextCursor]); 


  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide text-nowrap">

      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>

      {isFetching && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 ">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      )}

      {/* sentinel */}
{articles.length > 0 && (
  <div ref={sentinelRef} className="h-10 w-full" />
)}
    </div>
  );
};

export default NewsContainerAll;
