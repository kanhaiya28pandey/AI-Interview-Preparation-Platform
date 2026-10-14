import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { AppearanceSettingsCard } from "@/components/common/AppearanceSettingsCard";
import { PageHeader } from "@/components/common/PageHeader";

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        icon={SettingsIcon}
        title="Platform Settings"
        subtitle="Customize the look and feel of the platform: theme, accent color, background and motion."
        badge="CONFIGURATION"
        accent="cyan"
      />

      {/* Appearance Settings */}
      <AppearanceSettingsCard />
    </div>
  );
};

export default AdminSettings;
