import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ADMIN_FAQ_ITEMS, FAQItem } from "@/mocks/faqs";
import { supportService, SupportTicket } from "@/services/supportService";
import { Shield, Search, ChevronDown, ChevronUp, Ticket, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const AdminHelp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    supportService.getTickets().then(setTickets);
  }, []);

  const handleToggleTicketStatus = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const nextStatus =
            t.status === "Open" ? "In Review" : t.status === "In Review" ? "Resolved" : "Open";
          toast.success(`Ticket ${t.id} status set to ${nextStatus}`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const filteredAdminFaqs = ADMIN_FAQ_ITEMS.filter(
    (item) =>
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-text-primary">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Admin Help & Operations
            </h1>
            <Badge variant="accent" className="font-mono text-[10px] uppercase">
              Platform Admin
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
            Platform operations guide, admin FAQs, and student support ticket status management.
          </p>
        </div>
      </div>

      {/* Admin FAQs */}
      <Card className="p-6 bg-surface border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <h2 className="font-serif text-lg font-bold text-text-primary">Admin Platform Operations FAQs</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search admin FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface-raised border border-border rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredAdminFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="p-4 bg-surface-raised border border-border rounded-xl space-y-2 cursor-pointer"
                onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-text-primary">{faq.question}</h3>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </div>
                {isExpanded && (
                  <p className="text-xs text-text-secondary font-sans leading-relaxed pt-2 border-t border-border">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Admin Student Ticket Queue */}
      <Card className="p-6 bg-surface border-border space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            <h2 className="font-serif text-lg font-bold text-text-primary">Student Support Ticket Queue</h2>
          </div>
          <span className="text-xs font-mono text-text-muted">{tickets.length} Submitted Tickets</span>
        </div>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-surface-raised border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-400">{t.id}</span>
                  <Badge variant="outline">{t.category}</Badge>
                  <span className="text-[11px] text-text-muted">By {t.userName} ({t.userEmail})</span>
                </div>
                <h4 className="font-sans text-xs font-bold text-text-primary">{t.subject}</h4>
                <p className="font-sans text-xs text-text-secondary">{t.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    t.status === "Resolved"
                      ? "bg-teal-400/20 text-teal-400 border-teal-400/40"
                      : "bg-amber-400/20 text-amber-400 border-amber-400/40"
                  }`}
                >
                  {t.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleTicketStatus(t.id)}
                  className="gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" /> Advance Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
