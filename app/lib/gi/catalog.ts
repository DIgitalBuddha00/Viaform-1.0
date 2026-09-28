export const GI_WAG = {
  code: "GI_WAG",
  name: "Gymnastics Ireland Women's Artistic Gymnastics",
  governingBody: "Gymnastics Ireland",
  discipline: "WAG",
  sourceUrl: "https://www.gymnasticsireland.com/disciplines/womens-artistic/competition",
} as const;

export const GI_WAG_LEVELS = [
  { code: "INTRO", name: "Introductory Floor & Vault", family: "GENERAL", orderIndex: 5 },
  ...Array.from({ length: 10 }, (_, index) => ({
    code: `GENERAL_${index + 1}`,
    name: `General Level ${index + 1}`,
    family: "GENERAL" as const,
    orderIndex: (index + 1) * 10,
  })),
  ...Array.from({ length: 7 }, (_, index) => ({
    code: `PLUS_${index + 1}`,
    name: `Plus Level ${index + 1}`,
    family: "PLUS" as const,
    orderIndex: 100 + (index + 1) * 10,
  })),
] as const;

export const GI_WAG_PACKAGES = {
  general: {
    id: "canonical_gi_wag_general_2025_plus_v4_2026_01",
    code: "GI-WAG-GENERAL-2025-PLUS-V4-2026-01",
    name: "GI WAG General National Development Pathway",
    cycleLabel: "2025+",
    versionLabel: "V4 · January 2026",
    sourceDocument: "Women's Artistic General National Development Pathway & Guidelines 2025+",
  },
  plus: {
    id: "canonical_gi_wag_plus_2025_plus_v4_2026_02",
    code: "GI-WAG-PLUS-2025-PLUS-V4-2026-02",
    name: "GI WAG Plus National Development Pathway",
    cycleLabel: "2025+",
    versionLabel: "V4 · February 2026",
    sourceDocument: "Women's Artistic Plus Levels National Development Pathway & Guidelines 2025+",
  },
} as const;

export const GI_WAG_VERIFIED_CONTENT = {
  vault: {
    generalLevelContexts: 11,
    generalTeamContexts: 2,
    plusLevelContexts: 7,
    plusTeamContexts: 3,
    totalContexts: 23,
    generalSourcePages: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    plusSourcePages: [20, 21, 22, 23, 24, 25, 26, 29, 30, 31],
  },
  unevenBars: {
    generalLevelContexts: 10,
    generalTeamContexts: 2,
    plusLevelContexts: 7,
    plusTeamContexts: 3,
    totalContexts: 22,
    generalSourcePages: [21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    plusSourcePages: [20, 21, 22, 23, 24, 25, 26, 29, 30, 31],
  },
  balanceBeam: {
    generalLevelContexts: 10,
    generalTeamContexts: 2,
    plusLevelContexts: 7,
    plusTeamContexts: 3,
    totalContexts: 22,
    generalSourcePages: [20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    plusSourcePages: [16, 17, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31],
  },,
  floorExercise: {
    generalLevelContexts: 11,
    generalTeamContexts: 2,
    plusLevelContexts: 7,
    plusTeamContexts: 3,
    totalContexts: 23,
    generalSourcePages: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    plusSourcePages: [16, 17, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31],
  },
} as const;
