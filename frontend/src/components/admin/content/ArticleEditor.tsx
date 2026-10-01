import React, { useState, useEffect } from "react";
import { BookOpen, Image as ImageIcon, Eye, Clock, Star } from "lucide-react";

export interface ArticleEditorData {
  markdown?: string;
  coverImage?: string;
  category?: string;
  featured?: boolean;
  readingTimeMinutes?: number;
}

interface ArticleEditorProps {
  data: ArticleEditorData;
  subject: string;
  tags: string[];
  onChange: (updated: ArticleEditorData) => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  data,
  subject,
  tags,
  onChange,
}) => {
  const [viewMode, setViewMode] = useState<"SPLIT" | "WRITE" | "PREVIEW">("SPLIT");

  const markdown = data.markdown || "";
  const coverImage = data.coverImage || "";
  const featured = data.featured || false;

  // Auto calculate reading time (~200 words per minute)
  useEffect(() => {
    const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;
    const est = Math.max(1, Math.ceil(wordCount / 200));
    if (est !== data.readingTimeMinutes) {
      onChange({ ...data, readingTimeMinutes: est });
    }
  }, [markdown]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Article & Guide Authoring</h3>
          <p className="text-xs text-text-muted">
            Author rich educational technical articles, tutorials, and cheat sheets with real-time markdown preview.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode("WRITE")}
            className={`px-3 py-1.5 rounded-md font-medium ${
              viewMode === "WRITE" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setViewMode("SPLIT")}
            className={`px-3 py-1.5 rounded-md font-medium ${
              viewMode === "SPLIT" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("PREVIEW")}
            className={`px-3 py-1.5 rounded-md font-medium ${
              viewMode === "PREVIEW" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Article Metadata Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-raised border border-border rounded-xl">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-text-muted mb-1">Cover Image URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => onChange({ ...data, coverImage: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 sm:pt-0">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>~{data.readingTimeMinutes || 3} min read</span>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-text-primary">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => onChange({ ...data, featured: e.target.checked })}
              className="accent-cyan-400 rounded"
            />
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" /> Featured
            </span>
          </label>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div
        className={`grid gap-4 ${
          viewMode === "SPLIT" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Markdown Input */}
        {(viewMode === "WRITE" || viewMode === "SPLIT") && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Markdown Source</span>
            <textarea
              rows={18}
              value={markdown}
              onChange={(e) => onChange({ ...data, markdown: e.target.value })}
              placeholder="# Heading 1&#10;&#10;Write comprehensive technical insights here using Markdown...&#10;&#10;```typescript&#10;const user = authenticateSession();&#10;```"
              className="w-full h-[460px] p-4 text-xs font-mono bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Live Preview */}
        {(viewMode === "PREVIEW" || viewMode === "SPLIT") && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Live Render Preview</span>
            <div className="w-full h-[460px] p-6 bg-surface-raised border border-border rounded-xl overflow-y-auto prose prose-invert prose-sm max-w-none">
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Article Cover"
                  className="w-full h-44 object-cover rounded-lg mb-4 border border-border"
                />
              )}
              {markdown ? (
                <div className="space-y-3 text-text-primary text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {markdown}
                </div>
              ) : (
                <div className="text-center py-20 text-text-muted text-xs">
                  Type markdown content on the left to see live rendering preview here.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
