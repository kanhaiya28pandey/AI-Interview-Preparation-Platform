import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from "lucide-react";

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [issuedToken, setIssuedToken] = useState<string>("");
  const [banner, setBanner] = useState<{ type: "ok" | "bad"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Request Form
  const requestForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Reset Form
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onRequestSubmit = async (data: ForgotPasswordFormData) => {
    setBanner(null);
    setIsSubmitting(true);
    try {
      const tokenResult = await forgotPassword(data.email.trim());
      setIssuedToken(tokenResult);
      setBanner({
        type: "ok",
        text: `Reset token issued: ${tokenResult}. Switch to reset step below.`,
      });
      // Pre-fill reset form token
      resetForm.setValue("token", tokenResult);
      setTimeout(() => {
        setStep("reset");
      }, 800);
    } catch (err: any) {
      setBanner({
        type: "bad",
        text: err.message || "Couldn't find an account associated with that email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setBanner(null);
    setIsSubmitting(true);
    try {
      const msg = await resetPassword(data.token.trim(), data.newPassword);
      setBanner({
        type: "ok",
        text: `${msg || "Password updated successfully!"} You can sign in now.`,
      });
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      setBanner({
        type: "bad",
        text: err.message || "That reset token is invalid or expired.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8 bg-surface border border-border shadow-soft space-y-6 w-full">
        <div className="text-left space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">Account Recovery</span>
          <h1 className="font-serif text-3xl font-medium text-text-primary">
            {step === "request" ? "Reset your password" : "Choose a new password"}
          </h1>
          <p className="text-xs text-text-muted">
            {step === "request"
              ? "Enter the email associated with your student account."
              : "Paste your reset token and enter your new password."}
          </p>
        </div>

        {banner && (
          <div
            className={`flex items-start gap-2.5 p-3 rounded-lg text-xs ${
              banner.type === "ok"
                ? "bg-[#4ade80]/15 border border-[#4ade80]/40 text-[#4ade80]"
                : "bg-[#2b1a1d] border border-[#f2867b]/40 text-[#f2867b]"
            }`}
          >
            {banner.type === "ok" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#4ade80]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#f2867b]" />
            )}
            <span className="leading-relaxed font-mono break-all">{banner.text}</span>
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="student@srmist.edu.in"
              error={requestForm.formState.errors.email?.message}
              {...requestForm.register("email")}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              <span>Send reset token</span>
            </Button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4" noValidate>
            <Input
              label="Reset Token"
              type="text"
              placeholder="8ab1b782-44a8-4146-8237-..."
              error={resetForm.formState.errors.token?.message}
              {...resetForm.register("token")}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              error={resetForm.formState.errors.newPassword?.message}
              {...resetForm.register("newPassword")}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              error={resetForm.formState.errors.confirmNewPassword?.message}
              {...resetForm.register("confirmNewPassword")}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Update Password
            </Button>
          </form>
        )}

        <div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border">
          <Link to="/login" className="flex items-center gap-1 hover:text-text-primary">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
          {step === "request" && (
            <button
              type="button"
              onClick={() => setStep("reset")}
              className="text-accent hover:underline font-mono"
            >
              Have a token already?
            </button>
          )}
        </div>
      </Card>
    </AuthLayout>
  );
};
