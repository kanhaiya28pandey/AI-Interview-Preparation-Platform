import { useEffect } from "react";

let activeModalCount = 0;
let previousBodyOverflow: string | null = null;

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;
  activeModalCount++;
  if (activeModalCount === 1) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
  }
}

export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;
  activeModalCount = Math.max(0, activeModalCount - 1);
  if (activeModalCount === 0) {
    document.body.style.overflow = previousBodyOverflow || "";
    document.body.classList.remove("modal-open");
    previousBodyOverflow = null;
  }
}

export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}
