import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, Sparkles, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Login: React.FC = () => {
  const { login, loginDemoStudent, loginDemoAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleDemoStudent = () => {
    loginDemoStudent();
    navigate("/dashboard", { replace: true });
  };

  const handleDemoAdmin = () => {
    loginDemoAdmin();
    navigate("/admin", { replace: true });
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const authRes = await login(data);
      setIsSuccess(true);
      setTimeout(() => {
        const role = authRes.role ? authRes.role.toUpperCase() : "STUDENT";
        if (role === "ADMIN" || role === "ROLE_ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate(from === "/admin" ? "/dashboard" : from, { replace: true });
        }
      }, 700);
    } catch (err: any) {
      setServerError(err.message || "Sign in failed. Check your credentials.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8 glass border-beam-card border border-border shadow-soft space-y-6 w-full relative">
        <div className="text-left space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">Student / Admin Access</span>
          <h1 className="font-serif text-3xl font-medium text-text-primary">Welcome Back</h1>
          <p className="text-xs text-text-secondary">Sign in to resume your mock interview series and placement benchmarks.</p>
        </div>

        {/* Instant Demo Buttons */}
        <div className="p-3 bg-surface-raised border border-cyan-400/30 rounded-xl space-y-2">
          <span className="font-mono text-[11px] text-accent font-semibold uppercase tracking-wider block text-center">
            ✨ Instant Demo Access (No Backend Required)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="teal-cyan" size="sm" onClick={handleDemoStudent} type="button" className="text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Demo Student
            </Button>
            <Button variant="outline" size="sm" onClick={handleDemoAdmin} type="button" className="text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Demo Admin
            </Button>
          </div>
        </div>

        {/* Error Banner */}
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
            <h3 className="font-serif text-xl font-medium text-text-primary">Sign in Successful!</h3>
            <p className="text-xs text-text-muted font-mono">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="College Email"
              type="email"
              placeholder="student@srmist.edu.in"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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

            <div className="flex items-center justify-end text-xs">
              <Link to="/forgot-password" className="text-accent hover:underline font-mono">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              <span>Sign in to AI Interview Prep</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-text-muted pt-2 border-t border-border">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:underline font-medium">
            Create student account
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};
