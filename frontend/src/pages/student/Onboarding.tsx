import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  User,
  Camera,
  BookOpen,
  Briefcase,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Link as LinkIcon,
  Upload,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profileService";
import {
  UserProfile,
  EducationEntry,
  WorkExperienceEntry,
  ProjectEntry,
  CertificationEntry,
  SkillItem,
  calculateProfileCompletion,
} from "@/mocks/profileData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";

const TARGET_ROLES_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "ML Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "QA Engineer",
];

const SKILL_SUGGESTIONS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "Spring Boot",
  "Node.js",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Tailwind CSS",
  "Git & GitHub",
  "Docker",
  "Data Structures",
  "Algorithms",
  "Problem Solving",
  "Team Collaboration",
  "Agile/Scrum",
];

export const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newSkillName, setNewSkillName] = useState<string>("");
  const [newSkillCategory, setNewSkillCategory] = useState<"Technical" | "Tools" | "Soft Skills">("Technical");
  const [newSkillProficiency, setNewSkillProficiency] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");
  const [showSchoolSection, setShowSchoolSection] = useState<boolean>(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileService.getProfile().then((data) => {
      // Prefill user name if registration name exists
      if (user?.name) {
        data.name = user.name;
      }
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 text-text-primary">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const completion = calculateProfileCompletion(profile);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                avatar: reader.result as string,
                isCustomAvatar: true,
              }
            : null
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkipForNow = async () => {
    if (profile) {
      await profileService.updateProfile({ onboardingComplete: false });
    }
    navigate("/dashboard");
  };

  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      id: "edu-" + Date.now(),
      degree: "B.Tech Computer Science",
      institution: "",
      fieldOfStudy: "Computer Science",
      startYear: "2022",
      endYear: "2026",
      isCurrentlyStudying: true,
      grade: "",
      coursework: [],
    };
    setProfile((prev) =>
      prev ? { ...prev, educationEntries: [...prev.educationEntries, newEdu] } : null
    );
  };

  const handleRemoveEducation = (id: string) => {
    setProfile((prev) =>
      prev ? { ...prev, educationEntries: prev.educationEntries.filter((e) => e.id !== id) } : null
    );
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const skill: SkillItem = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
    };
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            skillsList: [...prev.skillsList, skill],
            skills: [...prev.skills, skill.name],
          }
        : null
    );
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillName: string) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            skillsList: prev.skillsList.filter((s) => s.name !== skillName),
            skills: prev.skills.filter((s) => s !== skillName),
          }
        : null
    );
  };

  const handleAddWorkExperience = () => {
    const newExp: WorkExperienceEntry = {
      id: "exp-" + Date.now(),
      role: "",
      company: "",
      duration: "",
      description: "",
    };
    setProfile((prev) =>
      prev ? { ...prev, workExperience: [...prev.workExperience, newExp] } : null
    );
  };

  const handleAddProject = () => {
    const newProj: ProjectEntry = {
      id: "proj-" + Date.now(),
      title: "",
      techStack: [],
      description: "",
      link: "",
    };
    setProfile((prev) =>
      prev ? { ...prev, projects: [...prev.projects, newProj] } : null
    );
  };

  const handleAddCertification = () => {
    const newCert: CertificationEntry = {
      id: "cert-" + Date.now(),
      name: "",
      issuer: "",
      dateIssued: "",
      credentialUrl: "",
    };
    setProfile((prev) =>
      prev ? { ...prev, certifications: [...prev.certifications, newCert] } : null
    );
  };

  const handleCompleteProfile = async () => {
    if (!profile) return;
    const updated = await profileService.updateProfile({
      ...profile,
      onboardingComplete: true,
    });
    setProfile(updated);

    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  const steps = [
    { number: 1, title: "Photo", icon: Camera },
    { number: 2, title: "Personal Info", icon: User },
    { number: 3, title: "Education", icon: BookOpen },
    { number: 4, title: "Skills & Exp", icon: Briefcase },
    { number: 5, title: "Career Goals", icon: Target },
    { number: 6, title: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-8 text-text-primary">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header & Completion Progress */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <AvatarCompletionRing profile={profile} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold">Complete Your Profile</h1>
                <Badge variant="accent" className="font-mono text-[10px]">
                  Placement Ready
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Step {currentStep} of 6 &bull; {completion}% profile completion score
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipForNow}
            className="text-xs text-text-muted hover:text-cyan-400 font-mono"
          >
            Skip for now &rarr;
          </Button>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => setCurrentStep(s.number)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all shrink-0 ${
                  isActive
                    ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 font-bold"
                    : isDone
                    ? "text-teal-400 hover:bg-surface-raised"
                    : "text-text-muted hover:bg-surface-raised"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? "bg-cyan-400 text-white dark:text-[#0d1321]"
                      : isDone
                      ? "bg-teal-400/20 text-teal-400"
                      : "bg-surface-raised text-text-muted"
                  }`}
                >
                  {isDone ? "✓" : s.number}
                </span>
                <span className="hidden md:inline">{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* STEP CONTENT CONTAINER */}
        <AnimatePresence mode="wait">
          {/* STEP 1: PROFILE PHOTO */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    Step 1: Professional Profile Photo
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Upload a high-quality photo. Recruiter response rates increase by 40% with professional photos.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Photo Preview & Upload Button */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-2xl bg-surface-raised/30 text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-400/40 shadow-glow mb-4 relative group">
                      {profile.avatar && !profile.avatar.includes("default") ? (
                        <img src={profile.avatar} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-serif text-3xl font-bold">
                          {profile.name ? profile.name.slice(0, 2).toUpperCase() : "ST"}
                        </div>
                      )}
                    </div>

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />

                    <Button
                      type="button"
                      variant="accent-soft"
                      size="sm"
                      onClick={() => photoInputRef.current?.click()}
                      className="gap-2 text-xs"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Button>
                    <p className="text-[11px] text-text-muted mt-2">PNG or JPG up to 5MB</p>
                  </div>

                  {/* Self-Review Checklist */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-text-primary space-y-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Professional Self-Review Checklist
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Please self-verify your photo against recruiter compliance guidelines:
                      </p>
                    </div>

                    <div className="space-y-3 font-sans text-xs">
                      {[
                        { key: "clearFace", label: "Clear, front-facing view of your face" },
                        { key: "plainBackground", label: "Neutral or solid uncluttered background" },
                        { key: "noGlasses", label: "No dark sunglasses or heavy social media filters" },
                        { key: "goodLighting", label: "Good lighting with crisp resolution" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border cursor-pointer hover:bg-surface-raised transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={(profile.photoChecklist as any)[item.key]}
                            onChange={(e) =>
                              setProfile((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      photoChecklist: {
                                        ...prev.photoChecklist,
                                        [item.key]: e.target.checked,
                                      },
                                    }
                                  : null
                              )
                            }
                            className="w-4 h-4 accent-cyan-400 rounded"
                          />
                          <span className="text-text-primary font-medium">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button variant="primary" onClick={() => setCurrentStep(2)} className="gap-2">
                    Next: Personal Info &rarr;
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: PERSONAL INFO */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    Step 2: Personal Information
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Basic contact information and professional tagline for campus recruiters.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />

                  <Input
                    label="Preferred Name / Nickname"
                    placeholder="e.g. Kanhaiya"
                    value={profile.preferredName || ""}
                    onChange={(e) => setProfile({ ...profile, preferredName: e.target.value })}
                  />

                  <Input
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />

                  <Input
                    label="Location (City, State, Country)"
                    placeholder="Chennai, Tamil Nadu, India"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase text-text-secondary">
                    Professional Headline / Tagline *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aspiring Frontend Developer | B.Tech CS Senior"
                    value={profile.headline || ""}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full bg-surface-raised border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono uppercase text-text-secondary">
                    <span>Bio / About Me (Min 20 characters) *</span>
                    <span>{(profile.bio || "").length} / 300</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    placeholder="Brief summary of your technical interests and placement goals..."
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-surface-raised border border-border rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                    &larr; Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(3)}>
                    Next: Education &rarr;
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: EDUCATION */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      Step 3: Higher Education & Academics
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                      Degree, college, CGPA, and school academic marks.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddEducation} className="gap-1.5 text-xs">
                    <Plus className="w-4 h-4" /> Add Degree
                  </Button>
                </div>

                {/* Higher Education Entries */}
                <div className="space-y-6">
                  {profile.educationEntries.map((edu, idx) => (
                    <div key={edu.id} className="p-4 rounded-xl bg-surface-raised border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">Degree #{idx + 1}</span>
                        {profile.educationEntries.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="text-red-400 p-1 h-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Degree / Program Name *"
                          value={edu.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProfile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    educationEntries: prev.educationEntries.map((item) =>
                                      item.id === edu.id ? { ...item, degree: val } : item
                                    ),
                                  }
                                : null
                            );
                          }}
                        />

                        <Input
                          label="Institution / University Name *"
                          value={edu.institution}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProfile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    educationEntries: prev.educationEntries.map((item) =>
                                      item.id === edu.id ? { ...item, institution: val } : item
                                    ),
                                  }
                                : null
                            );
                          }}
                        />

                        <Input
                          label="Field of Study / Major"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProfile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    educationEntries: prev.educationEntries.map((item) =>
                                      item.id === edu.id ? { ...item, fieldOfStudy: val } : item
                                    ),
                                  }
                                : null
                            );
                          }}
                        />

                        <Input
                          label="CGPA / Percentage *"
                          placeholder="e.g. 8.85 / 10 CGPA"
                          value={edu.grade}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProfile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    educationEntries: prev.educationEntries.map((item) =>
                                      item.id === edu.id ? { ...item, grade: val } : item
                                    ),
                                  }
                                : null
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Collapsible 10th / 12th School Records */}
                <div className="border border-border rounded-xl bg-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowSchoolSection(!showSchoolSection)}
                    className="w-full p-4 flex items-center justify-between text-xs font-mono uppercase text-text-secondary hover:bg-surface-raised"
                  >
                    <span>10th / 12th Board Records (Optional)</span>
                    {showSchoolSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showSchoolSection && (
                    <div className="p-4 border-t border-border space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="10th Board Name"
                          placeholder="CBSE / State Board"
                          value={profile.schoolEducation.board10th}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              schoolEducation: { ...profile.schoolEducation, board10th: e.target.value },
                            })
                          }
                        />
                        <Input
                          label="10th Percentage"
                          placeholder="e.g. 94.2%"
                          value={profile.schoolEducation.percentage10th}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              schoolEducation: { ...profile.schoolEducation, percentage10th: e.target.value },
                            })
                          }
                        />
                        <Input
                          label="12th Board Name"
                          placeholder="CBSE / State Board"
                          value={profile.schoolEducation.board12th}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              schoolEducation: { ...profile.schoolEducation, board12th: e.target.value },
                            })
                          }
                        />
                        <Input
                          label="12th Percentage"
                          placeholder="e.g. 92.8%"
                          value={profile.schoolEducation.percentage12th}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              schoolEducation: { ...profile.schoolEducation, percentage12th: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                    &larr; Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(4)}>
                    Next: Skills & Experience &rarr;
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: SKILLS & EXPERIENCE */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    Step 4: Skills, Projects & Experience
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Add technical skills with proficiency levels, projects, and certifications.
                  </p>
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <label className="block text-xs font-mono uppercase text-text-secondary">
                    Add Skill & Select Proficiency *
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                      type="text"
                      placeholder="e.g. React, Python, Docker..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="flex-1 bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                    />

                    <select
                      value={newSkillCategory}
                      onChange={(e: any) => setNewSkillCategory(e.target.value)}
                      className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text-primary"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Tools">Tools</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>

                    <select
                      value={newSkillProficiency}
                      onChange={(e: any) => setNewSkillProficiency(e.target.value)}
                      className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text-primary"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>

                    <Button type="button" variant="accent-soft" size="sm" onClick={handleAddSkill} className="shrink-0 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>

                  {/* Active Skill Chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.skillsList.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-400/10 text-cyan-300 border border-cyan-400/30"
                      >
                        <span>{s.name}</span>
                        <span className="text-[10px] text-text-muted">({s.proficiency})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s.name)}
                          className="hover:text-red-400 ml-1 text-xs"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase text-text-secondary">Projects & Portfolio</h3>
                    <Button variant="outline" size="sm" onClick={handleAddProject} className="gap-1 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </Button>
                  </div>

                  {profile.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl bg-surface-raised border border-border space-y-3 text-xs">
                      <Input
                        label="Project Title"
                        placeholder="e.g. AI Interview Platform"
                        value={proj.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfile((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  projects: prev.projects.map((p) => (p.id === proj.id ? { ...p, title: val } : p)),
                                }
                              : null
                          );
                        }}
                      />
                      <Input
                        label="GitHub / Demo URL"
                        placeholder="https://github.com/..."
                        value={proj.link}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfile((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  projects: prev.projects.map((p) => (p.id === proj.id ? { ...p, link: val } : p)),
                                }
                              : null
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                    &larr; Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(5)}>
                    Next: Career Goals &rarr;
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 5: CAREER PREFERENCES */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Step 5: Career Preferences & Links
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Target job roles, preferred work locations, and online coding profiles.
                  </p>
                </div>

                {/* Target Roles */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase text-text-secondary">
                    Target Job Roles (Select all that apply) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_ROLES_OPTIONS.map((role) => {
                      const isSelected = profile.targetRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setProfile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    targetRoles: isSelected
                                      ? prev.targetRoles.filter((r) => r !== role)
                                      : [...prev.targetRoles, role],
                                  }
                                : null
                            );
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                            isSelected
                              ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-semibold"
                              : "bg-surface-raised border border-border text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Preferred Work Location(s)"
                    placeholder="e.g. Bengaluru, Remote, Hyderabad"
                    value={profile.preferredLocation || ""}
                    onChange={(e) => setProfile({ ...profile, preferredLocation: e.target.value })}
                  />

                  <Input
                    label="LinkedIn Profile URL *"
                    placeholder="https://linkedin.com/in/username"
                    value={profile.linkedinUrl || ""}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  />

                  <Input
                    label="GitHub Profile URL *"
                    placeholder="https://github.com/username"
                    value={profile.githubUrl || ""}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  />

                  <Input
                    label="Portfolio / LeetCode Handle"
                    placeholder="e.g. https://portfolio.dev"
                    value={profile.portfolioUrl || ""}
                    onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(4)}>
                    &larr; Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(6)}>
                    Review Profile &rarr;
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 6: REVIEW SCREEN */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 space-y-6 border-cyan-400/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-text-primary flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      Review & Confirm Profile
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Review all entered details before publishing to your student placement record.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border">
                    <AvatarCompletionRing profile={profile} size="sm" />
                    <div>
                      <span className="text-[10px] font-mono text-text-muted uppercase block">Calculated Score</span>
                      <span className="text-base font-bold font-mono text-cyan-400">{completion}% Complete</span>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-cyan-400 font-semibold uppercase text-[10px]">Personal Info</span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)} className="h-6 px-2 text-[10px]">
                        Edit
                      </Button>
                    </div>
                    <p className="font-bold text-sm">{profile.name}</p>
                    <p className="text-text-muted">{profile.headline || "No headline set"}</p>
                    <p className="text-text-muted">{profile.email} &bull; {profile.phone || "No phone"}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-teal-400 font-semibold uppercase text-[10px]">Education</span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)} className="h-6 px-2 text-[10px]">
                        Edit
                      </Button>
                    </div>
                    {profile.educationEntries.map((edu, i) => (
                      <div key={i}>
                        <p className="font-bold">{edu.degree}</p>
                        <p className="text-text-muted">{edu.institution} ({edu.grade})</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-indigo-400 font-semibold uppercase text-[10px]">Skills</span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)} className="h-6 px-2 text-[10px]">
                        Edit
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.skillsList.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-surface border text-[10px] font-mono">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-amber-400 font-semibold uppercase text-[10px]">Target Roles & Links</span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)} className="h-6 px-2 text-[10px]">
                        Edit
                      </Button>
                    </div>
                    <p className="font-semibold">{profile.targetRoles.join(", ") || "None selected"}</p>
                    <p className="text-text-muted text-[11px] truncate">LinkedIn: {profile.linkedinUrl || "N/A"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(5)}>
                    &larr; Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleCompleteProfile} className="gap-2 shadow-glow">
                    <Sparkles className="w-4 h-4" />
                    Complete Profile
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
