import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Callout } from "@/components/common/Callout";
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { checkBackendHealth } from "@/lib/api";
import { getEffectiveApiBaseUrl } from "@/lib/apiError";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "reachable" | "unreachable">("checking");

  const effectiveApiUrl = getEffectiveApiBaseUrl();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Clear server error whenever any form field is edited
  useEffect(() => {
    const subscription = watch(() => {
      if (serverError) {
        setServerError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, serverError]);

  // DEV-only: check backend reachability
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let isMounted = true;
    checkBackendHealth().then((res) => {
      if (isMounted) {
        setBackendStatus(res.ok ? "reachable" : "unreachable");
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const authRes = await login(data);
      setIsSuccess(true);
      setTimeout(() => {
        const role = authRes.role ? authRes.role.toUpperCase() : "STUDENT";
        const isAdminUser = role === "ADMIN" || role === "ROLE_ADMIN";

        if (isAdminUser) {
          const isValidAdminPath = from && from.startsWith("/admin") && from !== "/403";
          navigate(isValidAdminPath ? from : "/admin", { replace: true });
        } else {
          // Normal student must NEVER be redirected to /admin or /403
          const isAllowedStudentPath =
            from &&
            !from.startsWith("/admin") &&
            from !== "/403" &&
            from !== "/login" &&
            from !== "/register";
          navigate(isAllowedStudentPath ? from : "/dashboard", { replace: true });
        }
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed. Check your credentials.";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8 glass border-beam-card border border-border shadow-soft space-y-6 w-full relative">
        <div className="text-left space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">Student & Admin Access</span>
          <h1 className="font-serif text-3xl font-medium text-text-primary">Welcome Back</h1>
          <p className="text-xs text-text-secondary">Sign in to resume your mock interview series and placement benchmarks.</p>
        </div>

        {/* Error Banner with Retry */}
        {serverError && (
          <Callout
            variant="danger"
            icon={AlertCircle}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmit(onSubmit)()}
                className="text-[11px] py-1 px-2.5 shrink-0 border-red-500/40 text-red-600 dark:text-red-300 hover:bg-red-500/10"
              >
                Retry
              </Button>
            }
          >
            <span className="leading-relaxed">{serverError}</span>
          </Callout>
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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <span>Sign in to AI Interview Prep</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* DEV backend reachability hint */}
            {import.meta.env.DEV && backendStatus === "unreachable" && (
              <div className="flex items-center justify-center gap-2 text-[11px] text-amber-500/90 font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Backend not reachable at {effectiveApiUrl}</span>
              </div>
            )}
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
