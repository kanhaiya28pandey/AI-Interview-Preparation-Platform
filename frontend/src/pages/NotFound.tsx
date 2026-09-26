import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-ink text-text-primary flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="p-4 bg-surface-raised border border-border rounded-full text-cyan-400 inline-block">
          <FileQuestion className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">404 Page Not Found</span>
          <h1 className="font-serif text-3xl font-medium">Page Not Found</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            The route you were looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex justify-center">
          <Link to="/">
            <Button variant="primary" size="sm">
              <Home className="w-4 h-4" /> Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
