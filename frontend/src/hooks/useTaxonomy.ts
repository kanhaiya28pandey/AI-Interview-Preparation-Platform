import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BASE_DOMAINS,
  Domain,
  Topic,
  LEGACY_DOMAIN_MAPPING,
  getDomains as getBaseDomains,
  getTopics as getBaseTopics,
  getSubtopics as getBaseSubtopics,
  findDomainByTopic as findBaseDomainByTopic,
} from "@/lib/taxonomy";

const CUSTOM_TAXONOMY_KEY = "taxonomy:custom";
const HIDDEN_TAXONOMY_KEY = "taxonomy:hidden";

export interface CustomTaxonomyState {
  customDomains: Domain[];
  customTopics: Record<string, Topic[]>; // domainSlug -> Topic[]
}

export function useTaxonomy() {
  const [customState, setCustomState] = useState<CustomTaxonomyState>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_TAXONOMY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse custom taxonomy from localStorage:", e);
    }
    return { customDomains: [], customTopics: {} };
  });

  const [hiddenSlugs, setHiddenSlugs] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_TAXONOMY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse hidden taxonomy from localStorage:", e);
    }
    return [];
  });

  // Sync to localStorage
  const saveCustomState = (next: CustomTaxonomyState) => {
    setCustomState(next);
    try {
      localStorage.setItem(CUSTOM_TAXONOMY_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("taxonomy-updated"));
    } catch (e) {
      console.error(e);
    }
  };

  const saveHiddenSlugs = (next: string[]) => {
    setHiddenSlugs(next);
    try {
      localStorage.setItem(HIDDEN_TAXONOMY_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("taxonomy-updated"));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleTaxonomyEvent = () => {
      try {
        const cRaw = localStorage.getItem(CUSTOM_TAXONOMY_KEY);
        if (cRaw) setCustomState(JSON.parse(cRaw));
        const hRaw = localStorage.getItem(HIDDEN_TAXONOMY_KEY);
        if (hRaw) setHiddenSlugs(JSON.parse(hRaw));
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener("taxonomy-updated", handleTaxonomyEvent);
    return () => window.removeEventListener("taxonomy-updated", handleTaxonomyEvent);
  }, []);

  // Compute merged active domains
  const allDomains = useMemo(() => {
    const domainMap = new Map<string, Domain>();

    // 1. Add base domains
    BASE_DOMAINS.forEach((d) => {
      const copy: Domain = {
        ...d,
        topics: [...d.topics],
      };
      domainMap.set(d.slug, copy);
    });

    // 2. Add custom domains
    customState.customDomains.forEach((cd) => {
      domainMap.set(cd.slug, { ...cd, topics: [...(cd.topics || [])] });
    });

    // 3. Add custom topics to domains
    Object.entries(customState.customTopics).forEach(([domainSlug, topics]) => {
      const existing = domainMap.get(domainSlug);
      if (existing) {
        const seen = new Set(existing.topics.map((t) => t.slug));
        topics.forEach((top) => {
          if (!seen.has(top.slug)) {
            existing.topics.push(top);
            seen.add(top.slug);
          }
        });
      }
    });

    // 4. Filter out hidden domains/topics
    const result: Domain[] = [];
    domainMap.forEach((domain) => {
      if (!hiddenSlugs.includes(domain.slug)) {
        const visibleTopics = domain.topics.filter((t) => !hiddenSlugs.includes(t.slug));
        result.push({
          ...domain,
          topics: visibleTopics,
        });
      }
    });

    return result;
  }, [customState, hiddenSlugs]);

  const addCustomDomain = useCallback(
    (name: string, description?: string, icon?: string, color?: string) => {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newDomain: Domain = {
        id: `custom-dom-${Date.now()}`,
        name: name.trim(),
        slug,
        icon: icon || "Layers",
        color: color || "#06b6d4",
        description: description || "Custom domain added by platform administrator.",
        topics: [],
      };

      const next = {
        ...customState,
        customDomains: [...customState.customDomains.filter((d) => d.slug !== slug), newDomain],
      };
      saveCustomState(next);
      return newDomain;
    },
    [customState]
  );

  const addCustomTopic = useCallback(
    (domainSlug: string, topicName: string, subtopics?: string[]) => {
      const slug = topicName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newTopic: Topic = {
        id: `custom-top-${Date.now()}`,
        name: topicName.trim(),
        slug,
        subtopics: subtopics || [],
      };

      const currentTopics = customState.customTopics[domainSlug] || [];
      const updatedTopics = [...currentTopics.filter((t) => t.slug !== slug), newTopic];

      const next: CustomTaxonomyState = {
        ...customState,
        customTopics: {
          ...customState.customTopics,
          [domainSlug]: updatedTopics,
        },
      };
      saveCustomState(next);
      return newTopic;
    },
    [customState]
  );

  const toggleHide = useCallback(
    (slug: string) => {
      if (hiddenSlugs.includes(slug)) {
        saveHiddenSlugs(hiddenSlugs.filter((s) => s !== slug));
      } else {
        saveHiddenSlugs([...hiddenSlugs, slug]);
      }
    },
    [hiddenSlugs]
  );

  const isHidden = useCallback(
    (slug: string) => hiddenSlugs.includes(slug),
    [hiddenSlugs]
  );

  const getTopicsForDomain = useCallback(
    (domainSlug?: string): Topic[] => {
      if (!domainSlug || domainSlug === "ALL") {
        return allDomains.flatMap((d) => d.topics);
      }
      const clean = domainSlug.toLowerCase();
      const direct = allDomains.find((d) => d.slug === clean || d.name.toLowerCase() === clean);
      if (direct) return direct.topics;

      if (LEGACY_DOMAIN_MAPPING[clean]) {
        const mapped = LEGACY_DOMAIN_MAPPING[clean];
        const dom = allDomains.find((d) => d.slug === mapped.domainSlug);
        return dom ? dom.topics : [];
      }

      return [];
    },
    [allDomains]
  );

  const getSubtopicsForTopic = useCallback(
    (topicSlug: string): string[] => {
      const clean = topicSlug.toLowerCase();
      for (const d of allDomains) {
        const t = d.topics.find((top) => top.slug === clean || top.name.toLowerCase() === clean);
        if (t && t.subtopics) return t.subtopics;
      }
      return [];
    },
    [allDomains]
  );

  const findDomain = useCallback(
    (topicSlugOrName: string): Domain | undefined => {
      const clean = topicSlugOrName.toLowerCase();
      return allDomains.find((d) =>
        d.topics.some((t) => t.slug === clean || t.name.toLowerCase() === clean)
      );
    },
    [allDomains]
  );

  const resolveLegacyDomain = useCallback(
    (name: string): Domain | undefined => {
      const clean = name.trim().toLowerCase();
      const direct = allDomains.find((d) => d.slug === clean || d.name.toLowerCase() === clean);
      if (direct) return direct;

      const mapped = LEGACY_DOMAIN_MAPPING[clean];
      if (mapped) {
        return allDomains.find((d) => d.slug === mapped.domainSlug);
      }
      return undefined;
    },
    [allDomains]
  );

  const normalizeDomain = useCallback(
    (name: string): string => {
      const resolved = resolveLegacyDomain(name);
      return resolved ? resolved.slug : name.toLowerCase();
    },
    [resolveLegacyDomain]
  );

  return {
    domains: allDomains,
    getTopicsForDomain,
    getSubtopicsForTopic,
    findDomain,
    resolveLegacyDomain,
    normalizeDomain,
    addCustomDomain,
    addCustomTopic,
    toggleHide,
    isHidden,
    customState,
  };
}
