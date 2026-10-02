import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerStep1Schema,
  RegisterStep1FormData,
  registerStep2Schema,
  RegisterStep2FormData,
} from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { useAdminStore } from "@/context/AdminStoreContext";
import { profileService } from "@/services/profileService";
import { verificationService } from "@/services/verificationService";
import { suggestCollegeFromEmail, INITIAL_MOCK_VERIFICATIONS } from "@/mocks/verifications";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { CollegeIdUploader, CollegeIdData } from "@/components/verification/CollegeIdUploader";
import { YearSemesterSelect } from "@/components/common/YearSemesterSelect";
import { COURSE_DURATIONS } from "@/lib/courseDurations";
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Check,
  Building2,
  Lock,
} from "lucide-react";
import { authService } from "@/services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const DRAFT_STORAGE_KEY = "ai_interview_prep_register_draft";

export const Register: React.FC = () => {
  const { register: registerAuth, loginDemoStudent, isAuthenticated, user, logout } = useAuth();
  const { addStudent } = useAdminStore();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState<number>(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Step 1 Form
  const {
    register: regStep1,
    handleSubmit: handleStep1Submit,
    watch: watchStep1,
    setValue: setStep1Value,
    formState: { errors: step1Errors },
  } = useForm<RegisterStep1FormData>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      dob: "",
      gender: "Prefer not to say",
      city: "",
      state: "",
    },
  });

  // Step 2 Form
  const {
    register: regStep2,
    handleSubmit: handleStep2Submit,
    watch: watchStep2,
    setValue: setStep2Value,
    formState: { errors: step2Errors },
  } = useForm<RegisterStep2FormData>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: {
      collegeName: "",
      course: "B.Tech",
      branch: "Computer Science and Engineering",
      yearSemester: "Year 3 / Sem 5-6",
      rollNumber: "",
      graduationYear: "2026",
      cgpa: "",
    },
  });

  // Step 3 Data State
  const [step3Data, setStep3Data] = useState<CollegeIdData>({
    nameOnId: "",
    collegeNameOnId: "",
    rollNumberOnId: "",
    idFrontPreview: null,
    idFrontFile: null,
    idFrontRotation: 0,
    idQuality: null,
    selfiePreview: null,
    selfieFile: null,
    consentChecked: false,
  });

  // Watch step 1 & 2 values for live indicators & draft saving
  const emailVal = watchStep1("email") || "";
  const nameVal = watchStep1("name") || "";
  const passwordVal = watchStep1("password") || "";
  const confirmPasswordVal = watchStep1("confirmPassword") || "";
  const phoneVal = watchStep1("phone") || "";
  const dobVal = watchStep1("dob") || "";
  const cityVal = watchStep1("city") || "";

  const collegeNameVal = watchStep2("collegeName") || "";
  const rollNumberVal = watchStep2("rollNumber") || "";
  const courseVal = watchStep2("course") || "";
  const branchVal = watchStep2("branch") || "";
  const cgpaVal = watchStep2("cgpa") || "";

  // Auto-detect college from email domain in Step 1
  useEffect(() => {
    if (emailVal && emailVal.includes("@")) {
      const suggested = suggestCollegeFromEmail(emailVal);
      if (suggested && (!collegeNameVal || collegeNameVal.trim() === "")) {
        setStep2Value("collegeName", suggested);
      }
    }
  }, [emailVal]);

  // Duplicate Check for Email (Mock + Real Backend) & Roll Number
  useEffect(() => {
    let isCancelled = false;

    const checkDuplicates = async () => {
      const trimmedEmail = emailVal.trim().toLowerCase();
      if (trimmedEmail.length > 3 && trimmedEmail.includes("@")) {
        const existingEmail = INITIAL_MOCK_VERIFICATIONS.find(
          (v) => v.email.toLowerCase() === trimmedEmail
        );
        if (existingEmail || trimmedEmail === "student@srmist.edu.in") {
          setDuplicateWarning(
            `An account with email "${emailVal}" already exists in the system. Did you mean to log in?`
          );
          return;
        }

        try {
          const exists = await authService.checkEmail(trimmedEmail);
          if (!isCancelled && exists) {
            setDuplicateWarning(
              `An account with email "${emailVal}" is already registered. Please sign in instead.`
            );
            return;
          }
        } catch {
          // ignore background check errors
        }
      }

      if (rollNumberVal.trim().length > 3) {
        const existingRoll = INITIAL_MOCK_VERIFICATIONS.find(
          (v) => v.rollNumber.toLowerCase() === rollNumberVal.trim().toLowerCase()
        );
        if (existingRoll) {
          setDuplicateWarning(
            `Roll number "${rollNumberVal}" is already registered under ${existingRoll.collegeName}.`
          );
          return;
        }
      }

      if (!isCancelled) {
        setDuplicateWarning(null);
      }
    };

    const timer = setTimeout(checkDuplicates, 400);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [emailVal, rollNumberVal]);

  // Restore Draft on Mount
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft.step1) {
          Object.keys(draft.step1).forEach((key) => {
            if (key !== "password" && key !== "confirmPassword") {
              setStep1Value(key as any, draft.step1[key]);
            }
          });
        }
        if (draft.step2) {
          Object.keys(draft.step2).forEach((key) => {
            setStep2Value(key as any, draft.step2[key]);
          });
        }
        if (draft.currentStep) {
          setCurrentStep(draft.currentStep);
          setMaxVisitedStep(draft.maxVisitedStep || draft.currentStep);
        }
        setHasRestoredDraft(true);
      }
    } catch (e) {
      console.error("Failed to load registration draft:", e);
    }
  }, []);

  // Reset scroll position of left main container when step changes
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Persist Draft on Step Change or Input
  const saveDraft = (nextStep?: number) => {
    try {
      const draftData = {
        currentStep: nextStep || currentStep,
        maxVisitedStep: Math.max(maxVisitedStep, nextStep || currentStep),
        step1: {
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          dob: dobVal,
          gender: watchStep1("gender"),
          city: cityVal,
          state: watchStep1("state"),
        },
        step2: {
          collegeName: collegeNameVal,
          course: courseVal,
          branch: branchVal,
          yearSemester: watchStep2("yearSemester"),
          rollNumber: rollNumberVal,
          graduationYear: watchStep2("graduationYear"),
          cgpa: cgpaVal,
        },
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch (e) {
      console.warn("Could not save draft:", e);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasRestoredDraft(false);
    toast.info("Draft reset. You are starting fresh.");
  };

  // Password strength calculation
  const getPasswordStrength = (
    pass: string
  ): { score: number; label: string; color: "accent" | "danger" | "live" } => {
    if (pass.length === 0) return { score: 0, label: "", color: "accent" };
    if (pass.length < 8) return { score: 33, label: "Weak (min 8 chars)", color: "danger" };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*]/.test(pass);
    if (hasNum && hasSpecial) return { score: 100, label: "Strong password", color: "live" };
    return { score: 66, label: "Medium strength", color: "accent" };
  };

  const strength = getPasswordStrength(passwordVal);
  const passwordsMatch = passwordVal.length >= 8 && passwordVal === confirmPasswordVal;

  // Application Strength Meter Calculation (0 - 100%)
  const calculateApplicationStrength = (): { score: number; label: string; colorClass: string } => {
    let score = 0;
    if (nameVal.length > 2) score += 15;
    if (emailVal.length > 5 && emailVal.includes("@")) score += 15;
    if (passwordVal.length >= 8) score += 10;
    if (phoneVal.length >= 10) score += 10;
    if (cityVal.length > 1) score += 5;
    if (collegeNameVal.length > 3) score += 15;
    if (rollNumberVal.length > 2) score += 15;
    if (cgpaVal.length > 0) score += 5;
    if (step3Data.idFrontPreview) score += 10;

    if (score >= 90) return { score: 100, label: "Excellent Application", colorClass: "text-live" };
    if (score >= 70) return { score, label: "Strong Profile", colorClass: "text-cyan-400" };
    if (score >= 40) return { score, label: "Good Start", colorClass: "text-accent" };
    return { score, label: "Basic Details", colorClass: "text-amber-400" };
  };

  const appStrength = calculateApplicationStrength();

  // Step 1 -> Step 2 Handler
  const onStep1Success = async (data: RegisterStep1FormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const emailExists = await authService.checkEmail(data.email);
      if (emailExists) {
        setServerError(`An account with email "${data.email}" already exists. Please log in instead.`);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Allow fallback if offline
    } finally {
      setIsSubmitting(false);
    }

    const next = 2;
    setCurrentStep(next);
    setMaxVisitedStep((prev) => Math.max(prev, next));

    // Pre-fill Step 3 name if empty
    if (!step3Data.nameOnId) {
      setStep3Data((prev) => ({ ...prev, nameOnId: data.name }));
    }

    saveDraft(next);
  };

  // Step 2 -> Step 3 Handler
  const onStep2Success = (data: RegisterStep2FormData) => {
    setServerError(null);
    const next = 3;
    setCurrentStep(next);
    setMaxVisitedStep((prev) => Math.max(prev, next));

    // Pre-fill Step 3 college & roll number if empty
    setStep3Data((prev) => ({
      ...prev,
      nameOnId: prev.nameOnId || nameVal,
      collegeNameOnId: prev.collegeNameOnId || data.collegeName,
      rollNumberOnId: prev.rollNumberOnId || data.rollNumber,
    }));

    saveDraft(next);
  };

  // Final Registration Execution
  const executeRegistration = async () => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // 1. Call Auth API register endpoint
      const authRes = await registerAuth({
        name: nameVal.trim(),
        email: emailVal.trim(),
        password: passwordVal,
      });

      // 2. Save extended student profile details to profileService
      await profileService.updateProfile({
        name: nameVal.trim(),
        email: emailVal.trim(),
        phone: phoneVal.trim(),
        dateOfBirth: dobVal,
        gender: watchStep1("gender"),
        location: `${cityVal.trim()}, ${watchStep1("state").trim()}`,
        college: collegeNameVal.trim(),
        degree: `${courseVal} ${branchVal}`.trim(),
        graduationYear: watchStep2("graduationYear"),
        educationEntries: [
          {
            id: `edu-reg-${Date.now()}`,
            degree: `${courseVal} ${branchVal}`,
            institution: collegeNameVal.trim(),
            fieldOfStudy: branchVal,
            startYear: (parseInt(watchStep2("graduationYear")) - 4).toString(),
            endYear: watchStep2("graduationYear"),
            isCurrentlyStudying: true,
            grade: cgpaVal ? `${cgpaVal} CGPA` : "Enrolled",
            coursework: ["Computer Science Fundamentals"],
          },
        ],
        verificationStatus: "Pending Verification",
      });

      // 3. Submit Verification Request & Add to Central Store
      await verificationService.submitVerification({
        userId: authRes.userId,
        studentName: step3Data.nameOnId || nameVal,
        email: emailVal.trim(),
        collegeName: step3Data.collegeNameOnId || collegeNameVal,
        rollNumber: step3Data.rollNumberOnId || rollNumberVal,
        courseBranch: `${courseVal} - ${branchVal}`,
        yearSemester: watchStep2("yearSemester"),
        idCardFrontUrl:
          step3Data.idFrontPreview ||
          "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
        selfieUrl: step3Data.selfiePreview || undefined,
      });

      // 4. Sync new student registration to shared AdminStore
      try {
        addStudent({
          userId: authRes.userId,
          name: nameVal.trim(),
          email: emailVal.trim(),
          phone: phoneVal.trim(),
          college: collegeNameVal.trim(),
          course: courseVal,
          branch: branchVal,
          yearSemester: watchStep2("yearSemester"),
          year: `${watchStep2("graduationYear")} Grad`,
          rollNumber: rollNumberVal.trim(),
          idCardFrontUrl: step3Data.idFrontPreview || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
          selfieUrl: step3Data.selfiePreview || undefined,
          registeredAt: new Date().toISOString(),
          verificationStatus: "Pending Verification",
          role: "STUDENT",
          status: "PENDING",
          profileCompletion: 85,
        });
      } catch (e) {
        console.warn("Could not sync to admin store:", e);
      }

      // Clear draft storage
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsSuccess(true);

      setTimeout(() => {
        const role = authRes.role ? authRes.role.toUpperCase() : "STUDENT";
        if (role === "ADMIN" || role === "ROLE_ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 900);
    } catch (err: any) {
      setServerError(
        err.message || "Registration failed. That email might already be in use."
      );
      setIsSubmitting(false);
    }
  };

  const handleStep3Submit = (data: CollegeIdData) => {
    setStep3Data(data);
    executeRegistration();
  };

  const handleDemoStudent = () => {
    loginDemoStudent();
    navigate("/dashboard", { replace: true });
  };

  // Stepper Header Click Navigation
  const handleStepHeaderClick = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
    } else if (targetStep <= maxVisitedStep) {
      setCurrentStep(targetStep);
    }
  };

  return (
    <AuthLayout step={currentStep}>
      <Card className="p-6 sm:p-8 bg-surface border border-border shadow-soft space-y-6 w-full max-w-2xl mx-auto">
        {/* Header & Stepper Bar */}
        <div className="border-b border-border pb-4 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
                  Student Registration Flow
                </span>
                <Badge variant="accent" className="text-[10px] font-mono">
                  Step {currentStep} of 3
                </Badge>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
                {currentStep === 1
                  ? "1. Personal Information"
                  : currentStep === 2
                  ? "2. Academic & Education"
                  : "3. College ID Verification"}
              </h1>
              <p className="text-xs text-text-secondary">
                Create your verified student account to access AI mock interviews and placement arena.
              </p>
            </div>

            {/* Application Strength Indicator */}
            <div className="p-2.5 bg-surface-raised border border-border rounded-xl flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-mono text-text-muted uppercase block">
                  Strength
                </span>
                <span className={`text-xs font-semibold font-mono ${appStrength.colorClass}`}>
                  {appStrength.label} ({appStrength.score}%)
                </span>
              </div>
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Progress
                  value={appStrength.score}
                  color={appStrength.score >= 80 ? "live" : "accent"}
                  className="w-10 h-10"
                />
              </div>
            </div>
          </div>

          {/* STEPPER PROGRESS BAR */}
          <div className="space-y-2">
            {/* Desktop Stepper */}
            <div className="hidden sm:grid grid-cols-3 gap-2">
              {[
                { num: 1, label: "Personal Info", icon: User },
                { num: 2, label: "Academic Details", icon: GraduationCap },
                { num: 3, label: "ID Verification", icon: ShieldCheck },
              ].map((step) => {
                const Icon = step.icon;
                const isCompleted = step.num < currentStep || (step.num === 3 && isSuccess);
                const isCurrent = step.num === currentStep;
                const isClickable = step.num <= maxVisitedStep;

                return (
                  <button
                    key={step.num}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => handleStepHeaderClick(step.num)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                      isCurrent
                        ? "bg-cyan-400/10 border-cyan-400 text-cyan-400 shadow-soft"
                        : isCompleted
                        ? "bg-surface-raised border-live/40 text-live cursor-pointer hover:border-live"
                        : isClickable
                        ? "bg-surface-raised border-border text-text-secondary cursor-pointer hover:border-text-muted"
                        : "bg-surface-raised/40 border-border/40 text-text-muted cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isCurrent
                          ? "bg-cyan-400 text-black"
                          : isCompleted
                          ? "bg-live text-black"
                          : "bg-surface border border-border text-text-muted"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                    </div>
                    <div className="space-y-0.5 truncate">
                      <span className="text-xs font-semibold block truncate">{step.label}</span>
                      <span className="text-[10px] font-mono opacity-80 block">
                        {isCompleted ? "Completed" : isCurrent ? "Active Step" : "Pending"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Stepper Bar */}
            <div className="sm:hidden space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-cyan-400 font-semibold">
                  Step {currentStep} of 3:{" "}
                  {currentStep === 1 ? "Personal" : currentStep === 2 ? "Academic" : "Verification"}
                </span>
                <span className="text-text-muted">{Math.round((currentStep / 3) * 100)}%</span>
              </div>
              <Progress value={(currentStep / 3) * 100} color="accent" className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Demo Try Banner */}
        <div className="p-3 bg-surface-raised border border-cyan-400/30 rounded-xl flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-text-secondary">
            <span className="text-accent font-semibold block">Want instant access without registering?</span>
            <span>Test drive full feature set using student demo mode.</span>
          </div>
          <Button
            variant="teal-cyan"
            size="sm"
            onClick={handleDemoStudent}
            type="button"
            className="text-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" /> Try Demo
          </Button>
        </div>

        {/* Restored Draft Notice */}
        {hasRestoredDraft && (
          <div className="p-3 bg-surface-raised border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs font-mono text-cyan-300">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Restored your saved registration draft.</span>
            </div>
            <button
              type="button"
              onClick={clearDraft}
              className="text-[11px] underline text-text-muted hover:text-text-primary"
            >
              Start Fresh
            </button>
          </div>
        )}

        {/* Duplicate Warning Notice */}
        {duplicateWarning && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{duplicateWarning}</span>
              <Link to="/login" className="text-cyan-400 underline font-medium block">
                Click here to sign in to existing account →
              </Link>
            </div>
          </div>
        )}

        {/* Active Authenticated Session Notice */}
        {isAuthenticated && (
          <div className="p-3.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-semibold text-text-primary block">
                You are currently signed in as <span className="text-cyan-400">{user?.name}</span> ({user?.email})
              </span>
              <span className="text-text-muted text-[11px] block">
                To register a different account, please sign out first. Or return to your dashboard.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="ghost" onClick={logout} className="text-xs">
                Sign Out
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard")}
                className="text-xs"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3.5 rounded-xl bg-danger-bg border border-danger/40 text-danger text-xs space-y-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{serverError}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setServerError(null);
                  if (currentStep === 3) {
                    executeRegistration();
                  } else {
                    toast.info("Please retry submitting your step details.");
                  }
                }}
                isLoading={isSubmitting}
                className="text-xs shrink-0 bg-surface border-danger/40 text-danger hover:bg-danger/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </Button>
            </div>
            {serverError.toLowerCase().includes("cannot reach the server") && (
              <p className="text-[11px] font-mono text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/30">
                💡 Tip: Ensure backend service is running on <code>http://localhost:8080</code> or set <code>VITE_USE_MOCKS=true</code> in your <code>.env</code> file.
              </p>
            )}
            {serverError.toLowerCase().includes("already exists") && (
              <div className="flex items-center gap-3 pt-2 border-t border-danger/20 font-mono text-[11px]">
                <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
                  Sign in with this email →
                </Link>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setServerError(null);
                      setCurrentStep(1);
                    }}
                    className="text-accent hover:underline ml-auto"
                  >
                    Change email in Step 1
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 bg-live/20 text-live rounded-full inline-block"
            >
              <CheckCircle2 className="w-14 h-14" />
            </motion.div>
            <h3 className="font-serif text-2xl font-medium text-text-primary">
              Registration Completed!
            </h3>
            <p className="text-xs text-text-muted font-mono max-w-sm mx-auto leading-relaxed">
              Your account & college ID verification details have been recorded. Redirecting to student dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* STEP 1 FORM */}
            {currentStep === 1 && (
              <form
                onSubmit={handleStep1Submit(onStep1Success)}
                className="space-y-4 animate-fade-in"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="e.g. Kanhaiya Pandey"
                    error={step1Errors.name?.message}
                    {...regStep1("name")}
                  />

                  <div className="space-y-1.5">
                    <Input
                      label="College Email Address"
                      type="email"
                      placeholder="student@srmist.edu.in"
                      error={step1Errors.email?.message}
                      {...regStep1("email")}
                    />
                    {emailVal.includes("@") && suggestCollegeFromEmail(emailVal) && (
                      <p className="text-[11px] text-live font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Auto-detected college:{" "}
                        <strong>{suggestCollegeFromEmail(emailVal)}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password Field with live strength bar */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Input
                        label="Password (min 8 chars)"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        error={step1Errors.password?.message}
                        {...regStep1("password")}
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
                        <span className="text-[10px] font-mono text-text-muted block text-right">
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field with live match indicator */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        error={step1Errors.confirmPassword?.message}
                        {...regStep1("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-8 text-text-muted hover:text-text-primary text-xs"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {confirmPasswordVal.length > 0 && (
                      <div className="text-[10px] font-mono pt-1 text-right">
                        {passwordsMatch ? (
                          <span className="text-live flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passwords Match
                          </span>
                        ) : (
                          <span className="text-danger">Passwords do not match yet</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Phone Number"
                    type="tel"
                    placeholder="+91 9876543210"
                    error={step1Errors.phone?.message}
                    {...regStep1("phone")}
                  />

                  <Input
                    label="Date of Birth"
                    type="date"
                    error={step1Errors.dob?.message}
                    {...regStep1("dob")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Gender</label>
                    <select
                      {...regStep1("gender")}
                      className="w-full bg-surface-raised border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <Input
                    label="City"
                    type="text"
                    placeholder="Chennai"
                    error={step1Errors.city?.message}
                    {...regStep1("city")}
                  />

                  <Input
                    label="State"
                    type="text"
                    placeholder="Tamil Nadu"
                    error={step1Errors.state?.message}
                    {...regStep1("state")}
                  />
                </div>

                <div className="pt-3">
                  <Button type="submit" variant="teal-cyan" className="w-full font-semibold">
                    <span>Continue to Step 2: Academic Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2 FORM */}
            {currentStep === 2 && (
              <form
                onSubmit={handleStep2Submit(onStep2Success)}
                className="space-y-4 animate-fade-in"
                noValidate
              >
                <div className="space-y-1.5">
                  <Input
                    label="College / Institution Name"
                    type="text"
                    placeholder="e.g. SRM Institute of Science and Technology"
                    error={step2Errors.collegeName?.message}
                    {...regStep2("collegeName")}
                  />
                  {collegeNameVal && emailVal.includes("@") && (
                    <p className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Checked against college domain mapping table
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">
                      Course / Program
                    </label>
                    <select
                      {...regStep2("course")}
                      onChange={(e) => {
                        regStep2("course").onChange(e);
                      }}
                      className="w-full bg-surface-raised border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="">-- Select Course / Program --</option>
                      {Object.values(COURSE_DURATIONS).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    {step2Errors.course && (
                      <p className="text-xs text-danger">{step2Errors.course.message}</p>
                    )}
                  </div>

                  <Input
                    label="Branch / Specialization"
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    error={step2Errors.branch?.message}
                    {...regStep2("branch")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <YearSemesterSelect
                      course={courseVal}
                      value={watchStep2("yearSemester") || ""}
                      onChange={(val) => setStep2Value("yearSemester", val, { shouldValidate: true })}
                      error={step2Errors.yearSemester?.message}
                      required
                    />
                  </div>

                  <Input
                    label="Student Roll / Reg Number"
                    type="text"
                    placeholder="e.g. RA2111003010452"
                    error={step2Errors.rollNumber?.message}
                    {...regStep2("rollNumber")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">
                      Expected Graduation Year
                    </label>
                    <select
                      {...regStep2("graduationYear")}
                      className="w-full bg-surface-raised border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                      <option value="2030">2030</option>
                    </select>
                  </div>

                  <Input
                    label="Current CGPA / Percentage (Optional)"
                    type="text"
                    placeholder="e.g. 8.85 or 88%"
                    error={step2Errors.cgpa?.message}
                    {...regStep2("cgpa")}
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Step 1
                  </Button>
                  <Button type="submit" variant="teal-cyan" className="flex-1 font-semibold">
                    <span>Continue to Step 3: ID Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3 FORM (College ID Verification Embed) */}
            {currentStep === 3 && (
              <div className="animate-fade-in space-y-4">
                <CollegeIdUploader
                  email={emailVal}
                  initialData={{
                    nameOnId: step3Data.nameOnId || nameVal,
                    collegeNameOnId: step3Data.collegeNameOnId || collegeNameVal,
                    rollNumberOnId: step3Data.rollNumberOnId || rollNumberVal,
                    idFrontPreview: step3Data.idFrontPreview,
                    idFrontFile: step3Data.idFrontFile,
                    idFrontRotation: step3Data.idFrontRotation,
                    idQuality: step3Data.idQuality,
                    selfiePreview: step3Data.selfiePreview,
                    selfieFile: step3Data.selfieFile,
                    consentChecked: step3Data.consentChecked,
                  }}
                  onChangeData={(updates) => setStep3Data((prev) => ({ ...prev, ...updates }))}
                  onSubmit={handleStep3Submit}
                  onBack={() => setCurrentStep(2)}
                  isSubmitting={isSubmitting}
                  submitButtonText="Create Account & Submit for Verification"
                  showBackOption={true}
                />
              </div>
            )}
          </>
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
