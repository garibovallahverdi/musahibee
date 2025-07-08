import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiCalendar } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";
import { formatLocalizedDate } from "~/utils/dateFormater";

type Article = {
  category: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string[] | null;
  publishedAt: Date | null;
  coverImage: string | null;
  views:number;
  multimedia: boolean;
  categorie: {
    name: string;
    urlName: string;
  };
  id: string;
};

const NewsCard = ({ article }: { article: Article }) => {
  return (
    <div className=" rounded-md overflow-hidden shadow hover:shadow-lg transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/read/${article.categorie.urlName}/${article.slug}`} className="block group">
        {/* Görsel Alanı */}
        <div className="relative h-36 sm:h-40 md:h-44 lg:h-48 w-full overflow-hidden">
          <Image
            src={article.imageUrl?.[0] ?? article.coverImage ?? "/fallback-image.webp"}
            alt={article.title}
            width={500}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <span className="absolute top-2 uppercase left-2 bg-buttonBg bg-opacity-50 text-white text-[9px] font-semibold px-2 py-1 rounded-full shadow">
            {article.categorie.name}
          </span>
        </div>

        {/* İçerik Alanı */}
        <div className="p-3 text-sm">
          {/* Yayın Tarihi */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center ">
              <FiCalendar className="mr-1 text-gray-400" />
            {formatLocalizedDate(article?.publishedAt ?? undefined)}
              </span>
                <span className="flex items-center gap-2">
                        <IoEyeOutline />
                        {article.views}
                      </span>
          </div>

          {/* Başlık */}
          <h2 className="text-base font-semibold text-titleText mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
            {article.title.replace('&','-')}
          </h2>

          {/* Açıklama */}
          <p className="text-sm text-contentText line-clamp-2">{article.description}</p>
        </div>
      </Link>
    </div>
  );
};

export default NewsCard;
