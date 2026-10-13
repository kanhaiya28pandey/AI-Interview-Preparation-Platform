import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CardSkeleton } from "@/components/common/Skeletons";

// Core Public Pages
import { LandingPage } from "@/pages/public/LandingPage";

// Lazy-loaded Public Pages
const Login = lazy(() => import("@/pages/public/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("@/pages/public/Register").then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import("@/pages/public/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const Forbidden = lazy(() => import("@/pages/Forbidden").then(m => ({ default: m.Forbidden })));
const NotFound = lazy(() => import("@/pages/NotFound").then(m => ({ default: m.NotFound })));

// Layouts & Route Guards
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { VerifiedRoute } from "./VerifiedRoute";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Student Pages
import { StudentDashboard } from "@/pages/student/Dashboard";
const Onboarding = lazy(() => import("@/pages/student/Onboarding").then(m => ({ default: m.Onboarding })));
const Practice = lazy(() => import("@/pages/student/Practice").then(m => ({ default: m.Practice })));
const ResumeAnalyzer = lazy(() => import("@/pages/student/ResumeAnalyzer").then(m => ({ default: m.ResumeAnalyzer })));
const Coding = lazy(() => import("@/pages/student/Coding").then(m => ({ default: m.Coding })));
const MockInterview = lazy(() => import("@/pages/student/MockInterview").then(m => ({ default: m.MockInterview })));
const Quiz = lazy(() => import("@/pages/student/Quiz").then(m => ({ default: m.Quiz })));
const Articles = lazy(() => import("@/pages/student/Articles").then(m => ({ default: m.Articles })));
const Leaderboard = lazy(() => import("@/pages/student/Leaderboard").then(m => ({ default: m.Leaderboard })));
const Profile = lazy(() => import("@/pages/student/Profile").then(m => ({ default: m.Profile })));
const Settings = lazy(() => import("@/pages/student/Settings").then(m => ({ default: m.Settings })));
const HelpCenter = lazy(() => import("@/pages/student/HelpCenter").then(m => ({ default: m.HelpCenter })));
const VerifyIdentity = lazy(() => import("@/pages/student/VerifyIdentity").then(m => ({ default: m.VerifyIdentity })));
const PreparationRoadmaps = lazy(() => import("@/pages/student/PreparationRoadmaps").then(m => ({ default: m.PreparationRoadmaps })));
const LiveTests = lazy(() => import("@/pages/student/LiveTests").then(m => ({ default: m.LiveTests })));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminStudents = lazy(() => import("@/pages/admin/AdminStudents").then(m => ({ default: m.AdminStudents })));
const AdminStudentDetail = lazy(() => import("@/pages/admin/AdminStudentDetail").then(m => ({ default: m.AdminStudentDetail })));
const AdminCodingTests = lazy(() => import("@/pages/admin/AdminCodingTests").then(m => ({ default: m.AdminCodingTests })));
const AdminLiveTests = lazy(() => import("@/pages/admin/AdminLiveTests").then(m => ({ default: m.AdminLiveTests })));
const AdminMockInterviews = lazy(() => import("@/pages/admin/AdminMockInterviews").then(m => ({ default: m.AdminMockInterviews })));
const AdminArticles = lazy(() => import("@/pages/admin/AdminArticles").then(m => ({ default: m.AdminArticles })));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports").then(m => ({ default: m.AdminReports })));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings").then(m => ({ default: m.AdminSettings })));
const AdminHelp = lazy(() => import("@/pages/admin/AdminHelp").then(m => ({ default: m.AdminHelp })));
const AdminVerifications = lazy(() => import("@/pages/admin/AdminVerifications").then(m => ({ default: m.AdminVerifications })));
const ContentManagerHub = lazy(() => import("@/pages/admin/ContentManagerHub").then(m => ({ default: m.ContentManagerHub })));
const AdminTaxonomy = lazy(() => import("@/pages/admin/AdminTaxonomy").then(m => ({ default: m.AdminTaxonomy })));

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="w-full p-6 animate-fade-in">
        <CardSkeleton />
      </div>
    }
  >
    {children}
  </Suspense>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />
      <Route path="/register" element={<SuspenseWrapper><Register /></SuspenseWrapper>} />
      <Route path="/forgot-password" element={<SuspenseWrapper><ForgotPassword /></SuspenseWrapper>} />
      <Route path="/403" element={<SuspenseWrapper><Forbidden /></SuspenseWrapper>} />

      {/* Protected Student Routes */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="STUDENT">
              <StudentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {/* Unrestricted Student Routes */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/verify-identity" element={<SuspenseWrapper><VerifyIdentity /></SuspenseWrapper>} />
        <Route path="/help" element={<SuspenseWrapper><HelpCenter /></SuspenseWrapper>} />
        <Route path="/profile" element={<SuspenseWrapper><Profile /></SuspenseWrapper>} />
        <Route path="/settings" element={<SuspenseWrapper><Settings /></SuspenseWrapper>} />
        <Route path="/preparation" element={<SuspenseWrapper><PreparationRoadmaps /></SuspenseWrapper>} />
        <Route path="/practice" element={<SuspenseWrapper><Practice /></SuspenseWrapper>} />
        <Route path="/articles" element={<SuspenseWrapper><Articles /></SuspenseWrapper>} />
        <Route path="/articles/:slug" element={<SuspenseWrapper><Articles /></SuspenseWrapper>} />

        {/* Verified Only Student Routes */}
        <Route path="/onboarding" element={<VerifiedRoute><SuspenseWrapper><Onboarding /></SuspenseWrapper></VerifiedRoute>} />
        <Route path="/coding" element={<VerifiedRoute><SuspenseWrapper><Coding /></SuspenseWrapper></VerifiedRoute>} />
        <Route path="/live-tests" element={<VerifiedRoute><SuspenseWrapper><LiveTests /></SuspenseWrapper></VerifiedRoute>} />
        <Route path="/mock-interview" element={<VerifiedRoute><SuspenseWrapper><MockInterview /></SuspenseWrapper></VerifiedRoute>} />
        <Route path="/quiz" element={<VerifiedRoute><SuspenseWrapper><Quiz /></SuspenseWrapper></VerifiedRoute>} />
        <Route path="/resume-analyzer" element={<VerifiedRoute><SuspenseWrapper><ResumeAnalyzer /></SuspenseWrapper></VerifiedRoute>} />
        <Route path="/leaderboard" element={<VerifiedRoute><SuspenseWrapper><Leaderboard /></SuspenseWrapper></VerifiedRoute>} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="ADMIN">
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
        <Route path="users" element={<SuspenseWrapper><AdminUsers /></SuspenseWrapper>} />
        <Route path="students" element={<SuspenseWrapper><AdminStudents /></SuspenseWrapper>} />
        <Route path="students/:id" element={<SuspenseWrapper><AdminStudentDetail /></SuspenseWrapper>} />
        <Route path="verifications" element={<SuspenseWrapper><AdminVerifications /></SuspenseWrapper>} />
        <Route path="coding-tests" element={<SuspenseWrapper><AdminCodingTests /></SuspenseWrapper>} />
        <Route path="live-tests" element={<SuspenseWrapper><AdminLiveTests /></SuspenseWrapper>} />
        <Route path="mock-interviews" element={<SuspenseWrapper><AdminMockInterviews /></SuspenseWrapper>} />
        <Route path="articles" element={<SuspenseWrapper><AdminArticles /></SuspenseWrapper>} />
        <Route path="content" element={<SuspenseWrapper><ContentManagerHub /></SuspenseWrapper>} />
        <Route path="content-manager" element={<Navigate to="/admin/content" replace />} />
        <Route path="taxonomy" element={<SuspenseWrapper><AdminTaxonomy /></SuspenseWrapper>} />
        <Route path="reports" element={<SuspenseWrapper><AdminReports /></SuspenseWrapper>} />
        <Route path="settings" element={<SuspenseWrapper><AdminSettings /></SuspenseWrapper>} />
        <Route path="help" element={<SuspenseWrapper><AdminHelp /></SuspenseWrapper>} />
        <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
    </Routes>
  );
};

export default AppRoutes;
