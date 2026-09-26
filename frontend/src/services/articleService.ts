import { mockArticles, Article } from "@/mocks/articleData";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const articleService = {
  async getArticles(): Promise<Article[]> {
    if (USE_MOCKS) {
      await delay(300);
      return [...mockArticles];
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async getArticleById(id: string): Promise<Article | undefined> {
    if (USE_MOCKS) {
      await delay(200);
      return mockArticles.find((a) => a.id === id || a.slug === id);
    }
    throw new Error("Real backend endpoint not implemented");
  },

  async likeArticle(id: string): Promise<number> {
    if (USE_MOCKS) {
      await delay(150);
      const article = mockArticles.find((a) => a.id === id);
      if (article) {
        article.likesCount += 1;
        return article.likesCount;
      }
      return 0;
    }
    throw new Error("Real backend endpoint not implemented");
  },
};
