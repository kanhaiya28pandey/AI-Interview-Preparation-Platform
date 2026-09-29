import { mockArticles, Article } from "@/mocks/articleData";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const articleService = {
  async getArticles(): Promise<Article[]> {
    await delay(150);
    return [...mockArticles];
  },

  async getArticleById(id: string): Promise<Article | undefined> {
    await delay(100);
    return mockArticles.find((a) => a.id === id || a.slug === id);
  },

  async likeArticle(id: string): Promise<number> {
    await delay(100);
    const article = mockArticles.find((a) => a.id === id);
    if (article) {
      article.likesCount += 1;
      return article.likesCount;
    }
    return 0;
  },
};
