import React, { useState, useEffect } from "react";
import { articleService } from "@/services/articleService";
import { Article } from "@/mocks/articleData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableSkeleton } from "@/components/common/Skeletons";
import { RowActions } from "@/components/common/RowActions";
import { Plus, Edit2, FileText } from "lucide-react";
import { toast } from "sonner";

export const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Article>>({});

  useEffect(() => {
    articleService.getArticles().then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = () => {
    setEditing({ title: "", category: "Interview Prep", summary: "", content: "" });
    setModalOpen(true);
  };

  const handleEdit = (art: Article) => {
    setEditing({ ...art });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!editing.title) return;
    toast.success("Article saved successfully in CMS.");
    setModalOpen(false);
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-text-primary">Articles CMS</h2>
          <p className="text-xs text-text-secondary">Publish preparation guides, STAR technique articles, and system design walk-throughs.</p>
        </div>

        <Button variant="primary" size="sm" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> Publish New Article
        </Button>
      </div>

      <Card className="p-0 overflow-hidden bg-surface border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-surface-raised border-b border-border text-text-muted font-mono uppercase text-[11px] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 bg-surface-raised">Title</th>
                <th className="p-4 bg-surface-raised">Category</th>
                <th className="p-4 bg-surface-raised">Author</th>
                <th className="p-4 bg-surface-raised whitespace-nowrap">Views</th>
                <th className="p-4 bg-surface-raised whitespace-nowrap">Likes</th>
                <th className="p-4 bg-surface-raised text-right w-[140px] min-w-[140px] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="p-4 font-semibold text-text-primary">{art.title}</td>
                  <td className="p-4">
                    <Badge variant="accent">{art.category}</Badge>
                  </td>
                  <td className="p-4 text-text-secondary">{art.author.name}</td>
                  <td className="p-4 font-mono text-text-muted">{art.viewsCount}</td>
                  <td className="p-4 font-mono text-live">{art.likesCount}</td>
                  <td className="p-4 text-right w-[140px] min-w-[140px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <RowActions>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(art)}
                        className="whitespace-nowrap shrink-0 h-9 px-3 inline-flex items-center gap-1.5 text-sm text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/10 hover:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
                        title="Edit Article"
                        aria-label="Edit Article"
                      >
                        <Edit2 className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Article Dialog */}
      {modalOpen && (
        <Dialog
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing.id ? "Edit Article" : "Create Article"}
          maxWidthClass="max-w-2xl"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave}>Save Article</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Article Title"
              value={editing.title || ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />

            <Input
              label="Category"
              value={editing.category || ""}
              onChange={(e) => setEditing({ ...editing, category: e.target.value as any })}
            />

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Summary</label>
              <textarea
                value={editing.summary || ""}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                className="w-full h-16 p-2.5 bg-surface-raised border border-border rounded-lg text-xs font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Markdown Body Content</label>
              <textarea
                value={editing.content || ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                className="w-full h-44 p-2.5 bg-surface-raised border border-border rounded-lg text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
