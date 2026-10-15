import { CodingProblem } from "./codingData";

export interface SeedCodingProblem extends CodingProblem {
  domainSlug: string;
  topicSlug: string;
  source: "local-seed";
}

export const SEED_CODING_PROBLEMS: SeedCodingProblem[] = [];
