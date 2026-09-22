WITH expected(groupCode, populatedEntries, registryRows) AS (
  VALUES ('1',27,48),('2',24,29),('3',28,36),('4',30,33),('5',30,38),('6',24,30)
), actual AS (
  SELECT "groupCode", COUNT(DISTINCT "officialNumber") AS populatedEntries, COUNT(*) AS registryRows
  FROM "FigElementDefinition"
  WHERE "packageId"='canonical_fig_wag_2025_2028'
    AND "apparatus"='BARS'
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
