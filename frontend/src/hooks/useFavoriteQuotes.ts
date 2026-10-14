import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

function getStorageKey(userId?: string): string {
  return userId ? `favoriteQuotes_${userId}` : "favoriteQuotes";
}

function getStoredFavorites(key: string): (number | string)[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key) || (key !== "favoriteQuotes" ? localStorage.getItem("favoriteQuotes") : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn("[useFavoriteQuotes] Failed to read favorites from storage:", error);
    return [];
  }
}

function persistFavorites(key: string, favs: (number | string)[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(favs));
  } catch (error) {
    console.warn("[useFavoriteQuotes] Failed to save favorites to storage:", error);
  }
}

export function useFavoriteQuotes() {
  const { user } = useAuth();
  const userId = user?.userId || user?.email;
  const storageKey = getStorageKey(userId);

  const [favorites, setFavorites] = useState<(number | string)[]>(() => getStoredFavorites(storageKey));

  // Sync state if user changes
  useEffect(() => {
    setFavorites(getStoredFavorites(storageKey));
  }, [storageKey]);

  // Listen to window storage events to stay in sync across components/tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setFavorites(getStoredFavorites(storageKey));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  const isFavorite = useCallback(
    (id: number | string): boolean => {
      return favorites.includes(id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id: number | string) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
        persistFavorites(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}

export default useFavoriteQuotes;
