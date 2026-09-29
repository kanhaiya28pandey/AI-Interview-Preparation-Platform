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
import { AlertCircle, CheckCircle2, KeyRound, ArrowLeft, Mail, RefreshCw } from "lucide-react";

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [banner, setBanner] = useState<{ type: "ok" | "bad"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const requestForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onRequestSubmit = async (data: ForgotPasswordFormData) => {
    setBanner(null);
    setIsSubmitting(true);
    try {
      const email = data.email.trim();
      const message = await forgotPassword(email);
      setSubmittedEmail(email);
      setBanner({
        type: "ok",
        text: `${message || "OTP has been sent to your email."} Please check your inbox and enter the 6-digit code below.`,
      });
      setTimeout(() => {
        setStep("reset");
      }, 1000);
    } catch (err: any) {
      setBanner({
        type: "bad",
        text: err.message || "Couldn't find an account associated with that email. Please check your spelling.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setBanner(null);
    setIsSubmitting(true);
    try {
      const msg = await resetPassword(data.otp.trim(), data.newPassword, submittedEmail);
      setBanner({
        type: "ok",
        text: `${msg || "Password updated successfully!"} Redirecting to login...`,
      });
      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (err: any) {
      setBanner({
        type: "bad",
        text: err.message || "The OTP code entered is invalid or expired. Please check and try again.",
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
            {step === "request" ? "Reset your password" : "Enter OTP & Choose New Password"}
          </h1>
          <p className="text-xs text-text-muted">
            {step === "request"
              ? "Enter your registered email address to receive a secure 6-digit OTP code."
              : `Enter the 6-digit OTP sent to ${submittedEmail || "your email"} and choose your new password.`}
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
              label="Registered Email Address"
              type="email"
              placeholder="student@srmist.edu.in"
              error={requestForm.formState.errors.email?.message}
              {...requestForm.register("email")}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              <span>Send 6-Digit OTP</span>
            </Button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4" noValidate>
            <Input
              label="6-Digit OTP Code"
              type="text"
              maxLength={6}
              placeholder="e.g. 123456"
              error={resetForm.formState.errors.otp?.message}
              {...resetForm.register("otp")}
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
          {step === "request" ? (
            <button
              type="button"
              onClick={() => setStep("reset")}
              className="text-accent hover:underline font-mono"
            >
              Have an OTP already?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setBanner(null);
                setStep("request");
              }}
              className="text-accent hover:underline font-mono flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Resend or change email
            </button>
          )}
        </div>
      </Card>
    </AuthLayout>
  );
};
