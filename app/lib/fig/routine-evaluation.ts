import { FIG_DIFFICULTY_VALUES } from "./catalog";
import type { FigRulesetLevel } from "./types";

export type FigDifficulty = keyof typeof FIG_DIFFICULTY_VALUES;
export type FigRoutineApparatus = "BARS" | "BEAM" | "FLOOR";
export type FigElementKind = "ACRO" | "DANCE";
export type FigRecognition = "RECOGNISED" | "NOT_RECOGNISED" | "UNKNOWN";
export type FigDecisionStatus = "READY" | "COACH_DECISION_REQUIRED";

export type FigRoutineElement = {
  id?: string;
  officialNumber?: string;
  variantKey?: string;
  identityKey?: string;
  rootKey?: string;
  rootLimitExempt?: boolean;
  difficulty: FigDifficulty;
  kind?: FigElementKind;
  chronology?: number;
  recognition?: FigRecognition;
  isDismount?: boolean;
};

export type FigAdjudicatedStatus = "AWARDED" | "NOT_AWARDED" | "UNKNOWN";

export type FigCompositionReview = {
  key: string;
  status: "FULFILLED" | "NOT_FULFILLED" | "UNKNOWN";
};

export type FigValueReview = {
  key: string;
  value: 0.1 | 0.2;
  status: FigAdjudicatedStatus;
};

export type FigCountingPolicy = {
  maximum: number;
  includesDismount: boolean;
  maximumAcro?: number;
  maximumDance?: number;
};

export type FigRoutineEvaluationInput = {
  apparatus: FigRoutineApparatus;
  level?: FigRulesetLevel;
  elements: FigRoutineElement[];
  countingPolicy?: FigCountingPolicy;
  compositionRequirementKeys?: readonly string[];
  composition?: FigCompositionReview[];
  connections?: FigValueReview[];
  seriesBonuses?: FigValueReview[];
  dismountBonus?: FigAdjudicatedStatus;
  shortExerciseElementCount?: number;
};

export type FigEvaluationFinding = {
  code: string;
  message: string;
  elementId?: string;
};

export type FigCountedElement = FigRoutineElement & {
  sourceIndex: number;
  value: number;
};

export type FigRoutineEvaluation = {
  status: FigDecisionStatus;
  countedElements: FigCountedElement[];
  excludedElements: Array<FigCountedElement & { reason: string }>;
  countingMix: { acro: number; dance: number; unclassified: number };
  difficulty: number;
  composition: number;
  connectionValue: number;
  seriesBonus: number;
  dismountBonus: number;
  dScore: number;
  shortExerciseDeduction: number;
  findings: FigEvaluationFinding[];
};

export const FIG_SENIOR_COMPOSITION_REQUIREMENTS: Record<FigRoutineApparatus, readonly string[]> = {
  BARS: [
    "FLIGHT_HIGH_TO_LOW",
    "FLIGHT_SAME_BAR",
    "DIFFERENT_GRIPS_EXCLUDING_CAST_MOUNT_DISMOUNT",
    "NON_FLIGHT_TURN_MIN_360_EXCLUDING_MOUNT",
  ],
  BEAM: [
    "TWO_DIFFERENT_DANCE_ONE_LEAP_OR_JUMP_180_SPLIT_OR_STRADDLE",
    "GROUP_3_TURN_OR_LISTED_ROLL_FLAIR",
    "ACRO_SERIES_TWO_FLIGHT_ONE_SALTO",
    "ACRO_DIFFERENT_DIRECTIONS_FORWARD_OR_SIDEWARD_AND_BACKWARD",
  ],
  FLOOR: [
    "DANCE_PASSAGE_WITH_180_SPLIT_OR_STRADDLE",
    "SALTO_WITH_LA_TURN_MIN_360",
    "SALTO_WITH_DOUBLE_BA",
    "BACKWARD_AND_FORWARD_SALTO",
  ],
};

const roundTenth = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;

export function difficultyValue(
  difficulty: FigDifficulty,
  level: FigRulesetLevel = "SENIOR",
) {
  const raw = FIG_DIFFICULTY_VALUES[difficulty];
  return level === "JUNIOR" ? Math.min(raw, 0.5) : raw;
}

export function baseDifficulty(
  elements: FigRoutineElement[],
  level: FigRulesetLevel = "SENIOR",
  max = 8,
) {
  return roundTenth(
    [...elements]
      .sort((a, b) => difficultyValue(b.difficulty, level) - difficultyValue(a.difficulty, level))
      .slice(0, max)
      .reduce((sum, element) => sum + difficultyValue(element.difficulty, level), 0),
  );
}

export function countingMix(elements: FigRoutineElement[]) {
  return {
    acro: elements.filter((element) => element.kind === "ACRO").length,
    dance: elements.filter((element) => element.kind === "DANCE").length,
  };
}

export function shortExercisePenalty(
  elementCount: number,
  level: FigRulesetLevel = "SENIOR",
) {
  const count = Math.max(0, Math.floor(elementCount));
  if (count >= (level === "JUNIOR" ? 6 : 7)) return 0;
  if (count >= 5) return 4;
  if (count >= 3) return 6;
  if (count >= 1) return 8;
  return 10;
}

function chronology(element: FigCountedElement) {
  return element.chronology ?? element.sourceIndex;
}

function byValueThenChronology(a: FigCountedElement, b: FigCountedElement) {
  return b.value - a.value || chronology(a) - chronology(b);
}

function chronological<T extends FigCountedElement>(elements: T[]) {
  return [...elements].sort((a, b) => chronology(a) - chronology(b));
}

function elementIdentity(element: FigRoutineElement) {
  if (element.identityKey) return element.identityKey;
  if (!element.officialNumber) return null;
  return `${element.officialNumber}:${element.variantKey ?? "a"}`;
}

function includeDismount(
  elements: FigCountedElement[],
  maximum: number,
  findings: FigEvaluationFinding[],
) {
  const sorted = [...elements].sort(byValueThenChronology);
  const dismounts = chronological(elements.filter((element) => element.isDismount));
  const dismount = dismounts.at(-1);

  if (dismounts.length > 1) {
    findings.push({
      code: "MULTIPLE_DISMOUNTS",
      message: "More than one element is marked as the dismount; the last is used.",
    });
  }

  if (!dismount) return sorted.slice(0, maximum);
  return [dismount, ...sorted.filter((element) => element !== dismount)]
    .slice(0, maximum)
    .sort(byValueThenChronology);
}

function selectCountingElements(
  apparatus: FigRoutineApparatus,
  elements: FigCountedElement[],
  policy: FigCountingPolicy,
  findings: FigEvaluationFinding[],
) {
  const select = policy.includesDismount
    ? (candidates: FigCountedElement[], maximum: number) => includeDismount(candidates, maximum, findings)
    : (candidates: FigCountedElement[], maximum: number) => [...candidates].sort(byValueThenChronology).slice(0, maximum);

  if (apparatus === "BARS") return select(elements, policy.maximum);

  const classified = elements.filter((element) => {
    if (element.kind) return true;
    findings.push({
      code: "ELEMENT_KIND_REQUIRED",
      message: "Beam and Floor elements need an Acro or Dance classification before counting.",
      elementId: element.id,
    });
    return false;
  });
  const dance = classified
    .filter((element) => element.kind === "DANCE")
    .sort(byValueThenChronology)
    .slice(0, policy.maximumDance ?? policy.maximum);
  const acro = select(
    classified.filter((element) => element.kind === "ACRO"),
    policy.maximumAcro ?? policy.maximum,
  );
  return select([...dance, ...acro], policy.maximum);
}

function reviewedValue(
  reviews: FigValueReview[] | undefined,
  label: string,
  findings: FigEvaluationFinding[],
) {
  if (!reviews) {
    findings.push({
      code: `${label}_REVIEW_REQUIRED`,
      message: `${label.replaceAll("_", " ")} has not been reviewed.`,
    });
    return 0;
  }

  return roundTenth(
    reviews.reduce((total, review) => {
      if (review.status === "UNKNOWN") {
        findings.push({
          code: `${label}_DECISION_REQUIRED`,
          message: `${review.key} needs a coach or judge decision.`,
        });
      }
      return total + (review.status === "AWARDED" ? review.value : 0);
    }, 0),
  );
}

function compositionValue(
  apparatus: FigRoutineApparatus,
  level: FigRulesetLevel,
  requirementKeys: readonly string[] | undefined,
  reviews: FigCompositionReview[] | undefined,
  findings: FigEvaluationFinding[],
) {
  const expected = requirementKeys
    ?? (level === "SENIOR" ? FIG_SENIOR_COMPOSITION_REQUIREMENTS[apparatus] : []);
  if (level === "JUNIOR" && !requirementKeys) {
    findings.push({
      code: "JUNIOR_COMPOSITION_RULES_REQUIRED",
      message: "Junior composition requirements must be supplied from a verified rules package.",
    });
  }
  const reviewByKey = new Map(reviews?.map((review) => [review.key, review]));
  let fulfilled = 0;

  for (const key of expected) {
    const review = reviewByKey.get(key);
    if (!review || review.status === "UNKNOWN") {
      findings.push({
        code: "COMPOSITION_DECISION_REQUIRED",
        message: `${key} needs a coach or judge decision.`,
      });
      continue;
    }
    if (review.status === "FULFILLED") fulfilled += 1;
  }

  return Math.min(2, fulfilled * 0.5);
}

export function evaluateFigRoutine(input: FigRoutineEvaluationInput): FigRoutineEvaluation {
  const level = input.level ?? "SENIOR";
  const findings: FigEvaluationFinding[] = [];
  const defaultCountingPolicy: FigCountingPolicy = input.apparatus === "BARS"
    ? { maximum: 8, includesDismount: true }
    : { maximum: 8, includesDismount: true, maximumAcro: 5, maximumDance: 5 };
  const countingPolicy = input.countingPolicy ?? defaultCountingPolicy;
  if (level === "JUNIOR" && !input.countingPolicy) {
    findings.push({
      code: "JUNIOR_COUNTING_RULES_REQUIRED",
      message: "Junior counting limits must be supplied from a verified rules package; the Senior structure is shown only as a provisional calculation.",
    });
  }
  const excludedElements: FigRoutineEvaluation["excludedElements"] = [];
  const prepared: FigCountedElement[] = input.elements.map((element, sourceIndex) => ({
    ...element,
    sourceIndex,
    value: difficultyValue(element.difficulty, level),
  }));
  const eligible: FigCountedElement[] = [];
  const seenElements = new Set<string>();
  const seenDanceNumbers = new Set<string>();
  const barsRootCounts = new Map<string, number>();

  for (const element of chronological(prepared)) {
    if (element.recognition !== "RECOGNISED") {
      const unknown = element.recognition !== "NOT_RECOGNISED";
      excludedElements.push({
        ...element,
        reason: unknown ? "Recognition needs a coach or judge decision." : "Element was not recognised.",
      });
      if (unknown) {
        findings.push({
          code: "RECOGNITION_DECISION_REQUIRED",
          message: "Element recognition is unknown.",
          elementId: element.id,
        });
      }
      continue;
    }

    const identity = elementIdentity(element);
    if (!identity) {
      findings.push({
        code: "ELEMENT_IDENTITY_REQUIRED",
        message: "An official element identity is needed to verify repetition.",
        elementId: element.id,
      });
    } else if (seenElements.has(identity)) {
      excludedElements.push({
        ...element,
        reason: "Repeated element: difficulty counts once chronologically.",
      });
      continue;
    } else {
      seenElements.add(identity);
    }

    if (element.kind === "DANCE" && element.officialNumber) {
      if (seenDanceNumbers.has(element.officialNumber)) {
        excludedElements.push({
          ...element,
          reason: "Dance elements with the same official number count once chronologically.",
        });
        continue;
      }
      seenDanceNumbers.add(element.officialNumber);
    }

    if (input.apparatus === "BARS" && element.rootKey && !element.rootLimitExempt) {
      const count = barsRootCounts.get(element.rootKey) ?? 0;
      if (count >= 3) {
        excludedElements.push({
          ...element,
          reason: "Only the first three eligible elements from the same Bars root count chronologically.",
        });
        continue;
      }
      barsRootCounts.set(element.rootKey, count + 1);
    } else if (input.apparatus === "BARS" && !element.rootKey && !element.rootLimitExempt) {
      findings.push({
        code: "BARS_ROOT_REQUIRED",
        message: "A Bars root is needed to verify the chronological three-element limit.",
        elementId: element.id,
      });
    }

    eligible.push(element);
  }

  const countedElements = selectCountingElements(input.apparatus, eligible, countingPolicy, findings);
  const counted = new Set(countedElements.map((element) => element.sourceIndex));
  for (const element of eligible) {
    if (!counted.has(element.sourceIndex)) {
      excludedElements.push({ ...element, reason: "Outside the apparatus counting limits." });
    }
  }

  const difficulty = roundTenth(
    countedElements.reduce((total, element) => total + element.value, 0),
  );
  const composition = compositionValue(
    input.apparatus,
    level,
    input.compositionRequirementKeys,
    input.composition,
    findings,
  );
  const connectionValue = reviewedValue(input.connections, "CONNECTION_VALUE", findings);
  const seriesBonus = input.apparatus === "BEAM"
    ? reviewedValue(input.seriesBonuses, "SERIES_BONUS", findings)
    : 0;
  let dismountBonus = 0;
  if (level === "SENIOR") {
    if (!input.dismountBonus || input.dismountBonus === "UNKNOWN") {
      findings.push({
        code: "DISMOUNT_BONUS_DECISION_REQUIRED",
        message: "Senior dismount bonus eligibility needs a coach or judge decision.",
      });
    } else if (input.dismountBonus === "AWARDED") {
      dismountBonus = 0.2;
    }
  }

  const elementCount = input.shortExerciseElementCount ?? eligible.length;
  const shortExerciseDeduction = shortExercisePenalty(elementCount, level);
  const countingMixValue = {
    acro: countedElements.filter((element) => element.kind === "ACRO").length,
    dance: countedElements.filter((element) => element.kind === "DANCE").length,
    unclassified: countedElements.filter((element) => !element.kind).length,
  };
  const dScore = roundTenth(
    difficulty + composition + connectionValue + seriesBonus + dismountBonus,
  );

  return {
    status: findings.length ? "COACH_DECISION_REQUIRED" : "READY",
    countedElements: chronological(countedElements),
    excludedElements: chronological(excludedElements),
    countingMix: countingMixValue,
    difficulty,
    composition,
    connectionValue,
    seriesBonus,
    dismountBonus,
    dScore,
    shortExerciseDeduction,
    findings,
  };
}
