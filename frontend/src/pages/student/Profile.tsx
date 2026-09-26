import React, { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/mocks/profileData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/common/Skeletons";
import { User, Mail, GraduationCap, Award, Flame, Code2, Edit3, Check } from "lucide-react";
import { toast } from "sonner";

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    profileService.getProfile().then((data) => {
      setProfile(data);
      setFormData(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    const updated = await profileService.updateProfile(formData);
    setProfile(updated);
    setIsEditing(false);
    setLoading(false);
    toast.success("Profile updated successfully!");
  };

  if (loading || !profile) return <CardSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <Card className="p-6 bg-surface border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400" />
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-medium text-text-primary">{profile.name}</h2>
            <p className="text-xs text-text-secondary font-mono flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" /> {profile.degree} · {profile.college}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Badge variant="accent">{profile.role}</Badge>
              <span className="text-xs font-mono text-live flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-live" /> {profile.stats.currentStreak} Day Streak
              </span>
            </div>
          </div>
        </div>

        <Button
          variant={isEditing ? "teal-cyan" : "outline"}
          size="sm"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </Card>

      {/* Edit Form or Read View */}
      {isEditing ? (
        <Card className="p-6 space-y-4 bg-surface border-border">
          <h3 className="font-serif text-lg font-medium text-text-primary">Edit Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="College Name"
              value={formData.college || ""}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            />
            <Input
              label="Degree / Major"
              value={formData.degree || ""}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            />
            <Input
              label="Graduation Year"
              value={formData.graduationYear || ""}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Bio</label>
            <textarea
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full h-24 p-3 bg-surface-raised border border-border rounded-lg text-xs text-text-primary font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Save Profile</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bio & Skills */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-3 bg-surface border-border">
              <h3 className="font-serif text-lg font-medium text-text-primary">About Me</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">{profile.bio}</p>
            </Card>

            <Card className="p-6 space-y-3 bg-surface border-border">
              <h3 className="font-serif text-lg font-medium text-text-primary">Technical Skills & Stack</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="accent">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Stats Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 space-y-4 bg-surface border-border">
              <h3 className="font-serif text-lg font-medium text-text-primary">Performance Stats</h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-text-muted">Total XP</span>
                  <span className="font-bold text-cyan-400">{profile.stats.totalXP}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-text-muted">Mock Rounds</span>
                  <span className="font-bold text-text-primary">{profile.stats.mockInterviewsCompleted}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-text-muted">Problems Solved</span>
                  <span className="font-bold text-text-primary">{profile.stats.codingProblemsSolved}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-muted">Avg Readiness Score</span>
                  <span className="font-bold text-live">{profile.stats.overallRating}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
