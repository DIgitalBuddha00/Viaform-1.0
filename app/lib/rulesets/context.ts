import { prisma } from "@/app/lib/prisma";

export const RULESET_APPARATUS = ["VAULT", "BARS", "BEAM", "FLOOR", "PHYSICAL_PREPARATION"] as const;
export type RulesetApparatus = (typeof RULESET_APPARATUS)[number];

const APPARATUS_STORAGE_KEYS: Record<RulesetApparatus, readonly string[]> = {
  VAULT: ["VAULT"],
  BARS: ["BARS", "UNEVEN_BARS"],
  BEAM: ["BEAM", "BALANCE_BEAM"],
  FLOOR: ["FLOOR", "FLOOR_EXERCISE"],
  PHYSICAL_PREPARATION: ["PHYSICAL_PREPARATION"],
};

export const RULESET_APPARATUS_LABELS: Record<RulesetApparatus, string> = {
  VAULT: "Vault",
  BARS: "Uneven Bars",
  BEAM: "Balance Beam",
  FLOOR: "Floor Exercise",
  PHYSICAL_PREPARATION: "Physical Preparation",
};

export type ApplicableRulesetRule = {
  id: string;
  apparatus: string;
  levelCode: string;
  ruleType: string;
  ruleKey: string;
  value: unknown;
  sourcePage: number | null;
};

export type GymnastRulesContext = {
  program: {
    id: string;
    code: string;
    name: string;
    governingBody: string;
    discipline: string;
  };
  level: { id: string; code: string; name: string };
  package: {
    id: string;
    code: string;
    name: string;
    cycleLabel: string;
    versionLabel: string;
    sourceDocument: string;
    sourceUrl: string | null;
  };
  rules: ApplicableRulesetRule[];
};

function parseRuleValue(valueJson: string): unknown {
  try {
    return JSON.parse(valueJson);
  } catch {
    return null;
  }
}

export async function getGymnastRulesContext(
  gymnastId: string,
  organisationId: string,
  loadedAssignment?: { programId: string; program: { id: string; code: string; name: string; governingBody: string; discipline: string }; level: { id: string; code: string; name: string } | null } | null,
): Promise<GymnastRulesContext | null> {
  const assignment = loadedAssignment === undefined ? await prisma.gymnastRulesetAssignment.findFirst({
    where: { gymnastId, gymnast: { organisationId } },
    include: { program: true, level: true },
  }) : loadedAssignment;
  if (!assignment?.level) return null;

  const levelCode = assignment.level.code;
  const packages = await prisma.rulesetPackage.findMany({
    where: {
      programId: assignment.programId,
      status: "ACTIVE",
      apparatusRules: {
        some: { levelCode, verificationStatus: "VERIFIED" },
      },
    },
    include: {
      apparatusRules: {
        where: {
          verificationStatus: "VERIFIED",
          levelCode: { in: ["ALL", levelCode] },
        },
        orderBy: [
          { apparatus: "asc" },
          { ruleType: "asc" },
          { ruleKey: "asc" },
        ],
      },
    },
    orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
  });

  const selected = packages[0];
  if (!selected) return null;

  return {
    program: {
      id: assignment.program.id,
      code: assignment.program.code,
      name: assignment.program.name,
      governingBody: assignment.program.governingBody,
      discipline: assignment.program.discipline,
    },
    level: {
      id: assignment.level.id,
      code: levelCode,
      name: assignment.level.name,
    },
    package: {
      id: selected.id,
      code: selected.code,
      name: selected.name,
      cycleLabel: selected.cycleLabel,
      versionLabel: selected.versionLabel,
      sourceDocument: selected.sourceDocument,
      sourceUrl: selected.sourceUrl,
    },
    rules: selected.apparatusRules.map((rule) => ({
      id: rule.id,
      apparatus: rule.apparatus,
      levelCode: rule.levelCode,
      ruleType: rule.ruleType,
      ruleKey: rule.ruleKey,
      value: parseRuleValue(rule.valueJson),
      sourcePage: rule.sourcePage,
    })),
  };
}

export function rulesForApparatus(
  context: GymnastRulesContext | null,
  apparatus: RulesetApparatus,
) {
  if (!context) return [];
  const storageKeys = APPARATUS_STORAGE_KEYS[apparatus];
  return context.rules.filter(
    (rule) => rule.apparatus === "ALL" || storageKeys.includes(rule.apparatus),
  );
}

export function rulesByApparatus(context: GymnastRulesContext | null) {
  if (!context) return [];
  return RULESET_APPARATUS.map((apparatus) => {
    const storageKeys = APPARATUS_STORAGE_KEYS[apparatus];
    const specificRules = context.rules.filter((rule) =>
      storageKeys.includes(rule.apparatus),
    );
    return {
      apparatus,
      label: RULESET_APPARATUS_LABELS[apparatus],
      specificRuleCount: specificRules.length,
      applicableRuleCount: rulesForApparatus(context, apparatus).length,
    };
  }).filter((entry) => entry.specificRuleCount > 0);
}


export async function getRulesetSnapshotRules(
  packageCode: string | null | undefined,
  levelCode: string | null | undefined,
  apparatus: RulesetApparatus,
) {
  if (!packageCode || !levelCode) return [];
  const storageKeys = APPARATUS_STORAGE_KEYS[apparatus];
  const inheritsSeniorFigCode =
    packageCode === "FIG-WAG-2025-2028" && levelCode === "JUNIOR";
  const levelCodes = inheritsSeniorFigCode ? ["ALL", "SENIOR", "JUNIOR"] : ["ALL", levelCode];
  const rules = await prisma.rulesetApparatusRule.findMany({
    where: {
      package: { code: packageCode },
      verificationStatus: "VERIFIED",
      levelCode: { in: levelCodes },
      apparatus: { in: ["ALL", ...storageKeys] },
    },
    orderBy: [{ apparatus: "asc" }, { ruleType: "asc" }, { ruleKey: "asc" }],
  });

  const priority = (rule: { levelCode: string; apparatus: string }) => {
    const levelPriority = rule.levelCode === levelCode ? 4 : rule.levelCode === "SENIOR" ? 2 : 1;
    const apparatusPriority = rule.apparatus === "ALL" ? 0 : 1;
    return levelPriority + apparatusPriority;
  };
  const selected = new Map<string, (typeof rules)[number]>();
  for (const rule of rules) {
    const existing = selected.get(rule.ruleKey);
    if (!existing || priority(rule) > priority(existing)) selected.set(rule.ruleKey, rule);
  }

  return [...selected.values()].map((rule) => ({
    id: rule.id,
    apparatus: rule.apparatus,
    levelCode: rule.levelCode,
    ruleType: rule.ruleType,
    ruleKey: rule.ruleKey,
    value: parseRuleValue(rule.valueJson),
    sourcePage: rule.sourcePage,
  }));
}
