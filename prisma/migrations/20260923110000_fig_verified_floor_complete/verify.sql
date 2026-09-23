WITH expected(groupCode, populatedEntries, registryRows) AS (
  VALUES ('1',42,61),('2',18,19),('3',11,13),('4',16,17),('5',18,19)
), actual AS (
  SELECT "groupCode", COUNT(DISTINCT "officialNumber") AS populatedEntries, COUNT(*) AS registryRows
  FROM "FigElementDefinition"
  WHERE "packageId"='canonical_fig_wag_2025_2028'
    AND "apparatus"='FLOOR'
    AND "verificationStatus"='VERIFIED'
    AND "status"='ACTIVE'
  GROUP BY "groupCode"
)
SELECT expected.groupCode,
       expected.populatedEntries,
       actual.populatedEntries AS actualPopulatedEntries,
       expected.registryRows,
       actual.registryRows AS actualRegistryRows,
       CASE WHEN expected.populatedEntries=actual.populatedEntries
                  AND expected.registryRows=actual.registryRows
            THEN 'PASS' ELSE 'FAIL' END AS verification
FROM expected
LEFT JOIN actual USING (groupCode)
ORDER BY CAST(expected.groupCode AS INTEGER);

