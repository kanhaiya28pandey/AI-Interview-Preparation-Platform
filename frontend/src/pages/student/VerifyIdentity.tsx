import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  suggestCollegeFromEmail,
  validateCollegeDomainMatch,
  VerificationStatus,
  VerificationSubmission,
} from "@/mocks/verifications";
import { verificationService } from "@/services/verificationService";
import { checkImageQuality, ImageQualityCheckResult } from "@/lib/imageQualityCheck";
import {
  ShieldCheck,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCw,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  FileText,
  Camera,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const VerifyIdentity: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<VerificationStatus>("Unverified");
  const [currentSubmission, setCurrentSubmission] = useState<VerificationSubmission | undefined>(undefined);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // Form State
  const [collegeName, setCollegeName] = useState<string>("");
  const [rollNumber, setRollNumber] = useState<string>("");
  const [courseBranch, setCourseBranch] = useState<string>("");
  const [yearSemester, setYearSemester] = useState<string>("Year 3 / Sem 5-6");

  // File Upload State
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idFrontRotation, setIdFrontRotation] = useState<number>(0);
  const [idQuality, setIdQuality] = useState<ImageQualityCheckResult | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState<boolean>(false);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<VerificationSubmission | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Domain Match check
  const domainCheck = validateCollegeDomainMatch(user?.email || "", collegeName);

  useEffect(() => {
    if (!user) return;
    verificationService.getVerificationStatus(user.userId, user.email).then((res) => {
      setStatus(res.status);
      setCurrentSubmission(res.submission);
      setIsLoadingStatus(false);

      if (res.submission) {
        setCollegeName(res.submission.collegeName);
        setRollNumber(res.submission.rollNumber);
        setCourseBranch(res.submission.courseBranch);
        setYearSemester(res.submission.yearSemester);
      } else {
        // Auto-suggest college name from user's email domain
        const suggested = suggestCollegeFromEmail(user.email);
        if (suggested) {
          setCollegeName(suggested);
        }
      }
    });
  }, [user]);

  // Handle ID Card Front File Select & Canvas Quality Check
  const handleIdFrontSelect = async (file: File) => {
    setIsCheckingQuality(true);
    setIdQuality(null);

    const result = await checkImageQuality(file);
    setIdQuality(result);
    setIsCheckingQuality(false);

    if (result.valid) {
      setIdFrontFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setIdFrontPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("ID card photo loaded & clarity check passed!");
    } else {
      setIdFrontFile(null);
      setIdFrontPreview(null);
      toast.error(result.reason || "Image failed clarity check.");
    }
  };

  const handleSelfieSelect = (file: File) => {
    setSelfieFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelfiePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!collegeName.trim()) {
      toast.error("Please enter your college name.");
      return;
    }
    if (!rollNumber.trim()) {
      toast.error("Please enter your roll / registration number.");
      return;
    }
    if (!courseBranch.trim()) {
      toast.error("Please enter your course & branch.");
      return;
    }
    if (!idFrontFile && !idFrontPreview) {
      toast.error("Please upload a valid, clear photo of your College ID card.");
      return;
    }
    if (!consentChecked) {
      toast.error("You must confirm the accuracy consent checkbox before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await verificationService.submitVerification({
        userId: user.userId,
        studentName: user.name || "Student User",
        email: user.email,
        collegeName: collegeName.trim(),
        rollNumber: rollNumber.trim(),
        courseBranch: courseBranch.trim(),
        yearSemester,
        idCardFrontUrl: idFrontPreview || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
        selfieUrl: selfiePreview || undefined,
      });

      setSubmissionSuccess(created);
      setStatus("Pending Verification");
      setCurrentSubmission(created);
      toast.success("College ID submitted successfully for review!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit verification request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="p-8 text-center text-xs font-mono text-text-muted">
        Loading verification status...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold">
              Student Eligibility Check
            </span>
            <Badge
              variant={
                status === "Verified"
                  ? "active"
                  : status === "Pending Verification"
                  ? "medium"
                  : status === "Rejected"
                  ? "blocked"
                  : "accent"
              }
              className="text-[10px] font-mono"
            >
              {status}
            </Badge>
          </div>
          <h1 className="font-serif text-3xl font-medium text-text-primary">
            College ID Verification
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Verify your student enrollment to unlock full access to AI Mock Interviews, Live Coding Arena, and Leaderboards.
          </p>
        </div>

        {status === "Verified" && (
          <div className="px-4 py-2 bg-live/10 border border-live/30 text-live rounded-xl flex items-center gap-2 text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Student Account</span>
          </div>
        )}
      </div>

      {/* STATUS OVERVIEW PANELS */}
      {status === "Verified" && (
        <Card className="p-8 bg-surface border border-live/30 shadow-soft text-center space-y-4 rounded-2xl">
          <div className="w-16 h-16 bg-live/20 text-live rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              Identity & Student Status Verified
            </h2>
            <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
              Your college enrollment at <strong>{currentSubmission?.collegeName || "your institution"}</strong> has been reviewed and verified. All platform features are unlocked.
            </p>
          </div>

          <div className="p-4 bg-surface-raised border border-border rounded-xl max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-text-muted">
              <span>Reference ID:</span>
              <span className="text-cyan-400 font-semibold">{currentSubmission?.verificationId || "VER-2026-00101"}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Roll Number:</span>
              <span className="text-text-primary">{currentSubmission?.rollNumber || "RA2111003010452"}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Status:</span>
              <span className="text-live font-semibold">Active & Approved</span>
            </div>
          </div>

          <div className="pt-3 flex justify-center gap-3">
            <Button variant="teal-cyan" onClick={() => navigate("/dashboard")} className="text-xs">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/coding")} className="text-xs">
              Start Coding Arena
            </Button>
          </div>
        </Card>
      )}

      {status === "Pending Verification" && (
        <Card className="p-8 bg-surface border border-amber-500/40 shadow-soft text-center space-y-4 rounded-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-9 h-9 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">
              Verification Request Under Review
            </h2>
            <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
              Your ID document (Ref: <strong>{currentSubmission?.verificationId || submissionSuccess?.verificationId}</strong>) has been received. Our manual verification queue reviews submissions within 24-48 hours.
            </p>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-md mx-auto text-left text-xs space-y-2 font-mono text-amber-300">
            <div className="flex justify-between">
              <span>College:</span>
              <span className="font-semibold text-text-primary">{currentSubmission?.collegeName}</span>
            </div>
            <div className="flex justify-between">
              <span>Roll Number:</span>
              <span>{currentSubmission?.rollNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Submitted:</span>
              <span>{new Date(currentSubmission?.submittedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="text-xs">
              Return to Dashboard (Limited View)
            </Button>
          </div>
        </Card>
      )}

      {status === "Rejected" && (
        <Card className="p-6 bg-surface border border-danger/40 shadow-soft space-y-4 rounded-2xl">
          <div className="flex items-start gap-4 p-4 bg-danger-bg border border-danger/40 rounded-xl text-danger text-xs">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm font-mono">Verification Request Rejected</h3>
              <p className="leading-relaxed">
                {currentSubmission?.rejectionNotes || "Your submitted ID photo was unclear or details did not match your account email."}
              </p>
              <span className="text-[11px] font-mono text-danger/80 block pt-1">
                Category: {currentSubmission?.rejectionCategory || "Image unclear"}
              </span>
            </div>
          </div>
          <p className="text-xs text-text-secondary">
            Please review the requirements below, take a clear photo of your official college ID card, and resubmit for review.
          </p>
        </Card>
      )}

      {/* FORM SECTION (Visible if Unverified or Rejected) */}
      {(status === "Unverified" || status === "Rejected") && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Academic & College Info */}
          <Card className="p-6 bg-surface border border-border shadow-soft space-y-5 rounded-2xl">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <h2 className="font-serif text-lg font-medium text-text-primary">
                1. Academic & Enrollment Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Input
                  label="College / Institution Name"
                  type="text"
                  placeholder="e.g. SRM Institute of Science and Technology"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                />
                {!domainCheck.matches && (
                  <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/30">
                    ⚠️ Note: Your email domain suggests <strong>{domainCheck.suggested}</strong>. Mismatched institution names may delay review.
                  </p>
                )}
                {domainCheck.matches && domainCheck.suggested && (
                  <p className="text-[11px] text-live font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Auto-matched with email domain ({user?.email})
                  </p>
                )}
              </div>

              <Input
                label="Student Roll / Registration Number"
                type="text"
                placeholder="e.g. RA2111003010452"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />

              <Input
                label="Course & Branch / Major"
                type="text"
                placeholder="e.g. B.Tech Computer Science"
                value={courseBranch}
                onChange={(e) => setCourseBranch(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Current Year / Semester</label>
                <select
                  value={yearSemester}
                  onChange={(e) => setYearSemester(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                >
                  <option value="Year 1 / Sem 1-2">Year 1 / Semester 1-2</option>
                  <option value="Year 2 / Sem 3-4">Year 2 / Semester 3-4</option>
                  <option value="Year 3 / Sem 5-6">Year 3 / Semester 5-6</option>
                  <option value="Year 4 / Sem 7-8">Year 4 / Semester 7-8</option>
                  <option value="Postgraduate / Master's">Postgraduate / Master's</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Step 2: College ID Card Document Upload */}
          <Card className="p-6 bg-surface border border-border shadow-soft space-y-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h2 className="font-serif text-lg font-medium text-text-primary">
                  2. Upload College ID Card (Front Side)
                </h2>
              </div>
              <span className="text-xs font-mono text-cyan-400">Required</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleIdFrontSelect(e.target.files[0]);
                }
              }}
            />

            {!idFrontPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleIdFrontSelect(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-border hover:border-cyan-400/60 bg-surface-raised p-8 rounded-xl text-center cursor-pointer transition-colors space-y-3 group"
              >
                <div className="w-12 h-12 bg-cyan-400/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">
                    Click to browse or drag & drop College ID Card
                  </p>
                  <p className="text-xs text-text-muted">
                    Supports PNG, JPG, WebP up to 10MB. Must show readable name, photo, and roll number.
                  </p>
                </div>

                {isCheckingQuality && (
                  <p className="text-xs text-cyan-400 font-mono animate-pulse">
                    Running Canvas clarity & resolution analysis...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative border border-border bg-surface-raised rounded-xl p-4 flex flex-col md:flex-row items-center gap-6">
                  {/* Image Preview with rotation */}
                  <div className="relative overflow-hidden rounded-lg border border-border w-64 h-40 bg-black flex items-center justify-center shrink-0">
                    <img
                      src={idFrontPreview}
                      alt="ID Card Front"
                      className="max-h-full max-w-full object-contain transition-transform duration-300"
                      style={{ transform: `rotate(${idFrontRotation}deg)` }}
                    />
                    <button
                      type="button"
                      onClick={() => setIdFrontRotation((prev) => (prev + 90) % 360)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-md hover:bg-black transition-colors"
                      title="Rotate Image"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Diagnostic Details */}
                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary text-sm">
                        {idFrontFile?.name || "Uploaded ID Card"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIdFrontFile(null);
                          setIdFrontPreview(null);
                          setIdQuality(null);
                        }}
                        className="text-danger hover:bg-danger-bg text-xs h-7"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>

                    {idQuality && (
                      <div className="p-3 bg-surface border border-border rounded-lg space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Dimensions:</span>
                          <span className="text-text-primary">{idQuality.width} x {idQuality.height} px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Canvas Clarity Score:</span>
                          <span className="text-live font-semibold">{idQuality.blurScore}/100 (Pass)</span>
                        </div>
                        <p className="text-live text-[10px] flex items-center gap-1 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Text & details verified as sharp and readable.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Step 3: Optional Selfie holding ID */}
          <Card className="p-6 bg-surface border border-border shadow-soft space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h2 className="font-serif text-lg font-medium text-text-primary">
                  3. Selfie holding ID Card (Optional)
                </h2>
              </div>
              <span className="text-xs font-mono text-text-muted">Optional</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Assists our human verification team to visually cross-check your face against your ID card photo during review.
            </p>

            <input
              type="file"
              ref={selfieInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleSelfieSelect(e.target.files[0]);
                }
              }}
            />

            {!selfiePreview ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => selfieInputRef.current?.click()}
                className="text-xs flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Upload Selfie with ID Card</span>
              </Button>
            ) : (
              <div className="flex items-center gap-4 p-3 bg-surface-raised border border-border rounded-xl">
                <img
                  src={selfiePreview}
                  alt="Selfie"
                  className="w-16 h-16 rounded-full object-cover border border-cyan-400/40"
                />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-text-primary block">Selfie Attached</span>
                  <span className="text-[11px] text-text-muted font-mono">{selfieFile?.name || "selfie.jpg"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelfieFile(null);
                    setSelfiePreview(null);
                  }}
                  className="text-danger text-xs"
                >
                  Remove
                </Button>
              </div>
            )}
          </Card>

          {/* Step 4: Consent & Submit */}
          <Card className="p-6 bg-surface border border-border shadow-soft space-y-4 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-text-secondary">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border text-cyan-400 focus:ring-cyan-400"
              />
              <span>
                I confirm that the uploaded College ID belongs to me, that I am currently an active enrolled student, and that all provided academic information is accurate.
              </span>
            </label>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="teal-cyan"
                className="flex-1 py-3 text-xs font-semibold"
                isLoading={isSubmitting}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit ID for Review</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};
