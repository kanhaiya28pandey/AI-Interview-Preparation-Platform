import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BASE_DOMAINS,
  Domain,
  Topic,
  RoadmapWeek,
  RoadmapTask,
  LEGACY_DOMAIN_MAPPING,
} from "@/lib/taxonomy";

const UNIFIED_DOMAINS_KEY = "taxonomy:unified_domains_v3";
const HIDDEN_TAXONOMY_KEY = "taxonomy:hidden_v3";

export interface CustomTaxonomyState {
  customDomains: Domain[];
  customTopics: Record<string, Topic[]>;
}

export function useTaxonomy() {
  const [allDomains, setAllDomains] = useState<Domain[]>(() => {
    try {
      const raw = localStorage.getItem(UNIFIED_DOMAINS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse unified domains from localStorage:", e);
    }
    // Initialize with BASE_DOMAINS
    try {
      localStorage.setItem(UNIFIED_DOMAINS_KEY, JSON.stringify(BASE_DOMAINS));
    } catch (e) {
      console.error(e);
    }
    return BASE_DOMAINS;
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

  const saveDomains = (next: Domain[]) => {
    setAllDomains(next);
    try {
      localStorage.setItem(UNIFIED_DOMAINS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("taxonomy-updated"));
    } catch (e) {
      console.error("Failed to save domains to localStorage:", e);
    }
  };

  const saveHiddenSlugs = (next: string[]) => {
    setHiddenSlugs(next);
    try {
      localStorage.setItem(HIDDEN_TAXONOMY_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("taxonomy-updated"));
    } catch (e) {
      console.error("Failed to save hidden slugs to localStorage:", e);
    }
  };

  useEffect(() => {
    const handleTaxonomyEvent = () => {
      try {
        const raw = localStorage.getItem(UNIFIED_DOMAINS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setAllDomains(parsed);
        }
        const hRaw = localStorage.getItem(HIDDEN_TAXONOMY_KEY);
        if (hRaw) setHiddenSlugs(JSON.parse(hRaw));
      } catch (err) {
        console.error("Error refreshing taxonomy:", err);
      }
    };
    window.addEventListener("taxonomy-updated", handleTaxonomyEvent);
    return () => window.removeEventListener("taxonomy-updated", handleTaxonomyEvent);
  }, []);

  // Filtered active visible domains
  const visibleDomains = useMemo(() => {
    return allDomains
      .filter((d) => !hiddenSlugs.includes(d.slug))
      .map((d) => ({
        ...d,
        topics: d.topics.filter((t) => !hiddenSlugs.includes(t.slug)),
      }));
  }, [allDomains, hiddenSlugs]);

  // Backward compatibility object
  const customState: CustomTaxonomyState = useMemo(() => {
    const custom = allDomains.filter((d) => d.isCustom || d.id.startsWith("custom-"));
    const customTopics: Record<string, Topic[]> = {};
    allDomains.forEach((d) => {
      const customT = d.topics.filter((t) => t.id.startsWith("custom-"));
      if (customT.length > 0) {
        customTopics[d.slug] = customT;
      }
    });
    return {
      customDomains: custom,
      customTopics,
    };
  }, [allDomains]);

  // 1. Add Domain Dynamically
  const addCustomDomain = useCallback(
    (
      name: string,
      description?: string,
      icon?: string,
      color?: string,
      durationWeeks: number = 6,
      totalHours: number = 60,
      level: string = "Comprehensive Placement Curriculum"
    ) => {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = allDomains.find((d) => d.slug === slug);
      if (existing) {
        return existing;
      }

      // Generate default weeks structure
      const initialWeeks: RoadmapWeek[] = Array.from({ length: durationWeeks }, (_, i) => ({
        weekNumber: i + 1,
        title: `Week ${i + 1}: ${name} Core Foundations`,
        focus: `Milestone ${i + 1} curriculum and practice targets for ${name}.`,
        tasks: [
          {
            id: `${slug}-w${i + 1}-1`,
            label: `Practice ${name} core module exercises`,
            type: "PRACTICE",
            linkUrl: "/practice",
            estimatedMinutes: 45,
          },
          {
            id: `${slug}-w${i + 1}-2`,
            label: `Complete Week ${i + 1} ${name} concept quiz`,
            type: "QUIZ",
            linkUrl: "/quiz",
            estimatedMinutes: 20,
          },
        ],
      }));

      const newDomain: Domain = {
        id: `custom-dom-${Date.now()}`,
        name: name.trim(),
        slug,
        icon: icon || "Layers",
        color: color || "#06b6d4",
        description: description || "Custom engineering curriculum and placement roadmap.",
        durationWeeks,
        totalHours,
        level,
        isCustom: true,
        topics: [
          {
            id: `top-${slug}-core`,
            name: `${name.trim()} Core`,
            slug: `${slug}-core`,
            weekNumber: 1,
            subtopics: ["Foundations", "Architecture", "Interview Preparation"],
          },
        ],
        weeks: initialWeeks,
      };

      saveDomains([...allDomains, newDomain]);
      return newDomain;
    },
    [allDomains]
  );

  // 2. Remove / Delete Domain Dynamically
  const deleteDomain = useCallback(
    (domainSlug: string) => {
      const next = allDomains.filter((d) => d.slug !== domainSlug && d.id !== domainSlug);
      saveDomains(next);
      // Remove from hidden list if present
      if (hiddenSlugs.includes(domainSlug)) {
        saveHiddenSlugs(hiddenSlugs.filter((s) => s !== domainSlug));
      }
    },
    [allDomains, hiddenSlugs]
  );

  // 3. Add Custom Topic (legacy & basic support)
  const addCustomTopic = useCallback(
    (domainSlug: string, topicName: string, subtopics?: string[], weekNumber?: number) => {
      const slug = topicName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const targetDomain = allDomains.find((d) => d.slug === domainSlug);
      if (!targetDomain) return null;

      const newTopic: Topic = {
        id: `custom-top-${Date.now()}`,
        name: topicName.trim(),
        slug,
        subtopics: subtopics || [],
        weekNumber: weekNumber || 1,
      };

      const updatedDomains = allDomains.map((d) => {
        if (d.slug !== domainSlug) return d;
        const exists = d.topics.some((t) => t.slug === slug);
        const nextTopics = exists
          ? d.topics.map((t) => (t.slug === slug ? newTopic : t))
          : [...d.topics, newTopic];

        // Also if weekNumber is supplied, add a task into that week's curriculum
        let updatedWeeks = [...(d.weeks || [])];
        if (weekNumber) {
          const weekIdx = updatedWeeks.findIndex((w) => w.weekNumber === weekNumber);
          const taskObj: RoadmapTask = {
            id: `task-${Date.now()}`,
            label: `Master ${topicName.trim()} & Complete Benchmark Exercise`,
            type: "PRACTICE",
            linkUrl: "/practice",
            estimatedMinutes: 45,
            topicSlug: slug,
          };
          if (weekIdx !== -1) {
            updatedWeeks[weekIdx] = {
              ...updatedWeeks[weekIdx],
              tasks: [...updatedWeeks[weekIdx].tasks, taskObj],
            };
          }
        }

        return {
          ...d,
          topics: nextTopics,
          weeks: updatedWeeks,
        };
      });

      saveDomains(updatedDomains);
      return newTopic;
    },
    [allDomains]
  );

  // 4. Add Topic with Specific Timeline / Week and Task Details
  const addTopicWithTimeline = useCallback(
    (
      domainSlug: string,
      data: {
        name: string;
        subtopics?: string[];
        weekNumber?: number;
        taskType?: "PRACTICE" | "QUIZ" | "CODING" | "INTERVIEW" | "READING";
        taskLabel?: string;
        linkUrl?: string;
        estimatedMinutes?: number;
      }
    ) => {
      const targetDomain = allDomains.find((d) => d.slug === domainSlug);
      if (!targetDomain) return null;

      const topicSlug = data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newTopic: Topic = {
        id: `top-${Date.now()}`,
        name: data.name.trim(),
        slug: topicSlug,
        subtopics: data.subtopics || [],
        weekNumber: data.weekNumber || 1,
      };

      const defaultLink =
        data.taskType === "CODING"
          ? "/coding"
          : data.taskType === "QUIZ"
          ? "/quiz"
          : data.taskType === "INTERVIEW"
          ? "/mock-interview"
          : data.taskType === "READING"
          ? "/articles"
          : "/practice";

      const newTask: RoadmapTask = {
        id: `task-${Date.now()}`,
        label: data.taskLabel || `Master ${data.name.trim()} & Practical Application`,
        type: data.taskType || "PRACTICE",
        linkUrl: data.linkUrl || defaultLink,
        estimatedMinutes: data.estimatedMinutes || 45,
        topicSlug,
      };

      const updatedDomains = allDomains.map((d) => {
        if (d.slug !== domainSlug) return d;

        // Topics list
        const exists = d.topics.some((t) => t.slug === topicSlug);
        const nextTopics = exists
          ? d.topics.map((t) => (t.slug === topicSlug ? newTopic : t))
          : [...d.topics, newTopic];

        // Weeks list
        let nextWeeks = [...(d.weeks || [])];
        const targetWeekNum = data.weekNumber || 1;
        const weekIdx = nextWeeks.findIndex((w) => w.weekNumber === targetWeekNum);

        if (weekIdx !== -1) {
          nextWeeks[weekIdx] = {
            ...nextWeeks[weekIdx],
            tasks: [...nextWeeks[weekIdx].tasks, newTask],
          };
        } else {
          // If week doesn't exist, create it
          nextWeeks.push({
            weekNumber: targetWeekNum,
            title: `Week ${targetWeekNum}: ${data.name.trim()} Module`,
            focus: `Intensive coverage of ${data.name.trim()} concepts and hands-on assessments.`,
            tasks: [newTask],
          });
          nextWeeks.sort((a, b) => a.weekNumber - b.weekNumber);
        }

        return {
          ...d,
          durationWeeks: Math.max(d.durationWeeks || 0, nextWeeks.length),
          topics: nextTopics,
          weeks: nextWeeks,
        };
      });

      saveDomains(updatedDomains);
      return newTopic;
    },
    [allDomains]
  );

  // 5. Remove Topic from Domain
  const removeTopic = useCallback(
    (domainSlug: string, topicSlug: string) => {
      const updatedDomains = allDomains.map((d) => {
        if (d.slug !== domainSlug) return d;
        return {
          ...d,
          topics: d.topics.filter((t) => t.slug !== topicSlug && t.id !== topicSlug),
          weeks: d.weeks.map((w) => ({
            ...w,
            tasks: w.tasks.filter((task) => task.topicSlug !== topicSlug),
          })),
        };
      });
      saveDomains(updatedDomains);
    },
    [allDomains]
  );

  // 6. Add Week to Domain
  const addWeekToDomain = useCallback(
    (domainSlug: string, week: { title: string; focus: string }) => {
      const updatedDomains = allDomains.map((d) => {
        if (d.slug !== domainSlug) return d;
        const nextWeekNum = (d.weeks?.length || 0) + 1;
        const newWeekObj: RoadmapWeek = {
          weekNumber: nextWeekNum,
          title: week.title || `Week ${nextWeekNum}: Advanced Specialization`,
          focus: week.focus || `Focused problem solving and placement simulation for Week ${nextWeekNum}.`,
          tasks: [
            {
              id: `${domainSlug}-w${nextWeekNum}-1`,
              label: `Practice Week ${nextWeekNum} Core Assessment`,
              type: "PRACTICE",
              linkUrl: "/practice",
              estimatedMinutes: 45,
            },
            {
              id: `${domainSlug}-w${nextWeekNum}-2`,
              label: `Complete Week ${nextWeekNum} Placement Diagnostic Quiz`,
              type: "QUIZ",
              linkUrl: "/quiz",
              estimatedMinutes: 20,
            },
          ],
        };
        const nextWeeks = [...(d.weeks || []), newWeekObj];
        return {
          ...d,
          durationWeeks: nextWeeks.length,
          weeks: nextWeeks,
        };
      });
      saveDomains(updatedDomains);
    },
    [allDomains]
  );

  // 7. Remove Week from Domain
  const removeWeekFromDomain = useCallback(
    (domainSlug: string, weekNumber: number) => {
      const updatedDomains = allDomains.map((d) => {
        if (d.slug !== domainSlug) return d;
        const nextWeeks = d.weeks
          .filter((w) => w.weekNumber !== weekNumber)
          .map((w, idx) => ({
            ...w,
            weekNumber: idx + 1,
            title: w.title.replace(/^Week \d+:/, `Week ${idx + 1}:`),
          }));
        return {
          ...d,
          durationWeeks: nextWeeks.length,
          weeks: nextWeeks,
        };
      });
      saveDomains(updatedDomains);
    },
    [allDomains]
  );

  // 8. Remove Task from Week
  const removeTaskFromWeek = useCallback(
    (domainSlug: string, weekNumber: number, taskId: string) => {
      const updatedDomains = allDomains.map((d) => {
        if (d.slug !== domainSlug) return d;
        return {
          ...d,
          weeks: d.weeks.map((w) => {
            if (w.weekNumber !== weekNumber) return w;
            return {
              ...w,
              tasks: w.tasks.filter((t) => t.id !== taskId),
            };
          }),
        };
      });
      saveDomains(updatedDomains);
    },
    [allDomains]
  );

  // 9. Reset to Base Defaults
  const resetToDefaultTaxonomy = useCallback(() => {
    saveDomains(BASE_DOMAINS);
    saveHiddenSlugs([]);
  }, []);

  // 10. Hide / Unhide Domain or Topic
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

  // 11. Helper queries
  const getTopicsForDomain = useCallback(
    (domainSlug?: string): Topic[] => {
      if (!domainSlug || domainSlug === "ALL") {
        return visibleDomains.flatMap((d) => d.topics);
      }
      const clean = domainSlug.toLowerCase();
      const direct = visibleDomains.find((d) => d.slug === clean || d.name.toLowerCase() === clean);
      if (direct) return direct.topics;

      if (LEGACY_DOMAIN_MAPPING[clean]) {
        const mapped = LEGACY_DOMAIN_MAPPING[clean];
        const dom = visibleDomains.find((d) => d.slug === mapped.domainSlug);
        return dom ? dom.topics : [];
      }

      return [];
    },
    [visibleDomains]
  );

  const getSubtopicsForTopic = useCallback(
    (topicSlug: string): string[] => {
      const clean = topicSlug.toLowerCase();
      for (const d of visibleDomains) {
        const t = d.topics.find((top) => top.slug === clean || top.name.toLowerCase() === clean);
        if (t && t.subtopics) return t.subtopics;
      }
      return [];
    },
    [visibleDomains]
  );

  const findDomain = useCallback(
    (topicSlugOrName: string): Domain | undefined => {
      const clean = topicSlugOrName.toLowerCase();
      return visibleDomains.find((d) =>
        d.topics.some((t) => t.slug === clean || t.name.toLowerCase() === clean)
      );
    },
    [visibleDomains]
  );

  const resolveLegacyDomain = useCallback(
    (name: string): Domain | undefined => {
      const clean = name.trim().toLowerCase();
      const direct = visibleDomains.find((d) => d.slug === clean || d.name.toLowerCase() === clean);
      if (direct) return direct;

      const mapped = LEGACY_DOMAIN_MAPPING[clean];
      if (mapped) {
        return visibleDomains.find((d) => d.slug === mapped.domainSlug);
      }
      return undefined;
    },
    [visibleDomains]
  );

  const normalizeDomain = useCallback(
    (name: string): string => {
      const resolved = resolveLegacyDomain(name);
      return resolved ? resolved.slug : name.toLowerCase();
    },
    [resolveLegacyDomain]
  );

  return {
    domains: visibleDomains,
    allDomains,
    getTopicsForDomain,
    getSubtopicsForTopic,
    findDomain,
    resolveLegacyDomain,
    normalizeDomain,
    addCustomDomain,
    deleteDomain,
    addCustomTopic,
    addTopicWithTimeline,
    removeTopic,
    addWeekToDomain,
    removeWeekFromDomain,
    removeTaskFromWeek,
    resetToDefaultTaxonomy,
    toggleHide,
    isHidden,
    customState,
  };
}
