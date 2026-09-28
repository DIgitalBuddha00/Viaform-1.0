SELECT "packageId","apparatus","ruleKey",COUNT(*) AS "count",SUM(CASE WHEN json_valid("valueJson")=0 THEN 1 ELSE 0 END) AS "invalidJsonCount"
FROM "FigApparatusRule"
WHERE "id" LIKE 'gi25_%' AND ("ruleKey" IN ('age_basis','competition_age_groups','team_composition_and_scoring','all_around_composition','routine_lengths','physical_preparation_routine'))
GROUP BY "packageId","apparatus","ruleKey" ORDER BY "packageId","apparatus","ruleKey";
