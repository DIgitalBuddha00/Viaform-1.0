"use server";

import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export type PlanningSkillOption = {
  id: string;
  name: string;
  aliases: string;
  officialNumber: string | null;
  provenance: string;
};

const apparatusMap: Record<string, string> = {
  VAULT: "VAULT",
  UNEVEN_BARS: "BARS",
  BARS: "BARS",
  BALANCE_BEAM: "BEAM",
  BEAM: "BEAM",
  FLOOR_EXERCISE: "FLOOR",
  FLOOR: "FLOOR",
};

export async function searchPlanningSkills(
  query: string,
  apparatus: string | null,
  canonicalOnly = false,
): Promise<PlanningSkillOption[]> {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) return [];

  const term = query.trim().slice(0, 80);
  const normalizedApparatus = apparatusMap[(apparatus ?? "").trim().toUpperCase()] ?? "";
  if (term.length < 2 || !normalizedApparatus) return [];

  const canonical = await prisma.viaformSkill.findMany({
    where: {
      discipline: "WAG",
      apparatus: normalizedApparatus,
      status: "ACTIVE",
      OR: [
        { name: { contains: term } },
        { aliases: { contains: term } },
        { canonicalKey: { contains: term } },
        { figElementDefinition: { is: { officialNumber: { contains: term } } } },
        { figVaultDefinition: { is: { officialNumber: { contains: term } } } },
      ],
    },
    select: {
      id: true,
      name: true,
      aliases: true,
      provenance: true,
      figElementDefinition: { select: { officialNumber: true } },
      figVaultDefinition: { select: { officialNumber: true } },
    },
    orderBy: { name: "asc" },
    take: 20,
  });
  const results: PlanningSkillOption[] = canonical.map((skill) => ({
    id: skill.id,
    name: skill.name,
    aliases: skill.aliases,
    officialNumber: skill.figElementDefinition?.officialNumber ?? skill.figVaultDefinition?.officialNumber ?? null,
    provenance: skill.provenance,
  }));
  if (canonicalOnly || results.length >= 20) return results;

  const remaining = 20 - results.length;
  if (normalizedApparatus === "VAULT") {
    const fallback = await prisma.figVaultDefinition.findMany({
      where: {
        status: "ACTIVE",
        package: { program: { code: "FIG_WAG" } },
        canonicalSkills: { none: { discipline: "WAG", status: "ACTIVE" } },
        OR: [
          { name: { contains: term } },
          { aliases: { contains: term } },
          { officialNumber: { contains: term } },
        ],
      },
      select: { id: true, name: true, aliases: true, officialNumber: true },
      orderBy: [{ officialNumber: "asc" }, { variantKey: "asc" }],
      take: remaining,
    });
    results.push(...fallback.map((skill) => ({
      id: `vault:${skill.id}`,
      name: skill.name,
      aliases: skill.aliases,
      officialNumber: skill.officialNumber,
      provenance: "FIG",
    })));
  } else {
    const fallback = await prisma.figElementDefinition.findMany({
      where: {
        apparatus: normalizedApparatus,
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        package: { program: { code: "FIG_WAG" } },
        canonicalSkills: { none: { discipline: "WAG", status: "ACTIVE" } },
        OR: [
          { name: { contains: term } },
          { aliases: { contains: term } },
          { officialNumber: { contains: term } },
        ],
      },
      select: { id: true, name: true, aliases: true, officialNumber: true },
      orderBy: [{ name: "asc" }, { variantKey: "asc" }],
      take: remaining,
    });
    results.push(...fallback.map((skill) => ({
      id: `element:${skill.id}`,
      name: skill.name,
      aliases: skill.aliases,
      officialNumber: skill.officialNumber,
      provenance: "FIG",
    })));
  }

  return results;
}
