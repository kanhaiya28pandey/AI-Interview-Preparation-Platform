import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface UseEditableSectionOptions<T> {
  initialData: T;
  onSave: (updatedData: T) => Promise<void>;
  successMessage?: string;
}

export function useEditableSection<T>({
  initialData,
  onSave,
  successMessage = "Section updated successfully!",
}: UseEditableSectionOptions<T>) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync draft when initialData changes from parent state, but ONLY when not actively editing!
  useEffect(() => {
    if (!isEditing) {
      setDraft(initialData);
    }
  }, [initialData, isEditing]);

  const startEdit = () => {
    setDraft(initialData);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(initialData);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
      setIsEditing(false);
      toast.success(successMessage);
    } catch (err: any) {
      toast.error(err.message || "Failed to save section changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    draft,
    setDraft,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
