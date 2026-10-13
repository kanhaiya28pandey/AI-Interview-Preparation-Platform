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
  const [apiBaseUrl, setApiBaseUrl] = useState(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080");
  const [useMocks, setUseMocks] = useState(isMockMode());

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform settings updated!");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl font-medium text-text-primary">System Settings</h2>
        <p className="text-xs text-text-secondary">Configure backend API base URL, mock fallback flags, and CORS parameters.</p>
      </div>

      {/* Appearance Settings */}
      <AppearanceSettingsCard />

      <Card className="p-6 space-y-4 bg-surface border-border">
        <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" /> Backend Integration Parameters
        </h3>

        <form onSubmit={handleSaveSystem} className="space-y-4">
          <Input
            label="Backend Base URL (VITE_API_BASE_URL)"
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            placeholder="http://localhost:8080"
          />

          <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-lg text-xs">
            <div>
              <span className="font-semibold text-text-primary block">Mock Fallback Mode (VITE_USE_MOCKS)</span>
              <span className="text-text-muted">Simulate non-auth endpoints when backend endpoints are not yet deployed.</span>
            </div>
            <button
              type="button"
              onClick={() => setUseMocks(!useMocks)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                useMocks ? "bg-live/20 text-live border border-live/40" : "bg-surface text-text-muted border border-border"
              }`}
            >
              {useMocks ? "ENABLED (MOCK)" : "DISABLED (REAL API)"}
            </button>
          </div>

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
