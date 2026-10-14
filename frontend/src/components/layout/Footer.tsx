import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import {
  Code2,
  Video,
  BookOpen,
  Trophy,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/80 bg-surface/90 text-text-muted select-none mt-auto">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-border/60">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm font-sans">
              The comprehensive AI-powered interview practice platform built for college campus placements. Practice DSA coding, simulated mock interviews, and technical roadmaps with real-time AI scoring.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-live/10 border border-live/30 text-live text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-live animate-ping" />
                System Status: Active & Operational
              </span>
            </div>
          </div>

          {/* Practice & Prep */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-text-primary tracking-wide">
              Practice Tracks
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/practice" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400/70" />
                  <span>Curriculum Topics</span>
                </Link>
              </li>
              <li>
                <Link to="/coding" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400/70" />
                  <span>Coding Arena</span>
                </Link>
              </li>
              <li>
                <Link to="/mock-interview" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-teal-400/70" />
                  <span>AI Mock Interview</span>
                </Link>
              </li>
              <li>
                <Link to="/preparation" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400/70" />
                  <span>Prep Roadmaps</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Placement */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-text-primary tracking-wide">
              Placement Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/resume-analyzer" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400/70" />
                  <span>Resume ATS Scanner</span>
                </Link>
              </li>
              <li>
                <Link to="/articles" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400/70" />
                  <span>Interview Guides</span>
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400/70" />
                  <span>Campus Leaderboard</span>
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/70" />
                  <span>Domain Quizzes</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Access */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-text-primary tracking-wide">
              Platform Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-cyan-400 transition-colors">
                  Create Student Account
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-cyan-400 transition-colors">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link to="/verify-identity" className="hover:text-cyan-400 transition-colors">
                  Student ID Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-text-primary tracking-wide">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/help" className="hover:text-cyan-400 transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 pb-6 sm:pb-2 flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted gap-4 sm:pr-24">
          <div className="font-mono text-[11px] text-center sm:text-left">
            © {new Date().getFullYear()} AI Interview Preparation Platform. Designed for campus placement drives.
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] flex-wrap justify-center">
            <Link to="/help" className="hover:text-text-primary transition-colors">
              Support
            </Link>
            <Link to="#" className="hover:text-text-primary transition-colors">
              Privacy
            </Link>
            <Link to="#" className="hover:text-text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
