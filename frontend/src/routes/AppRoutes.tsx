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

// Student Pages
import { StudentDashboard } from "@/pages/student/Dashboard";
import { Practice } from "@/pages/student/Practice";
import { Coding } from "@/pages/student/Coding";
import { MockInterview } from "@/pages/student/MockInterview";
import { Quiz } from "@/pages/student/Quiz";
import { Articles } from "@/pages/student/Articles";
import { Leaderboard } from "@/pages/student/Leaderboard";
import { Profile } from "@/pages/student/Profile";
import { Settings } from "@/pages/student/Settings";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminCodingTests } from "@/pages/admin/AdminCodingTests";
import { AdminMockInterviews } from "@/pages/admin/AdminMockInterviews";
import { AdminArticles } from "@/pages/admin/AdminArticles";
import { AdminReports } from "@/pages/admin/AdminReports";
import { AdminSettings } from "@/pages/admin/AdminSettings";

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
        <Route path="/practice" element={<Practice />} />
        <Route path="/coding" element={<Coding />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
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
        <Route path="users" element={<AdminUsers />} />
        <Route path="coding-tests" element={<AdminCodingTests />} />
        <Route path="mock-interviews" element={<AdminMockInterviews />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
