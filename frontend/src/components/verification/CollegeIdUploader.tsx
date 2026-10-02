import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  checkImageQuality,
  ImageQualityCheckResult,
} from "@/lib/imageQualityCheck";
import {
  suggestCollegeFromEmail,
  validateCollegeDomainMatch,
} from "@/mocks/verifications";
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  RotateCw,
  X,
  Building2,
  FileText,
  Camera,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export interface CollegeIdData {
  nameOnId: string;
  collegeNameOnId: string;
  rollNumberOnId: string;
  idFrontPreview: string | null;
  idFrontFile: File | null;
  idFrontRotation: number;
  idQuality: ImageQualityCheckResult | null;
  selfiePreview: string | null;
  selfieFile: File | null;
  consentChecked: boolean;
}

interface CollegeIdUploaderProps {
  email: string;
  initialData: Partial<CollegeIdData>;
  onChangeData?: (data: Partial<CollegeIdData>) => void;
  onSubmit: (data: CollegeIdData) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showBackOption?: boolean;
}

export const CollegeIdUploader: React.FC<CollegeIdUploaderProps> = ({
  email,
  initialData,
  onChangeData,
  onSubmit,
  onBack,
  isSubmitting = false,
  submitButtonText = "Create Account & Submit for Verification",
  showBackOption = true,
}) => {
  const [nameOnId, setNameOnId] = useState<string>(initialData.nameOnId || "");
  const [collegeNameOnId, setCollegeNameOnId] = useState<string>(
    initialData.collegeNameOnId || ""
  );
  const [rollNumberOnId, setRollNumberOnId] = useState<string>(
    initialData.rollNumberOnId || ""
  );

  const [idFrontFile, setIdFrontFile] = useState<File | null>(
    initialData.idFrontFile || null
  );
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(
    initialData.idFrontPreview || null
  );
  const [idFrontRotation, setIdFrontRotation] = useState<number>(
    initialData.idFrontRotation || 0
  );
  const [idQuality, setIdQuality] = useState<ImageQualityCheckResult | null>(
    initialData.idQuality || null
  );
  const [isCheckingQuality, setIsCheckingQuality] = useState<boolean>(false);

  const [selfieFile, setSelfieFile] = useState<File | null>(
    initialData.selfieFile || null
  );
  const [selfiePreview, setSelfiePreview] = useState<string | null>(
    initialData.selfiePreview || null
  );
  const [consentChecked, setConsentChecked] = useState<boolean>(
    initialData.consentChecked || false
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Sync prop defaults if initialData loads late
  useEffect(() => {
    if (initialData.nameOnId && !nameOnId) setNameOnId(initialData.nameOnId);
    if (initialData.collegeNameOnId && !collegeNameOnId)
      setCollegeNameOnId(initialData.collegeNameOnId);
    if (initialData.rollNumberOnId && !rollNumberOnId)
      setRollNumberOnId(initialData.rollNumberOnId);
  }, [initialData]);

  // Update parent form state when fields change
  const notifyChange = (updates: Partial<CollegeIdData>) => {
    if (onChangeData) {
      onChangeData({
        nameOnId,
        collegeNameOnId,
        rollNumberOnId,
        idFrontPreview,
        idFrontFile,
        idFrontRotation,
        idQuality,
        selfiePreview,
        selfieFile,
        consentChecked,
        ...updates,
      });
    }
  };

  const domainCheck = validateCollegeDomainMatch(email, collegeNameOnId);

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
        const previewUrl = reader.result as string;
        setIdFrontPreview(previewUrl);
        notifyChange({ idFrontFile: file, idFrontPreview: previewUrl, idQuality: result });
      };
      reader.readAsDataURL(file);
      toast.success("ID card photo loaded & clarity check passed!");
    } else {
      setIdFrontFile(null);
      setIdFrontPreview(null);
      notifyChange({ idFrontFile: null, idFrontPreview: null, idQuality: result });
      toast.error(result.reason || "Image failed clarity check.");
    }
  };

  const handleSelfieSelect = (file: File) => {
    setSelfieFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setSelfiePreview(url);
      notifyChange({ selfieFile: file, selfiePreview: url });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOnId.trim()) {
      toast.error("Please enter full name as printed on ID card.");
      return;
    }
    if (!collegeNameOnId.trim()) {
      toast.error("Please enter college name as printed on ID card.");
      return;
    }
    if (!rollNumberOnId.trim()) {
      toast.error("Please enter roll/registration number.");
      return;
    }
    if (!idFrontFile && !idFrontPreview) {
      toast.error("Please upload a clear photo of your College ID card.");
      return;
    }
    if (!consentChecked) {
      toast.error("Please confirm the accuracy consent checkbox before submitting.");
      return;
    }

    onSubmit({
      nameOnId: nameOnId.trim(),
      collegeNameOnId: collegeNameOnId.trim(),
      rollNumberOnId: rollNumberOnId.trim(),
      idFrontPreview,
      idFrontFile,
      idFrontRotation,
      idQuality,
      selfiePreview,
      selfieFile,
      consentChecked,
    });
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      {/* Name & ID Details (Pre-filled, Editable) */}
      <Card className="p-6 bg-surface border border-border shadow-soft space-y-4 rounded-2xl">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <FileText className="w-5 h-5 text-cyan-400" />
          <div className="space-y-0.5">
            <h2 className="font-serif text-lg font-medium text-text-primary">
              Verify Printed ID Details
            </h2>
            <p className="text-xs text-text-muted">
              Pre-filled from previous steps. Adjust if your printed ID shows a different full name or spelling.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Name as printed on ID Card"
            type="text"
            value={nameOnId}
            onChange={(e) => {
              setNameOnId(e.target.value);
              notifyChange({ nameOnId: e.target.value });
            }}
            placeholder="e.g. Kanhaiya Pandey"
            required
          />

          <div className="space-y-1.5">
            <Input
              label="College / Institution Name on ID"
              type="text"
              value={collegeNameOnId}
              onChange={(e) => {
                setCollegeNameOnId(e.target.value);
                notifyChange({ collegeNameOnId: e.target.value });
              }}
              placeholder="e.g. SRM Institute of Science and Technology"
              required
            />
            {domainCheck.matches && domainCheck.suggested && (
              <p className="text-[11px] text-live font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Domain auto-matched with {email}
              </p>
            )}
            {!domainCheck.matches && domainCheck.suggested && (
              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-1.5 rounded border border-amber-500/30">
                ⚠️ Email domain suggests <strong>{domainCheck.suggested}</strong>.
              </p>
            )}
          </div>

          <Input
            label="Student Roll / Reg Number on ID"
            type="text"
            value={rollNumberOnId}
            onChange={(e) => {
              setRollNumberOnId(e.target.value);
              notifyChange({ rollNumberOnId: e.target.value });
            }}
            placeholder="e.g. RA2111003010452"
            required
          />
        </div>
      </Card>

      {/* Front ID Card Photo Upload */}
      <Card className="p-6 bg-surface border border-border shadow-soft space-y-4 rounded-2xl overflow-hidden max-w-full">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h2 className="font-serif text-lg font-medium text-text-primary">
              Upload Official College ID Card (Front)
            </h2>
          </div>
          <Badge variant="accent" className="text-[10px] font-mono">
            Required
          </Badge>
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
                Click to browse or drag & drop College ID photo
              </p>
              <p className="text-xs text-text-muted">
                PNG, JPG, WebP up to 10MB. Must show readable photo, name, and roll number.
              </p>
            </div>

            {isCheckingQuality && (
              <p className="text-xs text-cyan-400 font-mono animate-pulse">
                Running Canvas clarity & resolution analysis...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 min-w-0 max-w-full">
            <div className="relative border border-border bg-surface-raised rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-start gap-4 sm:gap-6 min-w-0 max-w-full">
              {/* Image Preview with rotation */}
              <div className="relative overflow-hidden rounded-lg border border-border w-full md:w-56 lg:w-64 h-48 md:h-44 bg-black flex items-center justify-center shrink-0 min-w-0">
                <img
                  src={idFrontPreview}
                  alt="College ID Front"
                  className="max-h-full max-w-full object-contain transition-transform duration-300"
                  style={{ transform: `rotate(${idFrontRotation}deg)` }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newRot = (idFrontRotation + 90) % 360;
                    setIdFrontRotation(newRot);
                    notifyChange({ idFrontRotation: newRot });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-md hover:bg-black transition-colors"
                  title="Rotate Image"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Quality & File Details */}
              <div className="flex-1 space-y-3 text-xs w-full min-w-0">
                <div className="space-y-2 min-w-0">
                  <p
                    className="font-semibold text-text-primary text-sm truncate min-w-0 block"
                    title={idFrontFile?.name || "Uploaded_ID_Photo.jpg"}
                  >
                    {idFrontFile?.name || "Uploaded_ID_Photo.jpg"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-7 px-2.5 text-cyan-400 border-cyan-400/40 hover:bg-cyan-400/10 shrink-0"
                    >
                      <RotateCw className="w-3 h-3" /> Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIdFrontFile(null);
                        setIdFrontPreview(null);
                        setIdQuality(null);
                        notifyChange({ idFrontFile: null, idFrontPreview: null, idQuality: null });
                      }}
                      className="text-danger hover:bg-danger-bg text-xs h-7 px-2.5 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                </div>

                {idQuality && (
                  <div className="p-3 bg-surface border border-border rounded-lg space-y-1.5 font-mono text-[11px] min-w-0">
                    <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
                      <span className="text-text-muted whitespace-nowrap">Dimensions:</span>
                      <span className="text-text-primary font-semibold text-right">
                        {idQuality.width} × {idQuality.height} px
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
                      <span className="text-text-muted whitespace-nowrap">Canvas Clarity Score:</span>
                      <span className="text-live font-semibold text-right">
                        {idQuality.blurScore}% (Pass)
                      </span>
                    </div>
                    <p className="text-live text-[10px] flex items-start gap-1.5 pt-1 break-words">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Text & face verified as sharp and readable.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Optional Selfie holding ID */}
      <Card className="p-6 bg-surface border border-border shadow-soft space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h2 className="font-serif text-lg font-medium text-text-primary">
              Selfie holding College ID Card (Optional)
            </h2>
          </div>
          <span className="text-xs font-mono text-text-muted">Optional</span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Speeds up manual verification by matching your live photo with your college ID card face photo.
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
              className="w-14 h-14 rounded-full object-cover border border-cyan-400/40"
            />
            <div className="flex-1 text-xs">
              <span className="font-semibold text-text-primary block">Selfie Photo Attached</span>
              <span className="text-[11px] text-text-muted font-mono">
                {selfieFile?.name || "selfie.jpg"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelfieFile(null);
                setSelfiePreview(null);
                notifyChange({ selfieFile: null, selfiePreview: null });
              }}
              className="text-danger text-xs"
            >
              Remove
            </Button>
          </div>
        )}
      </Card>

      {/* Accuracy Consent & Submit */}
      <Card className="p-6 bg-surface border border-border shadow-soft space-y-4 rounded-2xl">
        <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-text-secondary">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => {
              setConsentChecked(e.target.checked);
              notifyChange({ consentChecked: e.target.checked });
            }}
            className="mt-0.5 w-4 h-4 rounded border-border text-cyan-400 focus:ring-cyan-400"
          />
          <span>
            I confirm that the uploaded College ID card belongs to me, that I am currently an active enrolled student, and that all submitted information is accurate.
          </span>
        </label>

        <div className="pt-4 border-t border-border flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            {showBackOption && onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto text-xs py-2.5">
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="teal-cyan"
              className="w-full sm:flex-1 py-3 text-xs font-semibold px-6 justify-center"
              isLoading={isSubmitting}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{submitButtonText}</span>
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
};
