export interface SupportTicket {
  id: string;
  category: "Bug Report" | "Feature Request" | "Account Issue" | "Feedback" | "Other";
  subject: string;
  description: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TCK-2026-0091",
    category: "Feature Request",
    subject: "Add dark mode preview for code editor syntax highlighting",
    description:
      "The dark theme works cleanly on pages. Would love an option to customize editor font sizes and line numbers too.",
    status: "Resolved",
    createdAt: "2026-09-24T14:30:00.000Z",
    userName: "Kanhaiya Pandey",
    userEmail: "kanhaiya.student@srmist.edu.in",
  },
  {
    id: "TCK-2026-0084",
    category: "Bug Report",
    subject: "Profile completion percentage display sync across components",
    description:
      "Verified that profile completion ring in the topbar and sidebar updates immediately upon saving new personal details.",
    status: "Resolved",
    createdAt: "2026-09-22T09:15:00.000Z",
    userName: "Kanhaiya Pandey",
    userEmail: "kanhaiya.student@srmist.edu.in",
  },
];

const getStoredTickets = (): SupportTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse stored support tickets:", e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
};

export const supportService = {
  async getTickets(): Promise<SupportTicket[]> {
    await delay(150);
    return getStoredTickets();
  },

  async createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
    await delay(250);
    const existing = getStoredTickets();

    // Get active user from localStorage if present
    let userName = "Student User";
    let userEmail = "student@srmist.edu.in";
    try {
      const activeUserRaw = localStorage.getItem("ai_interview_prep_user");
      if (activeUserRaw) {
        const parsed = JSON.parse(activeUserRaw);
        if (parsed.name) userName = parsed.name;
        if (parsed.email) userEmail = parsed.email;
      }
    } catch (e) {
      console.error("Failed to parse user for support ticket:", e);
    }

    const ticketNumber = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: `TCK-2026-${ticketNumber}`,
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      attachmentName: payload.attachmentName,
      attachmentDataUrl: payload.attachmentDataUrl,
      status: "Open",
      createdAt: new Date().toISOString(),
      userName,
      userEmail,
    };

    const updated = [newTicket, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTicket;
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

  saveFaqVote(faqId: string, vote: "up" | "down"): Record<string, "up" | "down"> {
    const votes = this.getFaqVotes();
    votes[faqId] = vote;
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
    return votes;
  },
};
