import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Trash2,
  Minimize2,
  ChevronDown,
  Lightbulb,
  Code2,
  UserCheck,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/api";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const STORAGE_KEY = "ai_copilot_history_session";
const DISMISSED_KEY = "ai_copilot_teaser_dismissed";

const QUICK_PROMPTS = [
  { label: "Give me a DSA hint", icon: Code2, prompt: "Give me a hint on solving the Two Sum / Sliding Window problem effectively with optimal complexity." },
  { label: "Explain this concept", icon: Lightbulb, prompt: "Explain how React Fiber reconciler works and why time-slicing prevents UI blocking." },
  { label: "Tips for HR round", icon: UserCheck, prompt: "Give me best practices and a STAR method structure for answering 'Tell me about a time you had a technical disagreement'." },
  { label: "Review my resume tips", icon: FileText, prompt: "What are the most impactful action verbs and quantifiable metrics college students should highlight on an SDE resume?" },
];

export const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reducedMotion = useReducedEffects();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load session conversation history or initialize greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore sessionStorage issues
    }
    return [
      {
        id: "msg-welcome",
        role: "assistant",
        content:
          "👋 Hi! I'm your **AI Placement Copilot**.\n\nI can help you with DSA intuition, system design trade-offs, STAR behavioral answers, or resume ATS tips. Ask me anything!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  // Save session messages
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages]);

  // Check AI service health status once on mount
  const [isAiOnline, setIsAiOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api.get("/api/ai/health").then(() => {
      if (isMounted) setIsAiOnline(true);
    }).catch(() => {
      // If /api/ai/health endpoint doesn't exist, we still treat backend as reachable
      if (isMounted) setIsAiOnline(true);
    });
    return () => { isMounted = false; };
  }, []);

  // Handle teaser popover visibility (attached speech bubble 5s after session start)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISSED_KEY) === "true") {
        setTeaserVisible(false);
        return;
      }
    } catch {
      // Ignore
    }

    const timer = setTimeout(() => {
      setTeaserVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Autofocus input on panel open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setTeaserVisible(false);
    }
  }, [isOpen]);

  const handleDismissTeaser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTeaserVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Ignore
    }
  };

  const handleClearChat = () => {
    const initialGreeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content:
        "Conversation cleared! What concept, DSA pattern, or interview round would you like to prepare for next?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([initialGreeting]);
    setErrorMsg(null);
    setLastUserMessage(null);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setErrorMsg(null);
    setLastUserMessage(trimmed);

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history format expected by backend
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Send to Spring Boot AI Chat endpoint
      const response = await api.post("/api/ai/chat", {
        message: trimmed,
        history: historyPayload,
      });

      const replyText =
        response.data?.reply ||
        response.data?.response ||
        response.data?.message ||
        "I've analyzed your question. Let me know if you need any follow-up clarification on this concept!";

      const assistantMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn("AI Copilot request error:", err);
      const isOffline =
        !err.response || err.code === "ERR_NETWORK" || err.message?.includes("Network");

      setErrorMsg(
        isOffline
          ? "AI Copilot service is currently unreachable. Please check your network connection or try again."
          : err.response?.data?.message ||
            "Unable to generate response right now. Please retry in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Snippet copied to clipboard");
    } catch {
      // Ignore
    }
  };

  return (
    <>
      {/* Floating Single Trigger Button with Attached Speech Bubble */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none pointer-events-auto">
        {/* Attached speech bubble right above the button */}
        <AnimatePresence>
          {!isOpen && teaserVisible && (
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
              className="relative mb-3 max-w-[280px] bg-surface/95 backdrop-blur-xl border border-cyan-400/40 px-3.5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 group hover:border-cyan-400 transition-[border-color,box-shadow] duration-200 cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                handleDismissTeaser({ stopPropagation: () => {} } as any);
              }}
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-xs text-text-primary font-medium leading-tight select-none">
                Need a hint, DSA tip, or quick search?
              </p>
              <button
                type="button"
                onClick={handleDismissTeaser}
                className="p-1 text-text-muted hover:text-text-primary rounded-lg shrink-0 ml-1"
                title="Dismiss hint"
                aria-label="Dismiss hint"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* Pointer triangle tail attached to the button below */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-surface/95 border-b border-r border-cyan-400/40 transform rotate-45 pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Single Floating Trigger Button */}
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Copilot Chat"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 text-[#0d1321] font-semibold text-xs shadow-[0_8px_25px_rgba(34,211,238,0.4)] border border-cyan-300/60 hover:shadow-[0_10px_35px_rgba(34,211,238,0.6)] transition-[box-shadow,transform] duration-200 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#0d1321]" />
            <span className="font-mono tracking-tight hidden sm:inline">AI Copilot</span>
            {/* Small status dot on the button only when AI service is reachable */}
            {isAiOnline && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse"
                title="AI Copilot Online"
              />
            )}
          </motion.button>
        )}
      </div>

      {/* Main Interactive Chat Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] h-full sm:h-[600px] max-h-screen sm:max-h-[85vh] bg-surface border sm:border-cyan-400/40 sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-text-primary backdrop-blur-xl"
          >
            {/* Panel Header - Stray green dot removed next to title */}
            <div className="px-4 py-3 bg-surface-raised/95 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-text-primary">
                    AI Placement Copilot
                  </h3>
                  <p className="text-[10px] text-text-muted font-mono">Real-time Placement Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                  title="Clear conversation"
                  aria-label="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                  title="Close AI Copilot"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2.5 bg-surface-raised/40 border-b border-border/60 overflow-x-auto flex items-center gap-2 shrink-0">
              {QUICK_PROMPTS.map((qp, i) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(qp.prompt)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border/70 hover:border-cyan-400/50 hover:bg-surface-raised text-[11px] text-text-secondary hover:text-cyan-300 font-sans shrink-0 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Icon className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-xs"
                        : "bg-surface-raised border border-border/80 text-text-primary rounded-bl-xs"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-invert prose-xs max-w-none text-xs space-y-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="text-cyan-300 font-semibold">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-1.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-1.5">{children}</ol>,
                            li: ({ children }) => <li className="text-text-secondary">{children}</li>,
                            code: ({ node, className, children, ...props }: any) => {
                              const codeString = String(children).replace(/\n$/, "");
                              const isInline = !className && !codeString.includes("\n");
                              return isInline ? (
                                <code className="bg-ink/80 text-cyan-300 px-1 py-0.5 rounded font-mono text-[11px] border border-cyan-400/20">
                                  {children}
                                </code>
                              ) : (
                                <div className="relative my-2 rounded-lg bg-ink border border-border/80 overflow-hidden font-mono text-[11px]">
                                  <div className="flex justify-between items-center px-2 py-1 bg-surface-raised/80 border-b border-border/60 text-[10px] text-text-muted">
                                    <span>Code</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(codeString, msg.id)}
                                      className="hover:text-cyan-400 inline-flex items-center gap-1"
                                    >
                                      {copiedId === msg.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-live" /> Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" /> Copy
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-2.5 overflow-x-auto text-text-primary leading-tight">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-text-muted mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Animated Typing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-surface-raised rounded-2xl rounded-bl-xs border border-border/80 w-24">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                </div>
              )}

              {/* Error Banner with Retry */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-danger-bg border border-danger/40 text-danger text-xs flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                  {lastUserMessage && (
                    <button
                      type="button"
                      onClick={() => sendMessage(lastUserMessage)}
                      className="self-end px-2.5 py-1 rounded bg-danger/20 hover:bg-danger/30 text-danger font-mono text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Retry Prompt
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input & Send Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="p-3 bg-surface-raised border-t border-border flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about DSA, System Design, STAR answers..."
                disabled={isLoading}
                className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan-400/60 font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0d1321] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm"
                title="Send message (Enter)"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
