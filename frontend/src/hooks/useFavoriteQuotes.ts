import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "favoriteQuotes";

function getStoredFavorites(): (number | string)[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

function persistFavorites(favs: (number | string)[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch (error) {
    console.warn("[useFavoriteQuotes] Failed to save favorites to storage:", error);
  }
}

export function useFavoriteQuotes() {
  const [favorites, setFavorites] = useState<(number | string)[]>(() => getStoredFavorites());

  // Listen to window storage events to stay in sync across components/tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(getStoredFavorites());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
        persistFavorites(next);
        return next;
      });
    },
    []
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}

export default useFavoriteQuotes;
