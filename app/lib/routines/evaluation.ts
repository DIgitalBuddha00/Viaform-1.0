import {
  evaluateFigRoutine,
  type FigCountingPolicy,
  type FigDifficulty,
  type FigRoutineApparatus,
  type FigRoutineEvaluation,
} from "@/app/lib/fig/routine-evaluation";
import type { ApplicableRulesetRule } from "@/app/lib/rulesets/context";

const DIFFICULTIES = new Set(["A","B","C","D","E","F","G","H","I","J"]);

type StoredElement = {
  id: string;
  orderIndex: number;
  recognition: string;
  isDismount: boolean;
  elementDefinition: {
    officialNumber: string;
    variantKey: string;
    difficulty: string | null;
    metadata: string;
  };
};

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function metadata(value: string) {
  try {
    return objectValue(JSON.parse(value)) ?? {};
  } catch {
    return {};
  }
}

function countingPolicy(rules: ApplicableRulesetRule[]): FigCountingPolicy | undefined {
  const value = objectValue(rules.find((rule) => rule.ruleKey === "counting_difficulty")?.value);
  if (!value || typeof value.maximum !== "number" || typeof value.includesDismount !== "boolean") return undefined;
  const minimumDance = typeof value.minimumDance === "number" ? value.minimumDance : undefined;
  const minimumAcro = typeof value.minimumAcro === "number" ? value.minimumAcro : undefined;
  return {
    maximum: value.maximum,
    includesDismount: value.includesDismount,
    maximumDance: minimumDance !== undefined && minimumAcro !== undefined ? value.maximum - minimumAcro : undefined,
    maximumAcro: minimumDance !== undefined && minimumAcro !== undefined ? value.maximum - minimumDance : undefined,
  };
}

function compositionKeys(rules: ApplicableRulesetRule[]) {
  const value = objectValue(rules.find((rule) => rule.ruleKey === "composition_requirements")?.value);
  return Array.isArray(value?.requirements)
    ? value.requirements.filter((item): item is string => typeof item === "string")
    : undefined;
}

export function evaluateStoredFigRoutine(args: {
  apparatus: string;
  levelCode: string | null;
  elements: StoredElement[];
  rules: ApplicableRulesetRule[];
}): FigRoutineEvaluation | null {
  if (!["BARS","BEAM","FLOOR"].includes(args.apparatus)) return null;
  const usable = args.elements.filter(
    (item) => item.elementDefinition.difficulty && DIFFICULTIES.has(item.elementDefinition.difficulty),
  );
  const evaluation = evaluateFigRoutine({
    apparatus: args.apparatus as FigRoutineApparatus,
    level: args.levelCode === "JUNIOR" ? "JUNIOR" : "SENIOR",
    countingPolicy: countingPolicy(args.rules),
    compositionRequirementKeys: compositionKeys(args.rules),
    elements: usable.map((item) => {
      const meta = metadata(item.elementDefinition.metadata);
      return {
        id: item.id,
        officialNumber: item.elementDefinition.officialNumber,
        variantKey: item.elementDefinition.variantKey,
        identityKey: item.elementDefinition.officialNumber + ":" + item.elementDefinition.variantKey,
        rootKey: typeof meta.rootKey === "string" ? meta.rootKey : undefined,
        rootLimitExempt: meta.rootLimitExempt === true,
        difficulty: item.elementDefinition.difficulty as FigDifficulty,
        kind: meta.dance === true ? "DANCE" : meta.acro === true ? "ACRO" : undefined,
        chronology: item.orderIndex,
        recognition: item.recognition === "RECOGNISED"
          ? "RECOGNISED"
          : item.recognition === "NOT_RECOGNISED"
            ? "NOT_RECOGNISED"
            : "UNKNOWN",
        isDismount: item.isDismount,
      };
    }),
    dismountBonus: args.levelCode === "JUNIOR" ? "NOT_AWARDED" : undefined,
  });

  const omitted = args.elements.length - usable.length;
  if (omitted > 0) {
    evaluation.findings.unshift({
      code: "DIFFICULTY_REQUIRED",
      message: omitted + " selected element" + (omitted === 1 ? " has" : "s have") + " no verified A–J difficulty and cannot be evaluated.",
    });
    evaluation.status = "COACH_DECISION_REQUIRED";
  }
  return evaluation;
}
