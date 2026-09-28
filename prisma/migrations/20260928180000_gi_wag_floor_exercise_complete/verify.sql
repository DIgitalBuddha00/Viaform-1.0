SELECT "packageId", COUNT(*) AS "verifiedFloorContextCount",
  SUM(CASE WHEN json_valid("valueJson") = 0 THEN 1 ELSE 0 END) AS "invalidJsonCount"
FROM "FigApparatusRule"
WHERE "packageId" IN ('canonical_gi_wag_general_2025_plus_v4_2026_01','canonical_gi_wag_plus_2025_plus_v4_2026_02')
  AND "apparatus" = 'FLOOR_EXERCISE' AND "ruleKey" = 'floor_routine' AND "verificationStatus" = 'VERIFIED'
GROUP BY "packageId" ORDER BY "packageId";

SELECT "levelCode","sourcePage","valueJson"
FROM "FigApparatusRule"
WHERE "packageId" IN ('canonical_gi_wag_general_2025_plus_v4_2026_01','canonical_gi_wag_plus_2025_plus_v4_2026_02')
  AND "apparatus" = 'FLOOR_EXERCISE' AND "ruleKey" = 'floor_routine'
ORDER BY "packageId","sourcePage","levelCode";
