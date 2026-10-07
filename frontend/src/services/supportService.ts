import api from "@/lib/api";
import { notificationService } from "./notificationService";

export interface SupportTicket {
  id: string;
  category: "Bug Report" | "Feature Request" | "Account Issue" | "Feedback" | "Other";
  subject: string;
  description: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  status: "Open" | "In Review" | "Resolved";
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
}

const STORAGE_KEY = "ai_interview_prep_tickets";
const VOTES_STORAGE_KEY = "ai_interview_prep_faq_votes";

export const supportService = {
  async getTickets(): Promise<SupportTicket[]> {
    try {
      const res = await api.get<SupportTicket[]>("/api/v1/support/tickets");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Try admin endpoint
      try {
        const resAdmin = await api.get<SupportTicket[]>("/api/v1/admin/support/tickets");
        if (Array.isArray(resAdmin.data) && resAdmin.data.length > 0) {
          return resAdmin.data;
        }
      } catch (err) {
        console.warn("Could not fetch support tickets from backend:", err);
      }
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    return [];
  },

  async createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
    try {
      const res = await api.post<SupportTicket>("/api/v1/support/tickets", payload);
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend create ticket failed, saving locally:", err);
    }

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

    const newTicket: SupportTicket = {
      id: `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      attachmentName: payload.attachmentName,
      attachmentDataUrl: payload.attachmentDataUrl,
      status: "Open",
      createdAt: new Date().toISOString(),
      userId: userId || undefined,
      userName,
      userEmail,
    };

    try {
      const existing = await this.getTickets();
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newTicket, ...existing]));
    } catch {}

    return newTicket;
  },

  async updateTicketStatus(ticketId: string, nextStatus: "Open" | "In Review" | "Resolved"): Promise<SupportTicket | null> {
    try {
      const res = await api.patch<SupportTicket>(`/api/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
        status: nextStatus,
      });
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend update ticket status failed, saving locally:", err);
    }

    try {
      const existing = await this.getTickets();
      const updated = existing.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated.find((t) => t.id === ticketId) || null;
    } catch {
      return null;
    }
  },

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
