import { Article } from "@prisma/client";
import { Metadata } from "next";
import ShowDetail from "~/app/(dashboard)/_components/ShowDetail";
import RelatedBox from "~/app/_components/common/RelatedBox";
import RelatedNewsCard from "~/app/_components/common/RelatedNewsCard";
import LatestNews from "~/app/_components/layout/LatestNews";
import Slider from "~/app/_components/layout/Slider";
import { api } from "~/trpc/server";

type Params = Promise<{ slug: string, category: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug} = await props.params;
  const news = await api.public.article.getById({ slug });
 
  return {
    title: news?.title || "Xəbər Detayı",
    description: news?.description || "Ən son xəbərləri oxuyun.",
    alternates: { canonical: `https://musahibe.az/read/${news.categorie?.urlName}/${news.slug}` },
    openGraph: {
      
      title: news?.title || "Xəbər Detayı",
      description: news?.description || "Ən son xəbərləri oxuyun.",
      url: `https://musahibe.az/read/${news.categorie?.urlName}/${news.slug}`,
      images: [{ url: news?.imageUrl[0] ?? "/logo.jpg" }],
      type: "article",
    },
  };
}
                  
export default async function Page(props: { params: Params }) {
  const { slug } = await props.params;
  const news = await api.public.article.getById({ slug });
    const latestNews = await api.public.article.latestNews();
  
    
  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
         <ShowDetail news={news}/>
        {news?.tags && <RelatedBox category="Vacib Xəbərlər" categorie={news.categorie.urlName ?? null} currentSlug={news.slug} tags={news.tags}/>}

        </div>
 

        
        <div className="lg:col-span-1 space-y-6">

        { <RelatedBox category="Oxşar Xəbərlər" categorie={news.categorie?.urlName} currentSlug={news.slug} tags={news.tags}/>}
            <div>
               <h2 className="mb-4 pl-2 text-2xl font-bold text-titleText sm:pl-4">
                Son Xəbərlər
            </h2>
                  <LatestNews initialData={latestNews} />
            </div>
        </div>
         
      </div> 
      <div className="flex flex-col">
        <div>
        </div>

               {/* <Slider/> */}
      </div>
      
    </div>
  );
}
