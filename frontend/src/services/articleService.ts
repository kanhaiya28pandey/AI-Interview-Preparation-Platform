import { mockArticles, Article } from "@/mocks/articleData";
import { SEED_ARTICLES } from "@/mocks/taxonomyArticleSeed";
import { contentManagerService } from "./contentManagerService";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const articleService = {
  async getArticles(): Promise<Article[]> {
    await delay(100);
    const seeded = [...mockArticles];
    const seenIds = new Set(seeded.map((s) => s.id));

    SEED_ARTICLES.forEach((sa) => {
      if (!seenIds.has(sa.id)) {
        seeded.push(sa);
        seenIds.add(sa.id);
      }
    });

    try {
      const published = await contentManagerService.getPublishedContent("ARTICLE");
      const dynamicArticles: Article[] = published.map((item) => {
        let cat: Article["category"] = "Interview Prep";
        if (item.subject === "System Design") cat = "System Design";
        else if (item.subject === "DSA") cat = "Coding Advice";
        else if (item.subject === "HR") cat = "Career & Resume";

        return {
          id: item.id,
          slug: item.id,
          title: item.title,
          summary: item.description,
          content: item.contentData?.markdown || item.description,
          author: {
            name: item.createdBy || "Editorial Staff",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: "Senior Engineering Staff",
          },
          category: cat,
          tags: item.tags || [],
          readTimeMinutes: item.settings?.readingTimeMinutes || 5,
          publishedDate: item.createdAt?.substring(0, 10) || new Date().toISOString().substring(0, 10),
          viewsCount: 120,
          likesCount: 18,
          featured: !!item.settings?.featured,
        };
      });

      const seenIds = new Set(seeded.map((s) => s.id));
      dynamicArticles.forEach((da) => {
        if (!seenIds.has(da.id)) {
          seeded.unshift(da);
          seenIds.add(da.id);
        }
      });
    } catch (e) {
      console.warn("Failed to merge published articles:", e);
    }

    return seeded;
  },

  async getArticleById(id: string): Promise<Article | undefined> {
    await delay(100);
    if (id.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(id);
        let cat: Article["category"] = "Interview Prep";
        if (item.subject === "System Design") cat = "System Design";
        else if (item.subject === "DSA") cat = "Coding Advice";
        else if (item.subject === "HR") cat = "Career & Resume";

        return {
          id: item.id,
          slug: item.id,
          title: item.title,
          summary: item.description,
          content: item.contentData?.markdown || item.description,
          author: {
            name: item.createdBy || "Editorial Staff",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: "Senior Engineering Staff",
          },
          category: cat,
          tags: item.tags || [],
          readTimeMinutes: item.settings?.readingTimeMinutes || 5,
          publishedDate: item.createdAt?.substring(0, 10) || new Date().toISOString().substring(0, 10),
          viewsCount: 120,
          likesCount: 18,
          featured: !!item.settings?.featured,
        };
      } catch (e) {
        console.warn("Failed to load dynamic article by id", id);
      }
    }
    return mockArticles.find((a) => a.id === id || a.slug === id);
  },

  async likeArticle(id: string): Promise<number> {
    await delay(100);
    const article = mockArticles.find((a) => a.id === id);
    if (article) {
      article.likesCount += 1;
      return article.likesCount;
    }
    return 19;
  },
};
