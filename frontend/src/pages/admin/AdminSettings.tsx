import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Shield, Settings as SettingsIcon, Server, Database } from "lucide-react";
import { toast } from "sonner";
import { AppearanceSettingsCard } from "@/components/common/AppearanceSettingsCard";
import { isMockMode } from "@/lib/dataMode";

export const AdminSettings: React.FC = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState(
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ""
  );

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform settings updated!");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl font-medium text-text-primary">System Settings</h2>
        <p className="text-xs text-text-secondary">Configure backend API URL and appearance parameters.</p>
      </div>

      {/* Appearance Settings */}
      <AppearanceSettingsCard />

      <Card className="p-6 space-y-4 bg-surface border-border">
        <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" /> Backend Integration Parameters
        </h3>

        <form onSubmit={handleSaveSystem} className="space-y-4">
          <Input
            label="Backend API URL (VITE_API_URL)"
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            placeholder="e.g. https://api.yourdomain.com"
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Platform Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
