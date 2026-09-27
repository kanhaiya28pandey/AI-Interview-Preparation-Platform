export interface CourseDurationConfig {
  code: string;
  label: string;
  years: number;
  semestersPerYear: number;
  isPhD?: boolean;
  customLabels?: string[];
}

export const COURSE_DURATIONS: Record<string, CourseDurationConfig> = {
  "B.Tech": {
    code: "B.Tech",
    label: "B.Tech (Bachelor of Technology)",
    years: 4,
    semestersPerYear: 2,
  },
  "B.E.": {
    code: "B.E.",
    label: "B.E. (Bachelor of Engineering)",
    years: 4,
    semestersPerYear: 2,
  },
  BCA: {
    code: "BCA",
    label: "BCA (Bachelor of Computer Applications)",
    years: 3,
    semestersPerYear: 2,
  },
  "B.Sc": {
    code: "B.Sc",
    label: "B.Sc (Bachelor of Science)",
    years: 3,
    semestersPerYear: 2,
  },
  BBA: {
    code: "BBA",
    label: "BBA (Bachelor of Business Administration)",
    years: 3,
    semestersPerYear: 2,
  },
  "M.Tech": {
    code: "M.Tech",
    label: "M.Tech (Master of Technology)",
    years: 2,
    semestersPerYear: 2,
  },
  "M.E.": {
    code: "M.E.",
    label: "M.E. (Master of Engineering)",
    years: 2,
    semestersPerYear: 2,
  },
  MCA: {
    code: "MCA",
    label: "MCA (Master of Computer Applications)",
    years: 2,
    semestersPerYear: 2,
  },
  "M.Sc": {
    code: "M.Sc",
    label: "M.Sc (Master of Science)",
    years: 2,
    semestersPerYear: 2,
  },
  MBA: {
    code: "MBA",
    label: "MBA (Master of Business Administration)",
    years: 2,
    semestersPerYear: 2,
  },
  Diploma: {
    code: "Diploma",
    label: "Diploma (Polytechnic / Technical Diploma)",
    years: 3,
    semestersPerYear: 2,
  },
  "PhD / Doctorate": {
    code: "PhD / Doctorate",
    label: "PhD / Doctorate",
    years: 4,
    semestersPerYear: 0,
    isPhD: true,
    customLabels: ["Year 1 (Coursework)", "Year 2 (Research)", "Year 3 (Thesis)", "Year 4+ (Final Defense)"],
  },
  Other: {
    code: "Other",
    label: "Other Degree Program",
    years: 4,
    semestersPerYear: 2,
  },
};

export const COURSE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Courses" },
  { value: "B.Tech / B.E.", label: "B.Tech / B.E." },
  { value: "BCA", label: "BCA" },
  { value: "B.Sc", label: "B.Sc" },
  { value: "BBA", label: "BBA" },
  { value: "Diploma", label: "Diploma" },
  { value: "M.Tech / M.E.", label: "M.Tech / M.E." },
  { value: "MCA", label: "MCA" },
  { value: "M.Sc", label: "M.Sc" },
  { value: "MBA", label: "MBA" },
  { value: "PhD / Doctorate", label: "PhD / Doctorate" },
];

/**
 * Robustly checks if a student's course string matches the selected course filter.
 */
export function matchesCourseFilter(studentCourse: string, filterValue: string): boolean {
  if (!filterValue || filterValue === "ALL") return true;
  if (!studentCourse) return false;

  const sc = studentCourse.trim().toLowerCase();
  const fv = filterValue.trim().toLowerCase();

  if (sc === fv) return true;

  if (fv === "b.tech / b.e." || fv === "b.tech/b.e.") {
    return sc.includes("b.tech") || sc.includes("b.e.") || sc.includes("bachelor of tech") || sc.includes("bachelor of eng");
  }

  if (fv === "m.tech / m.e." || fv === "m.tech/m.e.") {
    return sc.includes("m.tech") || sc.includes("m.e.") || sc.includes("master of tech") || sc.includes("master of eng");
  }

  if (fv === "phd / doctorate") {
    return sc.includes("phd") || sc.includes("doctorate");
  }

  return sc.includes(fv) || fv.includes(sc);
}

/**
 * Returns options array for a given course name (e.g. "MCA" -> ["Year 1 / Sem 1-2", "Year 2 / Sem 3-4"])
 */
export function getYearSemesterOptions(courseName: string): string[] {
  if (!courseName) return [];

  const key = Object.keys(COURSE_DURATIONS).find(
    (k) =>
      courseName.toLowerCase() === k.toLowerCase() ||
      courseName.toLowerCase().startsWith(k.toLowerCase())
  );

  const config = key ? COURSE_DURATIONS[key] : COURSE_DURATIONS["Other"];

  if (config.isPhD && config.customLabels) {
    return config.customLabels;
  }

  const options: string[] = [];
  for (let year = 1; year <= config.years; year++) {
    const startSem = (year - 1) * config.semestersPerYear + 1;
    const endSem = year * config.semestersPerYear;
    options.push(`Year ${year} / Sem ${startSem}-${endSem}`);
  }

  return options;
}

/**
 * Checks whether a yearSemester value is valid for a given course
 */
export function isValidYearSemesterForCourse(courseName: string, yearSemester: string): boolean {
  if (!courseName || !yearSemester) return false;
  if (yearSemester.toLowerCase().includes("custom") || yearSemester.startsWith("Custom:")) return true;

  const validOptions = getYearSemesterOptions(courseName);
  return validOptions.includes(yearSemester);
}
