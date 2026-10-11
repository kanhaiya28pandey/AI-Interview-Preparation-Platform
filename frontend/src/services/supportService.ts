import api from "@/lib/api";
import { FAQ_CATEGORIES, FAQItem } from "@/mocks/faqs";
import { notificationService } from "./notificationService";

export interface SupportTicket {
  id: string;
  category: "Bug Report" | "Feature Request" | "Account Issue" | "Feedback" | "Other";
  subject: string;
  description: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Review" | "Resolved";
  resolutionNotes?: string;
  adminReply?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export interface CreateTicketPayload {
  category: "Bug Report" | "Feature Request" | "Account Issue" | "Feedback" | "Other";
  subject: string;
  description: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
}

export interface HelpArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpfulCount: number;
  unhelpfulCount: number;
  tags: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TICKETS_STORAGE_KEY = "ai_interview_prep_tickets";
const ARTICLES_STORAGE_KEY = "ai_interview_prep_help_articles";
const VOTES_STORAGE_KEY = "ai_interview_prep_faq_votes";

// Helper to seed default articles from FAQ_CATEGORIES
const getInitialArticles = (): HelpArticle[] => {
  const flattened: HelpArticle[] = [];
  FAQ_CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      flattened.push({
        id: item.id,
        category: cat.title,
        question: item.question,
        answer: item.answer,
        helpfulCount: item.helpfulCount || 0,
        unhelpfulCount: item.unhelpfulCount || 0,
        tags: item.tags || [],
        author: "Platform Admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  });
  return flattened;
};

export const supportService = {
  // ================= TICKET OPERATIONS =================
  async getTickets(): Promise<SupportTicket[]> {
    try {
      const res = await api.get<SupportTicket[]>("/api/v1/support/tickets");
      if (Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch {
      try {
        const resAdmin = await api.get<SupportTicket[]>("/api/v1/admin/support/tickets");
        if (Array.isArray(resAdmin.data) && resAdmin.data.length > 0) {
          localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(resAdmin.data));
          return resAdmin.data;
        }
      } catch (err) {
        console.warn("Could not fetch support tickets from backend:", err);
      }
    }

    try {
      const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    return [];
  },

  async createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
    let userId = "";
    let userName = "Student User";
    let userEmail = "student@srmist.edu.in";
    try {
      const activeUserRaw = localStorage.getItem("ai_interview_prep_user");
      if (activeUserRaw) {
        const parsed = JSON.parse(activeUserRaw);
        if (parsed.userId) userId = parsed.userId;
        if (parsed.name) userName = parsed.name;
        if (parsed.email) userEmail = parsed.email;
      }
    } catch {}

    try {
      const res = await api.post<SupportTicket>("/api/v1/support/tickets", {
        ...payload,
        priority: payload.priority || "Medium",
      });
      if (res.data) {
        const saved = res.data;
        const current = await this.getTickets();
        const updated = [saved, ...current.filter((t) => t.id !== saved.id)];
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("support-tickets-updated", { detail: updated }));

        // Notify Admin and Student
        notificationService.notifyAdmins({
          type: "support",
          title: "New Student Query Raised",
          message: `Ticket ${saved.id} (${saved.category}) raised by ${saved.userName || "Student"}: "${saved.subject}" [${saved.priority || "Medium"}]`,
          link: "/admin/help",
          priority: saved.priority === "Critical" || saved.priority === "High" ? "danger" : "info",
        }).catch(() => {});

        if (saved.userId) {
          notificationService.notifyUser(saved.userId, {
            type: "support",
            title: "Support Ticket Logged",
            message: `Ticket ${saved.id} ("${saved.subject}") logged. Our support team will review it.`,
            link: "/help?tab=contact",
            priority: "info",
          }).catch(() => {});
        }

        return saved;
      }
    } catch (err) {
      console.warn("Backend create ticket failed, saving locally:", err);
    }

    const newTicket: SupportTicket = {
      id: `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      attachmentName: payload.attachmentName,
      attachmentDataUrl: payload.attachmentDataUrl,
      priority: payload.priority || "Medium",
      status: "Open",
      createdAt: new Date().toISOString(),
      userId: userId || undefined,
      userName,
      userEmail,
    };

    try {
      const existing = await this.getTickets();
      const next = [newTicket, ...existing];
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("support-tickets-updated", { detail: next }));

      // Notify Admin and Student
      notificationService.notifyAdmins({
        type: "support",
        title: "New Student Query Raised",
        message: `Ticket ${newTicket.id} (${newTicket.category}) raised by ${newTicket.userName}: "${newTicket.subject}" [${newTicket.priority}]`,
        link: "/admin/help",
        priority: newTicket.priority === "Critical" || newTicket.priority === "High" ? "danger" : "info",
      }).catch(() => {});

      if (newTicket.userId) {
        notificationService.notifyUser(newTicket.userId, {
          type: "support",
          title: "Support Ticket Logged",
          message: `Ticket ${newTicket.id} ("${newTicket.subject}") logged. Our support team will review it.`,
          link: "/help?tab=contact",
          priority: "info",
        }).catch(() => {});
      }
    } catch {}

    return newTicket;
  },

  async updateTicketStatus(
    ticketId: string,
    nextStatus: "Open" | "In Review" | "Resolved",
    resolutionNotes?: string,
    adminReply?: string,
    priority?: "Low" | "Medium" | "High" | "Critical",
    resolvedBy?: string
  ): Promise<SupportTicket | null> {
    try {
      const res = await api.patch<SupportTicket>(`/api/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
        status: nextStatus,
        resolutionNotes,
        adminReply,
        priority,
        resolvedBy: resolvedBy || "Platform Admin",
      });
      if (res.data) {
        const saved = res.data;
        const existing = await this.getTickets();
        const updated = existing.map((t) => (t.id === ticketId ? saved : t));
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("support-tickets-updated", { detail: updated }));

        if (saved.userId) {
          notificationService.notifyUser(saved.userId, {
            type: "support",
            title: `Ticket ${ticketId} ${nextStatus}`,
            message: adminReply
              ? `Admin replied: "${adminReply.length > 75 ? adminReply.slice(0, 75) + "..." : adminReply}"`
              : `Your ticket has been marked as ${nextStatus}.`,
            link: "/help?tab=contact",
            priority: nextStatus === "Resolved" ? "success" : "info",
          }).catch(() => {});
        }

        return saved;
      }
    } catch (err) {
      console.warn("Backend update ticket status failed, saving locally:", err);
    }

    try {
      const existing = await this.getTickets();
      let targetUser: string | undefined;
      const updated = existing.map((t) => {
        if (t.id === ticketId) {
          targetUser = t.userId;
          return {
            ...t,
            status: nextStatus,
            resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : t.resolutionNotes,
            adminReply: adminReply !== undefined ? adminReply : t.adminReply,
            priority: priority !== undefined ? priority : t.priority,
            resolvedBy: resolvedBy || t.resolvedBy || "Platform Admin",
            resolvedAt: nextStatus === "Resolved" ? new Date().toISOString() : t.resolvedAt,
          };
        }
        return t;
      });
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("support-tickets-updated", { detail: updated }));

      if (targetUser) {
        notificationService.notifyUser(targetUser, {
          type: "support",
          title: `Ticket ${ticketId} ${nextStatus}`,
          message: adminReply
            ? `Admin replied: "${adminReply.length > 75 ? adminReply.slice(0, 75) + "..." : adminReply}"`
            : `Your ticket has been marked as ${nextStatus}.`,
          link: "/help?tab=contact",
          priority: nextStatus === "Resolved" ? "success" : "info",
        }).catch(() => {});
      }

      return updated.find((t) => t.id === ticketId) || null;
    } catch {
      return null;
    }
  },

  async deleteTicket(ticketId: string): Promise<boolean> {
    try {
      await api.delete(`/api/v1/admin/support/tickets/${encodeURIComponent(ticketId)}`);
    } catch (err) {
      console.warn("Backend delete ticket failed, deleting locally:", err);
    }

    try {
      const existing = await this.getTickets();
      const filtered = existing.filter((t) => t.id !== ticketId);
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent("support-tickets-updated", { detail: filtered }));
      return true;
    } catch {
      return false;
    }
  },

  // ================= HELP ARTICLES CRUD =================
  async getArticles(category?: string): Promise<HelpArticle[]> {
    try {
      const url = category && category !== "all"
        ? `/api/v1/help/articles?category=${encodeURIComponent(category)}`
        : "/api/v1/help/articles";
      const res = await api.get<HelpArticle[]>(url);
      if (Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.warn("Could not fetch articles from backend, checking local storage:", err);
    }

    try {
      const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
      if (raw) {
        const parsed: HelpArticle[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (category && category !== "all") {
            return parsed.filter((a) => a.category.toLowerCase() === category.toLowerCase());
          }
          return parsed;
        }
      }
    } catch {}

    const seed = getInitialArticles();
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(seed));
    if (category && category !== "all") {
      return seed.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }
    return seed;
  },

  async createArticle(payload: Partial<HelpArticle>): Promise<HelpArticle> {
    const newArticle: HelpArticle = {
      id: payload.id || `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: payload.category || "General",
      question: payload.question || "Untitled Guide",
      answer: payload.answer || "",
      helpfulCount: 0,
      unhelpfulCount: 0,
      tags: payload.tags || [],
      author: payload.author || "Platform Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await api.post<HelpArticle>("/api/v1/admin/help/articles", newArticle);
      if (res.data) {
        const saved = res.data;
        const existing = await this.getArticles();
        const updated = [saved, ...existing.filter((a) => a.id !== saved.id)];
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("help-articles-updated", { detail: updated }));
        return saved;
      }
    } catch (err) {
      console.warn("Backend create help article failed, saving locally:", err);
    }

    try {
      const existing = await this.getArticles();
      const updated = [newArticle, ...existing];
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("help-articles-updated", { detail: updated }));
    } catch {}

    return newArticle;
  },

  async updateArticle(id: string, updates: Partial<HelpArticle>): Promise<HelpArticle> {
    try {
      const res = await api.put<HelpArticle>(`/api/v1/admin/help/articles/${encodeURIComponent(id)}`, updates);
      if (res.data) {
        const saved = res.data;
        const existing = await this.getArticles();
        const next = existing.map((a) => (a.id === id ? saved : a));
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("help-articles-updated", { detail: next }));
        return saved;
      }
    } catch (err) {
      console.warn("Backend update help article failed, updating locally:", err);
    }

    const existing = await this.getArticles();
    const next = existing.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("help-articles-updated", { detail: next }));
    return next.find((a) => a.id === id)!;
  },

  async deleteArticle(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/v1/admin/help/articles/${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn("Backend delete help article failed, removing locally:", err);
    }

    try {
      const existing = await this.getArticles();
      const filtered = existing.filter((a) => a.id !== id);
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent("help-articles-updated", { detail: filtered }));
      return true;
    } catch {
      return false;
    }
  },

  async voteArticle(id: string, isHelpful: boolean): Promise<HelpArticle | null> {
    try {
      const res = await api.post<HelpArticle>(`/api/v1/help/articles/${encodeURIComponent(id)}/vote`, { isHelpful });
      if (res.data) {
        return res.data;
      }
    } catch {
      // Local vote update
    }

    try {
      const existing = await this.getArticles();
      const updated = existing.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            helpfulCount: isHelpful ? a.helpfulCount + 1 : a.helpfulCount,
            unhelpfulCount: !isHelpful ? a.unhelpfulCount + 1 : a.unhelpfulCount,
          };
        }
        return a;
      });
      localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(updated));
      return updated.find((a) => a.id === id) || null;
    } catch {
      return null;
    }
  },

  // ================= FAQ VOTES =================
  getFaqVotes(): Record<string, "up" | "down"> {
    try {
      const raw = localStorage.getItem(VOTES_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse FAQ votes:", e);
    }
    return {};
  },

  voteFaq(faqId: string, voteType: "up" | "down"): Record<string, "up" | "down"> {
    try {
      const current = this.getFaqVotes();
      if (current[faqId] === voteType) {
        delete current[faqId];
      } else {
        current[faqId] = voteType;
      }
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(current));
      return current;
    } catch (e) {
      console.error("Failed to persist FAQ vote:", e);
    }
    return {};
  },

  saveFaqVote(faqId: string, voteType: "up" | "down"): Record<string, "up" | "down"> {
    return this.voteFaq(faqId, voteType);
  },
};
