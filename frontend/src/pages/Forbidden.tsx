import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink text-text-primary flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="p-4 bg-danger-bg border border-danger/40 rounded-full text-danger inline-block">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-danger">403 Access Denied</span>
          <h1 className="font-serif text-3xl font-medium">Restricted Area</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            You don't have administrator permissions to view this page. If you are an administrator, please sign in with an admin account.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              <Home className="w-4 h-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
