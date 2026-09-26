import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { AlertCircle, CheckCircle2, Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Register: React.FC = () => {
  const { register: registerAuth, loginDemoStudent } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordVal = watch("password") || "";

  // Password strength calculation
  const getPasswordStrength = (pass: string): { score: number; label: string; color: "accent" | "danger" | "live" } => {
    if (pass.length === 0) return { score: 0, label: "", color: "accent" };
    if (pass.length < 8) return { score: 33, label: "Weak (min 8 chars)", color: "danger" };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*]/.test(pass);
    if (hasNum && hasSpecial) return { score: 100, label: "Strong password", color: "live" };
    return { score: 66, label: "Medium strength", color: "accent" };
  };

  const strength = getPasswordStrength(passwordVal);

  const handleDemoStudent = () => {
    loginDemoStudent();
    navigate("/dashboard", { replace: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await registerAuth({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        const role = res.role ? res.role.toUpperCase() : "STUDENT";
        if (role === "ADMIN" || role === "ROLE_ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/verify-identity", { replace: true });
        }
      }, 700);
    } catch (err: any) {
      setServerError(err.message || "Registration failed. That email might already be in use.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8 bg-surface border border-border shadow-soft space-y-6 w-full">
        <div className="text-left space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">Student Registration</span>
          <h1 className="font-serif text-3xl font-medium text-text-primary">Join AI Interview Preparation</h1>
          <p className="text-xs text-text-secondary">Set up your verified student account to practice AI mock interviews.</p>
        </div>

        {/* Instant Demo */}
        <div className="p-3 bg-surface-raised border border-cyan-400/30 rounded-xl flex items-center justify-between">
          <div className="text-xs font-mono text-text-secondary">
            <span className="text-accent font-semibold block">Want to test without registering?</span>
            <span>Click instant demo to explore immediately.</span>
          </div>
          <Button variant="teal-cyan" size="sm" onClick={handleDemoStudent} type="button" className="text-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Try Demo
          </Button>
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger-bg border border-danger/40 text-danger text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-3 bg-live/20 text-live rounded-full inline-block">
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <h3 className="font-serif text-xl font-medium text-text-primary">Account Created!</h3>
            <p className="text-xs text-text-muted font-mono">Redirecting to student dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="Kanhaiya Pandey"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="College Email"
              type="email"
              placeholder="student@srmist.edu.in"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-text-muted hover:text-text-primary text-xs"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordVal.length > 0 && (
                <div className="space-y-1 pt-1">
                  <Progress value={strength.score} color={strength.color} className="h-1.5" />
                  <span className="text-[10px] font-mono text-text-muted block text-right">{strength.label}</span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-text-muted pt-2 border-t border-border">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};
