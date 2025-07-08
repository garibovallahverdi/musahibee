import { z } from "zod";
import Fuse from "fuse.js";
import redis from "~/server/redisClient";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ArticleStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import LatestNews from "~/app/_components/layout/LatestNews";
import { subHours } from "date-fns";

export const articleRouter = createTRPCRouter({


    galeryNews: publicProcedure
      .query(async ({ ctx, input }) => {
        try {
          const article = await ctx.db.article.findMany({
            where: { status:ArticleStatus.PUBLISHED  },
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              imageUrl: true,
              coverImage: true,
              slug: true,
              publishedAt: true,
              views:true,
               categorie: {
                select: {
                  name: true,
                  urlName: true,
                  parent:{
                    select:{
                      name:true,
                      urlName:true
                    }
                  }
                },
              },
            },
            orderBy: {
              publishedAt: 'desc',
            },
            take: 8, 
          });
      
          if (!article) {
            throw new Error("Xəbər tapılmadı");
          }
  
          return {article};
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("İnternal server error: " + error.message);
          } else {
            throw new Error("İnternal server error");
          }
        }
      }),
      
      getNewsBySubCategory: publicProcedure
      .input(z.object({
        limit: z.number(),
        cursor: z.string().optional(), 
        category: z.string()
      }))
      .query(async ({ ctx, input }) => {
        const { limit, cursor, category } = input;
    
        try {
          const articles = await ctx.db.article.findMany({
            where: {
              status: ArticleStatus.PUBLISHED,
              categorie:{
                urlName:category
              }
            },
            select:{
              id: true,
              title: true,
              description: true,
              category: true,
              multimedia: true,
              views:true,
              coverImage: true, // Yeni eklenen alan
              imageUrl: true,
                   categorie: {
                select: {
                  name: true,
                  urlName: true,
                 
                },
              },
              slug: true,
              publishedAt: true,
            },
            take: limit,
            skip: cursor ? 1 : 0, 
            cursor: cursor ? { id: cursor } : undefined, 
            orderBy: {
              publishedAt: 'desc',
            }
          });
    
          const count = await ctx.db.article.count({
            where: {
              status: ArticleStatus.PUBLISHED,
              categorie:{
                urlName:category
              }
            },
          });
    
          // if (!articles.length) {
          //   throw new Error("Xəbər tapılmadı");
          // } 
          
          const nextCursor = articles.length === limit ? articles[articles?.length - 1]?.id : null;
    
          return {
            articles,
            count,
            nextCursor
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("İnternal server error: " + error.message);
          } else {
            throw new Error("İnternal server error");
          }
        }
      }),
    
    getNewsByMainCategory: publicProcedure
      .input(z.object({
        limit: z.number(),
        cursor: z.string().optional(), 
        category: z.string()
      }))
      .query(async ({ ctx, input }) => {
        const { limit, cursor, category } = input;
    
        try {
           const mainCategory = await ctx.db.category.findUnique({
        where: { urlName: category },
        include: {
          children: true, // subkategoriyalar
        },
      });
           if (!mainCategory) {
        throw new Error("İnternal server error");
      }
            const categoryList =  [mainCategory.urlName,...mainCategory.children.map(child => child.urlName)];

          const articles = await ctx.db.article.findMany({
            where: {
              status: ArticleStatus.PUBLISHED,
              
                categorie:{
                  urlName:{
                    in:categoryList
                  }
                }
            },
            select:{
              id: true,
              title: true,
              description: true,
              category: true,
              multimedia: true,
              views:true,
              imageUrl: true,
              coverImage: true, // Yeni eklenen alan
              categorie: {
                select: {
                  name: true,
                  urlName: true,
                },
              },
              slug: true,
              publishedAt: true,
            },
            take: limit,
            skip: cursor ? 1 : 0, 
            cursor: cursor ? { id: cursor } : undefined, 
            orderBy: {
              publishedAt: 'desc',
            }
          });
    
          const count = await ctx.db.article.count({
           where: {
              status: ArticleStatus.PUBLISHED,
              categorie:{
                  urlName:{
                    in:categoryList
                  }
                }
            },
          });
    
          // if (!articles.length) {
          //   throw new Error("Xəbər tapılmadı");
          // } 
          
          const nextCursor = articles.length === limit ? articles[articles?.length - 1]?.id : null;
    
          return {
            articles,
            count,
            nextCursor
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("İnternal server error : " + error.message);
          } else {
            throw new Error("İnternal server error");
          }
        }
      }),


            getNewsAll: publicProcedure
      .input(z.object({
        limit: z.number(),
        cursor: z.string().optional(), 
      }))
      .query(async ({ ctx, input }) => {
        const { limit, cursor } = input;
    
        try {
          const articles = await ctx.db.article.findMany({
            where: {
              status: ArticleStatus.PUBLISHED,
            },
            select:{
              id: true,
              title: true,
              description: true,
              category: true,
              multimedia: true,
              views:true,
              coverImage: true, // Yeni eklenen alan
              imageUrl: true,
                   categorie: {
                select: {
                  name: true,
                  urlName: true,
                 
                },
              },
              slug: true,
              publishedAt: true,
            },
            take: limit,
            skip: cursor ? 1 : 0, 
            cursor: cursor ? { id: cursor } : undefined, 
            orderBy: {
              publishedAt: 'desc',
            }
          });
    
          // const count = await ctx.db.article.count({
          //   where: {
          //     status: ArticleStatus.PUBLISHED,
             
          //   },
          // });
    
          // if (!articles.length) {
          //   throw new Error("Xəbər tapılmadı");
          // } 
          
          const nextCursor = articles.length === limit ? articles[articles?.length - 1]?.id : null;
    
          return {
            articles,
            count :0,
            nextCursor
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("İnternal server error: " + error.message);
          } else {
            throw new Error("İnternal server error");
          }
        }
      }),



      getById: publicProcedure
      .input(z.object({
        slug: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // const cacheKey = `article:${input.slug}`;
    
          // // ✅ 1. Önce Redis Cache'den kontrol et
          // const cachedArticle = await redis.get(cacheKey);
          // if (cachedArticle) {
          //   console.log("♻️ Cache'den çekildi:", cacheKey);
          //   return JSON.parse(cachedArticle) as Article & { tags: { name: string }[] };
          // }
    
          // 🚀 2. Cache'de yoksa veritabanından çek
          const article = await ctx.db.article.findUnique({
            where: { slug: input.slug, status:ArticleStatus.PUBLISHED },
            select: {
              id: true,
              title: true,
              description: true,
              content: true,
              category: true,
              multimedia: true,
              imageUrl: true,
              galleryImages:true,
              coverImage: true, // Yeni eklenen alan
              slug: true,
              publishedAt: true,
              views:true,
              tags: {
                select: {
                  name: true,
                },
              },
              categorie:{
                select:{
                  name:true,
                  urlName:true,
                }
              }
            },  
          });
    
          if (!article) {
            throw new Error("Xəbər tapılmadı");
          }
    
          // await redis.set(cacheKey, JSON.stringify(article), "EX", 600);
          // console.log("📌 Cache'e eklendi:", cacheKey);
    
          return article;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("İnternal server error: " + error.message);
          } else {
            throw new Error("İnternal server error");
          }
        }
      }),

    getRelatedNews: publicProcedure
    .input(
      z.object({
        currentSlug: z.string(), 
        category: z.string(),
        tags: z.array(
          z.object({
            name: z.string(),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const tagNames = input.tags.map(tag => tag.name); 
      
        const news = await ctx.db.article.findMany({
          where: {
            slug: { not: input.currentSlug }, 
            status: ArticleStatus.PUBLISHED,
            categorie: {
              urlName: input.category
            },
            // tags: {
            //   some: {
            //     name: {
            //       in: tagNames,
            //     },
            //   }, 
            // },
          
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            imageUrl: true,
            slug: true,
            coverImage: true, // Yeni eklenen alan
            multimedia: true,
            publishedAt: true,
            views:true,
            categorie: {
              select: {
                name: true,
                urlName: true,
               
              },
            },
          },
          orderBy: {
            createdAt: 'desc',  
          },
          take: 6
        });
          
      
        return news; 
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("İnternal server error: " + error.message);
        } else {
          throw new Error("İnternal server error");
        }
      }
    }),




    getStepNews: publicProcedure
  .input(z.object({
    page: z.number().default(1), // Sayfa numarası
    limit: z.number().default(10), // Sayfa başına kaç haber
  }))
  .query(async ({ ctx, input }) => {
    const { page, limit } = input;

    try {
      const articles = await ctx.db.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: limit,
        skip: (page - 1) * limit, // Sayfaya göre kaydırma işlemi
        orderBy: { publishedAt: 'desc' },
           select: {
            id: true,
            title: true,
            description: true,
            category: true,
            multimedia: true,
            coverImage: true,
            imageUrl: true,
            views:true,
            slug: true,
            publishedAt: true,
            categorie: {
              select: {
                name: true,
                urlName: true,
              },
            },
          },
      });

      const totalCount = await ctx.db.article.count({
        where: { status: ArticleStatus.PUBLISHED },
        take:30
      });

      return {
        articles,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      if(error instanceof Error) {
        throw new Error("İnternal server error: " + error.message);
      } else {
        throw new Error("İnternal server error");
      } 
    }
  }),


latestNews: publicProcedure
.query(async ({ ctx }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const thirtySixHoursAgo:Date = subHours(new Date(), 72);

  try {
    const articles = await ctx.db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: {
          gte: thirtySixHoursAgo,
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 15, // Maksimum 15 haber
      select: {
        id: true,
        title: true,
        category: true,
        multimedia: true,
        coverImage: true,
        imageUrl: true,
        slug: true,
        publishedAt: true,
        views:true,
        categorie: {
          select: {
            name: true,
            urlName: true,
          },
        },
      },
    });

    return { articles };
  } catch (error) {
    throw new Error(
      "Internal server error: " + (error instanceof Error ? error.message : "Unknown error")
    );
  }
}),

 increseView:publicProcedure
  .input(
    z.object({
      slug: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      await ctx.db.article.update({
        where: { slug: input.slug },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      return { success: true };
    } catch (error: unknown) {
      console.error("View artırılırken hata:", error);
      throw new Error("Görüntülenme sayısı artırılamadı.");
    }
  }),

  // search : publicProcedure
  // .input(
  //   z.object({
  //     limit: z.number().min(1).max(100).default(10),
  //     cursor: z.string().nullish(),
  //     search: z.string().optional(),
  //   })
  // )
  // .query(async ({ ctx, input }) => {
  //   try {
  //     // Generate unique cache key
  //     const cacheKey = `search:${input.search ?? 'all'}:${input.cursor ?? 0}:${input.limit}`;
      
  //     // Check Redis cache first
  //     const cachedResult = await redis.get(cacheKey);
  //     if (cachedResult) {
  //       return JSON.parse(cachedResult) as { articles: any[], nextCursor: string | null, searchTerm: string | undefined, cached: boolean };
  //     }

  //     // Database query conditions
  //     const where: Prisma.ArticleWhereInput = input.search
  //       ? {
  //           OR: [
  //             { title: { contains: input.search, mode: 'insensitive' } },
  //             { description: { contains: input.search, mode: 'insensitive' } },
  //             // For PostgreSQL full-text search (uncomment if using PostgreSQL):
  //             // {
  //             //   $text: {
  //             //     $search: input.search,
  //             //     $caseSensitive: false,
  //             //     $diacriticSensitive: false
  //             //   }
  //             // }
  //           ],
  //         }
  //       : {};

  //     // Execute query with cursor pagination
  //     const articles = await ctx.db.article.findMany({
  //       where,
  //       take: input.limit + 1, // Fetch one extra to check for next page
  //       cursor: input.cursor ? { id: input.cursor } : undefined,
  //       orderBy: { publishedAt: 'desc' }, // Or your preferred ordering
  //       select: {
  //         id: true,
  //         title: true,
  //         description: true,
  //         publishedAt: true,
  //         category: true,
  //         imageUrl: true,
  //         slug: true,
  //         // Only select fields you need
  //       },
  //     });

  //     // Determine next cursor
  //     let nextCursor: string | undefined = undefined;
  //     if (articles.length > input.limit) {
  //       const nextItem = articles.pop();
  //       nextCursor = nextItem?.id;
  //     }

  //     // Prepare response
  //     const result = {
  //       articles,
  //       nextCursor,
  //       searchTerm: input.search,
  //       cached: false,
  //     };

  //     // Cache results in Redis (60 seconds TTL)
  //     await redis.setex(cacheKey, 60, JSON.stringify({
  //       ...result,
  //       cached: true
  //     }));

  //     return {
  //       articles,
  //       nextCursor,
  //       searchTerm: input.search,
  //       cached: false,
  //     };
  //   } catch (error) {
  //     console.error('Search error:', error);
  //     throw new TRPCError({
  //       code: 'INTERNAL_SERVER_ERROR',
  //       message: 'Search operation failed',
  //     });
  //   }
  // }),


  
}); 


const normalizeText =(text: string)=> {
  return text.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/ə/g, "e") 
  .toLowerCase(); 
}
