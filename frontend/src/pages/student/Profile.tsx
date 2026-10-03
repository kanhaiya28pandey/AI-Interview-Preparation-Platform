import React, { useState, useEffect, useMemo } from "react";
import { ContextualHelpTooltip } from "@/components/common/ContextualHelpTooltip";
import { profileService } from "@/services/profileService";
import {
  UserProfile,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
  SkillItem,
  calculateProfileCompletion,
  getProfileVerdict,
  getProfileNudge,
} from "@/mocks/profileData";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { useEditableSection } from "@/hooks/useEditableSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { CardSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import { AvatarCompletionRing } from "@/components/common/AvatarCompletionRing";
import { VerdictHeadline } from "@/components/common/VerdictHeadline";
import { YearSemesterSelect } from "@/components/common/YearSemesterSelect";
import { COURSE_DURATIONS } from "@/lib/courseDurations";
import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  Flame,
  Edit3,
  Check,
  Eye,
  Globe,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Code2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"personal" | "education" | "skills" | "preferences">("personal");
  const [showRecruiterPreview, setShowRecruiterPreview] = useState<boolean>(false);

  // Skill input helper state
  const [newSkillName, setNewSkillName] = useState<string>("");
  const [newSkillCategory, setNewSkillCategory] = useState<"Technical" | "Tools" | "Soft Skills">("Technical");
  const [newSkillProficiency, setNewSkillProficiency] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");

  useEffect(() => {
    profileService.getProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  // Save handler for any section
  const handleSaveSection = async (updatedData: Partial<UserProfile>) => {
    const updated = await profileService.updateProfile(updatedData);
    setProfile(updated);
  };

  // Memoized initial data objects to ensure stable object references across renders
  const personalInitialData = useMemo(() => ({
    name: profile?.name || "",
    preferredName: profile?.preferredName || "",
    headline: profile?.headline || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    languages: profile?.languages || [],
  }), [profile]);

  const educationInitialData = useMemo(() => ({
    educationEntries: profile?.educationEntries || [],
    schoolEducation: profile?.schoolEducation || {
      board10th: "",
      school10th: "",
      year10th: "",
      percentage10th: "",
      board12th: "",
      school12th: "",
      year12th: "",
      percentage12th: "",
    },
  }), [profile]);

  const skillsInitialData = useMemo(() => ({
    skillsList: profile?.skillsList || [],
    projects: profile?.projects || [],
    certifications: profile?.certifications || [],
  }), [profile]);

  const preferencesInitialData = useMemo(() => ({
    targetRoles: profile?.targetRoles || [],
    preferredLocation: profile?.preferredLocation || "",
    openToRelocation: profile?.openToRelocation ?? true,
    employmentType: profile?.employmentType || "Both",
    linkedinUrl: profile?.linkedinUrl || "",
    githubUrl: profile?.githubUrl || "",
    portfolioUrl: profile?.portfolioUrl || "",
    codingPlatformHandle: profile?.codingPlatformHandle || "",
  }), [profile]);

  // Independent edit states per section via custom hook
  const personalSection = useEditableSection({
    initialData: personalInitialData,
    onSave: async (draft) => handleSaveSection(draft),
    successMessage: "Personal Information updated!",
  });

  const educationSection = useEditableSection({
    initialData: educationInitialData,
    onSave: async (draft) => handleSaveSection(draft),
    successMessage: "Education & Academics updated!",
  });

  const skillsSection = useEditableSection({
    initialData: skillsInitialData,
    onSave: async (draft) => handleSaveSection(draft),
    successMessage: "Skills & Experience updated!",
  });

  const preferencesSection = useEditableSection({
    initialData: preferencesInitialData,
    onSave: async (draft) => handleSaveSection(draft),
    successMessage: "Career Preferences & Links updated!",
  });

  if (loading || !profile) return <CardSkeleton />;

  const completion = calculateProfileCompletion(profile);
  const verdict = getProfileVerdict(completion);
  const updatedAgo = formatRelativeTime(profile.updatedAt);
  const nudge = getProfileNudge(profile);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-text-primary">
      {/* Top Profile Header Card (Single Merged Header) */}
      <Card className="p-6 bg-surface border-border flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* Left: ONE Avatar Ring */}
        <div className="shrink-0 flex justify-center">
          <AvatarCompletionRing profile={profile} size="xl" />
        </div>

        {/* Right: Stacked Vertically */}
        <div className="flex-1 w-full space-y-3 text-center md:text-left">
          {/* Row 1: Name + Role Badge on left, Recruiter View button on right */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-text-primary">
                {profile.name}
              </h2>
              <Badge variant="accent" className="uppercase tracking-wider">
                {profile.role}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 justify-center md:justify-end flex-wrap w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecruiterPreview(true)}
                className="gap-1.5 text-xs font-mono"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Public Recruiter View
              </Button>

              {completion < 100 && (
                <Button
                  variant="teal-cyan"
                  size="sm"
                  onClick={() => navigate("/onboarding")}
                  className="gap-1.5 text-xs shadow-glow"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Resume Wizard ({completion}%)
                </Button>
              )}
            </div>
          </div>

          {/* Row 2: Professional Headline */}
          <p className="text-xs md:text-sm font-semibold text-cyan-400 font-sans">
            {profile.headline || "No headline added yet"}
          </p>

          {/* Row 3: Education Line with Icon */}
          <p className="text-xs text-text-muted font-mono flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
            <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {profile.degree || profile.college
                ? `${profile.degree ? profile.degree : ""}${profile.degree && profile.college ? " • " : ""}${profile.college ? profile.college : ""}${profile.graduationYear ? ` (${profile.graduationYear})` : ""}`
                : "Education details not added yet"}
            </span>
          </p>

          {/* Row 4: Stats Row */}
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap pt-0.5">
            <span className="text-xs font-mono text-live flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-live" /> {profile.stats.currentStreak} Day Streak
            </span>
            <span className="text-xs font-mono text-text-muted">
              {profile.stats.codingProblemsSolved} Problems Solved &bull; {profile.stats.mockInterviewsCompleted} Mock Rounds
            </span>
          </div>

          {/* Row 5: Completion Verdict Line */}
          <div className="pt-2.5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-text-muted flex-wrap justify-center md:justify-start">
              <VerdictHeadline
                prefix="Profile: "
                verdict={verdict.label}
                score={completion}
                suffix={` (${completion}%) \u2022 Updated ${updatedAgo}`}
                size="sm"
                as="span"
                glow={true}
              />
              <ContextualHelpTooltip
                title="Profile Completion"
                content="Add bio, skills, education, and photo to reach 100% score."
                faqId="acc-3"
              />
            </div>
            {completion < 100 && nudge && (
              <span className="text-cyan-400 font-sans text-[11px] font-medium">
                ({nudge})
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto font-mono text-xs">
        {[
          { id: "personal", label: "Personal Info", icon: User },
          { id: "education", label: "Education & Academics", icon: GraduationCap },
          { id: "skills", label: "Skills & Experience", icon: Briefcase },
          { id: "preferences", label: "Career Preferences & Links", icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                isActive
                  ? "bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 font-semibold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <Card className="p-6 md:p-8 space-y-6 bg-surface border-border">
        {/* TAB 1: PERSONAL INFO */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-serif text-lg font-bold">Personal Information</h3>
              {!personalSection.isEditing ? (
                <Button variant="outline" size="sm" onClick={personalSection.startEdit} className="gap-1.5 text-xs">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Personal Info
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={personalSection.cancelEdit} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={personalSection.saveEdit}
                    isLoading={personalSection.isSaving}
                    className="gap-1 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              )}
            </div>

            {personalSection.isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={personalSection.draft.name}
                  onChange={(e) => personalSection.setDraft({ ...personalSection.draft, name: e.target.value })}
                />
                <Input
                  label="Preferred Name / Nickname"
                  value={personalSection.draft.preferredName}
                  onChange={(e) => personalSection.setDraft({ ...personalSection.draft, preferredName: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={personalSection.draft.phone}
                  onChange={(e) => personalSection.setDraft({ ...personalSection.draft, phone: e.target.value })}
                />
                <Input
                  label="Location (City, State)"
                  value={personalSection.draft.location}
                  onChange={(e) => personalSection.setDraft({ ...personalSection.draft, location: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Headline / Professional Tagline"
                    value={personalSection.draft.headline}
                    onChange={(e) => personalSection.setDraft({ ...personalSection.draft, headline: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-mono uppercase text-text-secondary">Bio / About Me</label>
                  <textarea
                    rows={3}
                    value={personalSection.draft.bio}
                    onChange={(e) => personalSection.setDraft({ ...personalSection.draft, bio: e.target.value })}
                    className="w-full p-3 bg-surface-raised border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
                <div>
                  <span className="font-mono text-text-muted uppercase text-[10px] block">Full Name & Preferred Name</span>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">
                    {profile.name} {profile.preferredName ? `("${profile.preferredName}")` : ""}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-text-muted uppercase text-[10px] block">Location & Contact</span>
                  <p className="text-sm font-medium text-text-primary mt-0.5">
                    {profile.location || "Location not set"} &bull; {profile.phone || "No phone"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-mono text-text-muted uppercase text-[10px] block">Professional Headline</span>
                  <p className="text-sm font-semibold text-cyan-400 mt-0.5">{profile.headline || "None specified"}</p>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-mono text-text-muted uppercase text-[10px] block mb-1">About Me</span>
                  <p className="text-xs text-text-secondary leading-relaxed bg-surface-raised/40 p-3.5 rounded-xl border border-border">
                    {profile.bio || "No bio entered yet."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDUCATION */}
        {activeTab === "education" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-serif text-lg font-bold">Education & Academic Records</h3>
              {!educationSection.isEditing ? (
                <Button variant="outline" size="sm" onClick={educationSection.startEdit} className="gap-1.5 text-xs">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Education
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={educationSection.cancelEdit} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={educationSection.saveEdit}
                    isLoading={educationSection.isSaving}
                    className="gap-1 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              )}
            </div>

            {educationSection.isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-cyan-400 font-semibold">Degree / College Entries</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEdu: EducationEntry = {
                        id: "edu-" + Date.now(),
                        degree: "",
                        institution: "",
                        fieldOfStudy: "",
                        startYear: "2022",
                        endYear: "2026",
                        isCurrentlyStudying: true,
                        grade: "",
                        coursework: [],
                      };
                      educationSection.setDraft({
                        ...educationSection.draft,
                        educationEntries: [...educationSection.draft.educationEntries, newEdu],
                      });
                    }}
                    className="gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Degree
                  </Button>
                </div>

                {educationSection.draft.educationEntries.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-4 rounded-xl bg-surface-raised border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-cyan-400 font-semibold">Degree #{idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          educationSection.setDraft({
                            ...educationSection.draft,
                            educationEntries: educationSection.draft.educationEntries.filter((e) => e.id !== edu.id),
                          });
                        }}
                        className="text-red-400 p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-secondary">Course / Program</label>
                        <select
                          value={
                            Object.keys(COURSE_DURATIONS).find((c) => edu.degree.startsWith(c)) ||
                            (edu.degree ? "Other" : "")
                          }
                          onChange={(e) => {
                            const selectedCourse = e.target.value;
                            educationSection.setDraft({
                              ...educationSection.draft,
                              educationEntries: educationSection.draft.educationEntries.map((item) =>
                                item.id === edu.id ? { ...item, degree: selectedCourse } : item
                              ),
                            });
                          }}
                          className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-400"
                        >
                          <option value="">-- Select Course --</option>
                          {Object.values(COURSE_DURATIONS).map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <YearSemesterSelect
                        course={
                          Object.keys(COURSE_DURATIONS).find((c) => edu.degree.startsWith(c)) || edu.degree || ""
                        }
                        value={edu.yearSemester || ""}
                        onChange={(val) => {
                          educationSection.setDraft({
                            ...educationSection.draft,
                            educationEntries: educationSection.draft.educationEntries.map((item) =>
                              item.id === edu.id ? { ...item, yearSemester: val } : item
                            ),
                          });
                        }}
                      />

                      <Input
                        label="Institution Name"
                        value={edu.institution}
                        onChange={(e) => {
                          const val = e.target.value;
                          educationSection.setDraft({
                            ...educationSection.draft,
                            educationEntries: educationSection.draft.educationEntries.map((item) =>
                              item.id === edu.id ? { ...item, institution: val } : item
                            ),
                          });
                        }}
                      />
                      <Input
                        label="Field of Study / Branch"
                        value={edu.fieldOfStudy}
                        onChange={(e) => {
                          const val = e.target.value;
                          educationSection.setDraft({
                            ...educationSection.draft,
                            educationEntries: educationSection.draft.educationEntries.map((item) =>
                              item.id === edu.id ? { ...item, fieldOfStudy: val } : item
                            ),
                          });
                        }}
                      />
                      <Input
                        label="CGPA / Percentage"
                        value={edu.grade}
                        onChange={(e) => {
                          const val = e.target.value;
                          educationSection.setDraft({
                            ...educationSection.draft,
                            educationEntries: educationSection.draft.educationEntries.map((item) =>
                              item.id === edu.id ? { ...item, grade: val } : item
                            ),
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* School records edit */}
                <div className="pt-4 border-t border-border space-y-4">
                  <h4 className="text-xs font-mono uppercase text-text-secondary">10th / 12th Board Records</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="10th Board Name"
                      value={educationSection.draft.schoolEducation?.board10th || ""}
                      onChange={(e) =>
                        educationSection.setDraft({
                          ...educationSection.draft,
                          schoolEducation: { ...educationSection.draft.schoolEducation, board10th: e.target.value },
                        })
                      }
                    />
                    <Input
                      label="10th Percentage"
                      value={educationSection.draft.schoolEducation?.percentage10th || ""}
                      onChange={(e) =>
                        educationSection.setDraft({
                          ...educationSection.draft,
                          schoolEducation: { ...educationSection.draft.schoolEducation, percentage10th: e.target.value },
                        })
                      }
                    />
                    <Input
                      label="12th Board Name"
                      value={educationSection.draft.schoolEducation?.board12th || ""}
                      onChange={(e) =>
                        educationSection.setDraft({
                          ...educationSection.draft,
                          schoolEducation: { ...educationSection.draft.schoolEducation, board12th: e.target.value },
                        })
                      }
                    />
                    <Input
                      label="12th Percentage"
                      value={educationSection.draft.schoolEducation?.percentage12th || ""}
                      onChange={(e) =>
                        educationSection.setDraft({
                          ...educationSection.draft,
                          schoolEducation: { ...educationSection.draft.schoolEducation, percentage12th: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.educationEntries && profile.educationEntries.length > 0 ? (
                  profile.educationEntries.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-text-primary">{edu.degree}</h4>
                          <p className="text-xs text-cyan-400 font-medium">{edu.institution}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-teal-400 bg-teal-400/10 px-2.5 py-0.5 rounded border border-teal-400/30">
                          {edu.grade}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted font-mono">
                        Major: {edu.fieldOfStudy} {edu.yearSemester ? `• ${edu.yearSemester}` : ""} &bull; {edu.startYear} - {edu.isCurrentlyStudying ? "Present" : edu.endYear}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={<GraduationCap className="w-8 h-8 text-cyan-400" />}
                    title="No Education Records Added"
                    description="Add your degree, college institution, branch, and academic grade to complete your profile."
                    actionText="Add Education"
                    onAction={educationSection.startEdit}
                  />
                )}

                {profile.schoolEducation && (profile.schoolEducation.board10th || profile.schoolEducation.board12th) && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <h4 className="text-xs font-mono uppercase text-text-secondary">School Records (10th / 12th)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-3.5 rounded-xl bg-surface border border-border">
                        <span className="text-text-muted block text-[10px]">10th Grade Record</span>
                        <p className="font-semibold text-text-primary mt-0.5">
                          {profile.schoolEducation.board10th || "CBSE"} &bull; {profile.schoolEducation.percentage10th}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-surface border border-border">
                        <span className="text-text-muted block text-[10px]">12th Grade Record</span>
                        <p className="font-semibold text-text-primary mt-0.5">
                          {profile.schoolEducation.board12th || "CBSE"} &bull; {profile.schoolEducation.percentage12th}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SKILLS & EXPERIENCE */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-serif text-lg font-bold">Skills, Projects & Experience</h3>
              {!skillsSection.isEditing ? (
                <Button variant="outline" size="sm" onClick={skillsSection.startEdit} className="gap-1.5 text-xs">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Skills & Projects
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={skillsSection.cancelEdit} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={skillsSection.saveEdit}
                    isLoading={skillsSection.isSaving}
                    className="gap-1 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              )}
            </div>

            {skillsSection.isEditing ? (
              <div className="space-y-6">
                {/* Add Skill Inputs */}
                <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3">
                  <h4 className="text-xs font-mono uppercase text-cyan-400 font-semibold">Add New Skill Tag</h4>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input
                      type="text"
                      placeholder="e.g. React, Docker, Python..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary"
                    />
                    <select
                      value={newSkillCategory}
                      onChange={(e: any) => setNewSkillCategory(e.target.value)}
                      className="bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Tools">Tools</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>
                    <select
                      value={newSkillProficiency}
                      onChange={(e: any) => setNewSkillProficiency(e.target.value)}
                      className="bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <Button
                      type="button"
                      variant="accent-soft"
                      size="sm"
                      onClick={() => {
                        if (!newSkillName.trim()) return;
                        const skill: SkillItem = {
                          name: newSkillName.trim(),
                          category: newSkillCategory,
                          proficiency: newSkillProficiency,
                        };
                        skillsSection.setDraft({
                          ...skillsSection.draft,
                          skillsList: [...skillsSection.draft.skillsList, skill],
                        });
                        setNewSkillName("");
                      }}
                      className="shrink-0 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                </div>

                {/* Skill List Editable Chips */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-text-secondary">Current Skills List ({skillsSection.draft.skillsList.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {skillsSection.draft.skillsList.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-400/10 text-cyan-300 border border-cyan-400/30"
                      >
                        <span>{s.name}</span>
                        <span className="text-[10px] text-text-muted">({s.proficiency})</span>
                        <button
                          type="button"
                          onClick={() => {
                            skillsSection.setDraft({
                              ...skillsSection.draft,
                              skillsList: skillsSection.draft.skillsList.filter((item) => item.name !== s.name),
                            });
                          }}
                          className="hover:text-red-400 ml-1 text-xs"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Edit Projects */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-text-secondary">Projects ({skillsSection.draft.projects.length})</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newProj: ProjectEntry = {
                          id: "proj-" + Date.now(),
                          title: "",
                          techStack: [],
                          description: "",
                          link: "",
                        };
                        skillsSection.setDraft({
                          ...skillsSection.draft,
                          projects: [...skillsSection.draft.projects, newProj],
                        });
                      }}
                      className="gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </Button>
                  </div>

                  {skillsSection.draft.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl bg-surface-raised border border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <Input
                          label="Project Title"
                          value={proj.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            skillsSection.setDraft({
                              ...skillsSection.draft,
                              projects: skillsSection.draft.projects.map((p) => (p.id === proj.id ? { ...p, title: val } : p)),
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            skillsSection.setDraft({
                              ...skillsSection.draft,
                              projects: skillsSection.draft.projects.filter((p) => p.id !== proj.id),
                            });
                          }}
                          className="text-red-400 p-1 h-auto ml-2 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <Input
                        label="Project URL / GitHub Link"
                        value={proj.link}
                        onChange={(e) => {
                          const val = e.target.value;
                          skillsSection.setDraft({
                            ...skillsSection.draft,
                            projects: skillsSection.draft.projects.map((p) => (p.id === proj.id ? { ...p, link: val } : p)),
                          });
                        }}
                      />

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase text-text-secondary">Description</label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            skillsSection.setDraft({
                              ...skillsSection.draft,
                              projects: skillsSection.draft.projects.map((p) => (p.id === proj.id ? { ...p, description: val } : p)),
                            });
                          }}
                          className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-text-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase text-cyan-400 font-semibold mb-2">Technical & Soft Skills</h4>
                  {((profile.skillsList && profile.skillsList.length > 0) || (profile.skills && profile.skills.length > 0)) ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsList?.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                          <span>{s.name}</span>
                          <span className="text-[10px] text-text-muted">({s.proficiency})</span>
                        </span>
                      )) || profile.skills?.map((s) => <Badge key={s} variant="accent">{s}</Badge>)}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Briefcase className="w-8 h-8 text-cyan-400" />}
                      title="No Skills Added"
                      description="Add your programming languages, frameworks, developer tools, and core competencies."
                      actionText="Add Skills"
                      onAction={skillsSection.startEdit}
                    />
                  )}
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-xs font-mono uppercase text-text-secondary">Projects ({profile.projects?.length || 0})</h4>
                  {profile.projects && profile.projects.length > 0 ? (
                    profile.projects.map((p) => (
                      <div key={p.id} className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-text-primary">{p.title}</span>
                          {p.link && (
                            <a href={p.link} target="_blank" rel="noreferrer" className="text-cyan-400 text-[11px] flex items-center gap-1 hover:underline">
                              Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary">{p.description}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<Code2 className="w-8 h-8 text-cyan-400" />}
                      title="No Projects Added Yet"
                      description="Add personal full-stack apps, open source contributions, or academic coursework projects."
                      actionText="Add Project"
                      onAction={skillsSection.startEdit}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CAREER PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-serif text-lg font-bold">Career Preferences & Links</h3>
              {!preferencesSection.isEditing ? (
                <Button variant="outline" size="sm" onClick={preferencesSection.startEdit} className="gap-1.5 text-xs">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Preferences
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={preferencesSection.cancelEdit} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={preferencesSection.saveEdit}
                    isLoading={preferencesSection.isSaving}
                    className="gap-1 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              )}
            </div>

            {preferencesSection.isEditing ? (
              <div className="space-y-6">
                {/* Target Roles Multi-Select */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase text-text-secondary">
                    Target Job Roles (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_ROLES_OPTIONS.map((role) => {
                      const isSelected = preferencesSection.draft.targetRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            preferencesSection.setDraft({
                              ...preferencesSection.draft,
                              targetRoles: isSelected
                                ? preferencesSection.draft.targetRoles.filter((r) => r !== role)
                                : [...preferencesSection.draft.targetRoles, role],
                            });
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
                    label="Preferred Work Location"
                    value={preferencesSection.draft.preferredLocation}
                    onChange={(e) =>
                      preferencesSection.setDraft({ ...preferencesSection.draft, preferredLocation: e.target.value })
                    }
                  />

                  <Input
                    label="LinkedIn Profile URL"
                    value={preferencesSection.draft.linkedinUrl}
                    onChange={(e) =>
                      preferencesSection.setDraft({ ...preferencesSection.draft, linkedinUrl: e.target.value })
                    }
                  />

                  <Input
                    label="GitHub Profile URL"
                    value={preferencesSection.draft.githubUrl}
                    onChange={(e) =>
                      preferencesSection.setDraft({ ...preferencesSection.draft, githubUrl: e.target.value })
                    }
                  />

                  <Input
                    label="Portfolio Website / LeetCode Handle"
                    value={preferencesSection.draft.portfolioUrl}
                    onChange={(e) =>
                      preferencesSection.setDraft({ ...preferencesSection.draft, portfolioUrl: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase text-cyan-400 font-semibold mb-2">Target Job Roles</h4>
                  {profile.targetRoles && profile.targetRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.targetRoles.map((role) => (
                        <Badge key={role} variant="gold">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Target className="w-8 h-8 text-cyan-400" />}
                      title="No Target Roles Selected"
                      description="Choose the engineering job roles you want to target for campus drives."
                      actionText="Select Target Roles"
                      onAction={preferencesSection.startEdit}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border">
                    <span className="font-mono text-text-muted uppercase text-[10px] block">Preferred Work Location</span>
                    <p className="font-semibold text-text-primary mt-1">{profile.preferredLocation || "Flexible / Not set"}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border">
                    <span className="font-mono text-text-muted uppercase text-[10px] block">Professional Links</span>
                    <div className="space-y-1 mt-1 font-mono text-[11px]">
                      {profile.linkedinUrl ? (
                        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-cyan-400 flex items-center gap-1.5 hover:underline">
                          <Globe className="w-3.5 h-3.5" /> LinkedIn Profile
                        </a>
                      ) : (
                        <span className="text-text-muted">No LinkedIn link added</span>
                      )}
                      {profile.githubUrl ? (
                        <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-cyan-400 flex items-center gap-1.5 hover:underline">
                          <Globe className="w-3.5 h-3.5" /> GitHub Profile
                        </a>
                      ) : (
                        <span className="text-text-muted block">No GitHub link added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* RECRUITER PUBLIC PREVIEW DIALOG */}
      <Dialog
        isOpen={showRecruiterPreview}
        onClose={() => setShowRecruiterPreview(false)}
        title="Public Candidate Profile (Recruiter View)"
        maxWidthClass="max-w-3xl"
      >
        <div className="space-y-6 py-2">
          {/* Recruiter Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-raised via-surface to-surface-raised border border-cyan-400/30 flex items-center gap-5">
            <AvatarCompletionRing profile={profile} size="xl" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-text-primary">{profile.name}</h3>
                <span className="text-[10px] font-mono bg-teal-400/20 text-teal-400 border border-teal-400/40 px-2 py-0.5 rounded uppercase">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-semibold">{profile.headline}</p>
              <p className="text-xs text-text-muted font-mono">
                {profile.degree} &bull; {profile.college} ({profile.graduationYear})
              </p>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="font-mono text-cyan-400 font-semibold text-[10px] uppercase">Target Roles</span>
              <p className="font-semibold text-text-primary">{profile.targetRoles.join(", ")}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="font-mono text-teal-400 font-semibold text-[10px] uppercase">Placement Performance</span>
              <p className="font-mono font-bold text-text-primary">
                {profile.stats.codingProblemsSolved} Problems Solved &bull; {profile.stats.overallRating}% Overall Rating
              </p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="font-mono text-indigo-400 font-semibold text-[10px] uppercase">Key Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowRecruiterPreview(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
