SELECT "id","code","name","governingBody","discipline","status"
FROM "RulesetProgram"
WHERE "id" = 'canonical_gi_wag' AND "code" = 'GI_WAG';

SELECT COUNT(*) AS "activeLevelCount"
FROM "RulesetLevel"
WHERE "programId" = 'canonical_gi_wag' AND "status" = 'ACTIVE';

SELECT "id","code","versionLabel","sourceDocument","status"
FROM "RulesetPackage"
WHERE "programId" = 'canonical_gi_wag'
ORDER BY "code";

SELECT "packageId",COUNT(*) AS "verifiedRuleCount"
FROM "FigApparatusRule"
WHERE "packageId" IN (
  'canonical_gi_wag_general_2025_plus_v4_2026_01',
  'canonical_gi_wag_plus_2025_plus_v4_2026_02'
)
  AND "verificationStatus" = 'VERIFIED'
GROUP BY "packageId"
ORDER BY "packageId";
