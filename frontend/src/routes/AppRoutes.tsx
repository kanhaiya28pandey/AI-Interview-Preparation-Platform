import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import { LandingPage } from "@/pages/public/LandingPage";
import { Login } from "@/pages/public/Login";
import { Register } from "@/pages/public/Register";
import { ForgotPassword } from "@/pages/public/ForgotPassword";
import { Forbidden } from "@/pages/Forbidden";
import { NotFound } from "@/pages/NotFound";

// Layouts & Route Guards
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { VerificationGate } from "@/components/common/VerificationGate";

// Student Pages
import { StudentDashboard } from "@/pages/student/Dashboard";
import { Onboarding } from "@/pages/student/Onboarding";
import { Practice } from "@/pages/student/Practice";
import { ResumeAnalyzer } from "@/pages/student/ResumeAnalyzer";
import { Coding } from "@/pages/student/Coding";
import { MockInterview } from "@/pages/student/MockInterview";
import { Quiz } from "@/pages/student/Quiz";
import { Articles } from "@/pages/student/Articles";
import { Leaderboard } from "@/pages/student/Leaderboard";
import { Profile } from "@/pages/student/Profile";
import { Settings } from "@/pages/student/Settings";
import { HelpCenter } from "@/pages/student/HelpCenter";
import { VerifyIdentity } from "@/pages/student/VerifyIdentity";
import { PreparationRoadmaps } from "@/pages/student/PreparationRoadmaps";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminStudents } from "@/pages/admin/AdminStudents";
import { AdminStudentDetail } from "@/pages/admin/AdminStudentDetail";
import { AdminCodingTests } from "@/pages/admin/AdminCodingTests";
import { AdminLiveTests } from "@/pages/admin/AdminLiveTests";
import { AdminMockInterviews } from "@/pages/admin/AdminMockInterviews";
import { AdminArticles } from "@/pages/admin/AdminArticles";
import { AdminReports } from "@/pages/admin/AdminReports";
import { AdminSettings } from "@/pages/admin/AdminSettings";
import { AdminHelp } from "@/pages/admin/AdminHelp";
import { AdminVerifications } from "@/pages/admin/AdminVerifications";
import { ContentManagerHub } from "@/pages/admin/ContentManagerHub";
import { AdminTaxonomy } from "@/pages/admin/AdminTaxonomy";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/403" element={<Forbidden />} />

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
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/preparation" element={<PreparationRoadmaps />} />
        <Route
          path="/resume-analyzer"
          element={
            <VerificationGate featureName="Resume Analyzer">
              <ResumeAnalyzer />
            </VerificationGate>
          }
        />
        <Route
          path="/coding"
          element={
            <VerificationGate featureName="Coding Arena">
              <Coding />
            </VerificationGate>
          }
        />
        <Route
          path="/mock-interview"
          element={
            <VerificationGate featureName="Mock Interview">
              <MockInterview />
            </VerificationGate>
          }
        />
        <Route
          path="/quiz"
          element={
            <VerificationGate featureName="MCQ Quizzes">
              <Quiz />
            </VerificationGate>
          }
        />
        <Route path="/articles" element={<Articles />} />
        <Route
          path="/leaderboard"
          element={
            <VerificationGate featureName="Leaderboard">
              <Leaderboard />
            </VerificationGate>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/verify-identity" element={<VerifyIdentity />} />
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
        <Route index element={<AdminDashboard />} />
        <Route path="content" element={<ContentManagerHub />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="students/:id" element={<AdminStudentDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="coding-tests" element={<AdminCodingTests />} />
        <Route path="taxonomy" element={<AdminTaxonomy />} />
        <Route path="live-tests" element={<AdminLiveTests />} />
        <Route path="mock-interviews" element={<AdminMockInterviews />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="help" element={<AdminHelp />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
