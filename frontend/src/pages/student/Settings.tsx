import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Lock, Bell, Shield, KeyRound } from "lucide-react";
import { AppearanceSettingsCard } from "@/components/common/AppearanceSettingsCard";

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl font-medium text-text-primary">Account Settings</h2>
        <p className="text-xs text-text-secondary">Manage your password, security preferences, and notification triggers.</p>
      </div>

      {/* Account Info */}
      <Card className="p-6 space-y-4 bg-surface border-border">
        <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" /> Account Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono items-center">
          <div>
            <span className="text-text-muted block">Account Email</span>
            <span className="text-text-primary font-semibold">{user?.email || ""}</span>
          </div>
          <div>
            <span className="text-text-muted block mb-1">Assigned Role</span>
            <RoleBadge role={user?.role} size="md" />
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <AppearanceSettingsCard />

      {/* Password Change Form */}
      <Card className="p-6 space-y-4 bg-surface border-border">
        <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-cyan-400" /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};
