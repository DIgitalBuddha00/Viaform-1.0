INSERT INTO "FigApparatusRule" (
  "id",
  "packageId",
  "apparatus",
  "levelCode",
  "ruleType",
  "ruleKey",
  "valueJson",
  "sourcePage",
  "verificationStatus"
)
SELECT
  'fig25_jr_code_application',
  'canonical_fig_wag_2025_2028',
  'ALL',
  'JUNIOR',
  'APPLICATION',
  'code_application',
  '{"baseCodeApplies":true,"modificationsAppendixPages":[182,183],"compositionRequirementsFromApparatusSections":true,"connectionValueFromApparatusSections":true,"connectionValueUsesJuniorDifficultyRestriction":true,"dismountBonusAwarded":false}',
  182,
  'VERIFIED'
WHERE EXISTS (
  SELECT 1
  FROM "RulesetPackage"
  WHERE "id" = 'canonical_fig_wag_2025_2028'
)
AND NOT EXISTS (
  SELECT 1
  FROM "FigApparatusRule"
  WHERE "packageId" = 'canonical_fig_wag_2025_2028'
    AND "apparatus" = 'ALL'
    AND "levelCode" = 'JUNIOR'
    AND "ruleKey" = 'code_application'
);
