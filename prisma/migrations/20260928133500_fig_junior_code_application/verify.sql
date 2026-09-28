SELECT
  "id",
  "apparatus",
  "levelCode",
  "ruleType",
  "ruleKey",
  "valueJson",
  "sourcePage",
  "verificationStatus"
FROM "FigApparatusRule"
WHERE "packageId" = 'canonical_fig_wag_2025_2028'
  AND "apparatus" = 'ALL'
  AND "levelCode" = 'JUNIOR'
  AND "ruleKey" = 'code_application';
