import api from "@/lib/api";
import { Article } from "@/mocks/articleData";
import { contentManagerService } from "./contentManagerService";

export const articleService = {
  async getArticles(): Promise<Article[]> {
    try {
      const res = await api.get<Article[]>("/api/v1/articles");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend articles endpoint unavailable:", err);
    }

    try {
      const published = await contentManagerService.getPublishedContent("ARTICLE");
      if (published.length > 0) {
        return published.map((item) => {
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
            featured: Boolean(item.settings?.featured),
          };
        });
      }
    } catch (e) {
      console.warn("Failed to retrieve published articles:", e);
    }

    return [];
  },

  async getArticleById(id: string): Promise<Article | undefined> {
    try {
      const res = await api.get<Article>(`/api/v1/articles/${encodeURIComponent(id)}`);
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend article by id unavailable:", err);
    }

    if (id.startsWith("cnt-")) {
      try {
        const item = await contentManagerService.getContentById(id);
        if (!item) return undefined;
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
          featured: Boolean(item.settings?.featured),
        };
      } catch (e) {
        console.warn("Failed to load dynamic article by id", id);
      }
    }

    const all = await this.getArticles();
    return all.find((a) => a.id === id || a.slug === id);
  },

  async likeArticle(id: string): Promise<number> {
    try {
      const res = await api.post<{ likesCount: number }>(`/api/v1/articles/${encodeURIComponent(id)}/like`);
      if (typeof res.data?.likesCount === "number") {
        return res.data.likesCount;
      }
    } catch (err) {
      console.warn("Backend like article failed:", err);
    }
    return 1;
  },
};
