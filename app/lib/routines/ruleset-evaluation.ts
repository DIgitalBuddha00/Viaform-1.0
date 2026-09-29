import { evaluateStoredFigRoutine } from "@/app/lib/routines/evaluation";
import type { ApplicableRulesetRule } from "@/app/lib/rulesets/context";

type StoredElement = Parameters<typeof evaluateStoredFigRoutine>[0]["elements"];

export type RoutineEvaluationFinding = {
  code: string;
  message: string;
  sourcePage?: number | null;
};

export type RoutineEvaluationMetric = {
  label: string;
  value: string;
};

export type RoutineEvaluation = {
  provider: "FIG" | "GI";
  status: "READY" | "COACH_DECISION_REQUIRED";
  headline: string;
  metrics: RoutineEvaluationMetric[];
  findings: RoutineEvaluationFinding[];
  note: string;
};

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function label(value: unknown) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

function giRoutineRule(apparatus: string, rules: ApplicableRulesetRule[]) {
  const key: Record<string, string> = {
    VAULT: "vault_routine",
    BARS: "bars_routine",
    BEAM: "beam_routine",
    FLOOR: "floor_routine",
  };
  return rules.find((rule) => rule.ruleKey === key[apparatus]);
}

function giEvaluation(apparatus: string, rules: ApplicableRulesetRule[]): RoutineEvaluation | null {
  const rule = giRoutineRule(apparatus, rules);
  const value = objectValue(rule?.value);
  if (!rule || !value) return null;

  const startValue = objectValue(value.startValue);
  const startMode = String(startValue?.mode ?? "");
  const total = typeof startValue?.total === "number" ? startValue.total : null;
  const prescribed = [
    ...arrayValue(value.routine),
    ...arrayValue(value.setRoutine),
    ...arrayValue(value.requirements),
  ];
  const composition = arrayValue(value.compositionRequirements);
  const bonuses = arrayValue(value.bonuses);
  const construction = objectValue(value.routineConstruction);
  const vaultOptions = arrayValue(value.vaultOptions);

  const findings: RoutineEvaluationFinding[] = [];
  if (prescribed.length) {
    for (const requirement of prescribed) {
      findings.push({
        code: "PRESCRIBED_REQUIREMENT_REVIEW",
        message: "Review required · " + label(requirement),
        sourcePage: rule.sourcePage,
      });
    }
  }
  if (composition.length) {
    for (const item of composition) {
      const entry = objectValue(item);
      findings.push({
        code: "COMPOSITION_REQUIREMENT_REVIEW",
        message: "Review required · " + label(entry?.requirement ?? item),
        sourcePage: rule.sourcePage,
      });
    }
  }
  if (bonuses.length) {
    findings.push({
      code: "BONUS_REVIEW_REQUIRED",
      message: bonuses.length + " verified bonus opportunit" + (bonuses.length === 1 ? "y requires" : "ies require") + " coach or judge review.",
      sourcePage: rule.sourcePage,
    });
  }
  if (construction) {
    findings.push({
      code: "ROUTINE_CONSTRUCTION_REVIEW",
      message: "Routine construction is governed by the saved GI level rule and must be checked against the actual routine.",
      sourcePage: rule.sourcePage,
    });
  }

  const metrics: RoutineEvaluationMetric[] = [];
  if (prescribed.length) metrics.push({ label: "Prescribed items", value: String(prescribed.length) });
  if (composition.length) metrics.push({ label: "Requirements", value: String(composition.length) });
  if (bonuses.length) metrics.push({ label: "Bonus options", value: String(bonuses.length) });
  if (vaultOptions.length) metrics.push({ label: "Vault options", value: String(vaultOptions.length) });
  if (rule.sourcePage) metrics.push({ label: "Source page", value: String(rule.sourcePage) });

  const headline = total !== null
    ? "Start value " + total.toFixed(1)
    : startMode
      ? label(startMode)
      : "Verified GI routine rule";

  return {
    provider: "GI",
    status: findings.length ? "COACH_DECISION_REQUIRED" : "READY",
    headline,
    metrics,
    findings,
    note: "This is a bounded evaluation of the verified Gymnastics Ireland package. Viaform does not infer that a prescribed requirement or bonus has been fulfilled from the routine label alone.",
  };
}

export function evaluateStoredRoutine(args: {
  programCode: string | null;
  apparatus: string;
  levelCode: string | null;
  elements: StoredElement;
  rules: ApplicableRulesetRule[];
}): RoutineEvaluation | null {
  if (args.programCode === "FIG_WAG" && ["BARS", "BEAM", "FLOOR"].includes(args.apparatus)) {
    const fig = evaluateStoredFigRoutine({
      apparatus: args.apparatus,
      levelCode: args.levelCode,
      elements: args.elements,
      rules: args.rules,
    });
    if (!fig) return null;
    return {
      provider: "FIG",
      status: fig.status,
      headline: fig.difficulty.toFixed(1) + " counting DV",
      metrics: [
        { label: "Counted", value: String(fig.countedElements.length) },
        { label: "Excluded", value: String(fig.excludedElements.length) },
        { label: "CR", value: fig.composition.toFixed(1) },
        { label: "CV", value: fig.connectionValue.toFixed(1) },
      ],
      findings: fig.findings,
      note: "A D-score is not presented while required recognition, composition, connection, series or dismount decisions remain unresolved.",
    };
  }

  if (args.programCode === "GI_WAG") {
    return giEvaluation(args.apparatus, args.rules);
  }

  if (args.programCode === "FIG_WAG" && args.apparatus === "VAULT") {
    const vaultRule = args.rules.find((rule) =>
      ["apparatus_vault_pair", "apparatus_final_different_groups", "apparatus_qualification_second_vault"].includes(rule.ruleKey),
    );
    return {
      provider: "FIG",
      status: "COACH_DECISION_REQUIRED",
      headline: "Verified FIG vault context",
      metrics: [{ label: "Applicable rules", value: String(args.rules.length) }],
      findings: vaultRule ? [{
        code: "VAULT_CONTEXT_REVIEW",
        message: "Vault selection must be checked against the saved competition context before a two-vault requirement is applied.",
        sourcePage: vaultRule.sourcePage,
      }] : [],
      note: "Vault requirements depend on competition context. Viaform does not assume Qualification or Apparatus Final from the saved vault plan alone.",
    };
  }

  return null;
}
