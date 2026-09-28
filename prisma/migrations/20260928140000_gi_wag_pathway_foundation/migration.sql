-- Canonical Gymnastics Ireland WAG pathway identity and current 2026 source packages.
-- These are governing-body records, not club-created programme or demo data.

INSERT INTO "RulesetProgram" (
  "id","code","name","governingBody","discipline","status","sourceUrl","createdAt","updatedAt"
)
SELECT
  'canonical_gi_wag',
  'GI_WAG',
  'Gymnastics Ireland Women''s Artistic Gymnastics',
  'Gymnastics Ireland',
  'WAG',
  'ACTIVE',
  'https://www.gymnasticsireland.com/disciplines/womens-artistic/competition',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "RulesetProgram" WHERE "code" = 'GI_WAG'
);

WITH "levels" ("id","code","name","orderIndex","notes") AS (
  VALUES
    ('canonical_gi_wag_intro','INTRO','Introductory Floor & Vault',5,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_1','GENERAL_1','General Level 1',10,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_2','GENERAL_2','General Level 2',20,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_3','GENERAL_3','General Level 3',30,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_4','GENERAL_4','General Level 4',40,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_5','GENERAL_5','General Level 5',50,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_6','GENERAL_6','General Level 6',60,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_7','GENERAL_7','General Level 7',70,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_8','GENERAL_8','General Level 8',80,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_9','GENERAL_9','General Level 9',90,'GI WAG General pathway.'),
    ('canonical_gi_wag_general_10','GENERAL_10','General Level 10',100,'GI WAG General pathway.'),
    ('canonical_gi_wag_plus_1','PLUS_1','Plus Level 1',110,'GI WAG Plus pathway.'),
    ('canonical_gi_wag_plus_2','PLUS_2','Plus Level 2',120,'GI WAG Plus pathway.'),
    ('canonical_gi_wag_plus_3','PLUS_3','Plus Level 3',130,'GI WAG Plus pathway.'),
    ('canonical_gi_wag_plus_4','PLUS_4','Plus Level 4',140,'GI WAG Plus pathway.'),
    ('canonical_gi_wag_plus_5','PLUS_5','Plus Level 5',150,'GI WAG Plus pathway.'),
    ('canonical_gi_wag_plus_6','PLUS_6','Plus Level 6',160,'GI WAG Plus pathway.'),
    ('canonical_gi_wag_plus_7','PLUS_7','Plus Level 7',170,'GI WAG Plus pathway.')
)
INSERT INTO "RulesetLevel" (
  "id","programId","code","name","orderIndex","status","notes","createdAt","updatedAt"
)
SELECT
  "levels"."id",
  'canonical_gi_wag',
  "levels"."code",
  "levels"."name",
  "levels"."orderIndex",
  'ACTIVE',
  "levels"."notes",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "levels"
WHERE EXISTS (
  SELECT 1 FROM "RulesetProgram" WHERE "id" = 'canonical_gi_wag' AND "code" = 'GI_WAG'
)
AND NOT EXISTS (
  SELECT 1
  FROM "RulesetLevel" existing
  WHERE existing."programId" = 'canonical_gi_wag'
    AND existing."code" = "levels"."code"
);

INSERT INTO "RulesetPackage" (
  "id","programId","code","name","cycleLabel","versionLabel","effectiveDate",
  "sourceDocument","sourceUrl","sourcePublishedAt","status","createdAt","updatedAt"
)
SELECT
  'canonical_gi_wag_general_2025_plus_v4_2026_01',
  'canonical_gi_wag',
  'GI-WAG-GENERAL-2025-PLUS-V4-2026-01',
  'GI WAG General National Development Pathway',
  '2025+',
  'V4 · January 2026',
  '2025-01-01',
  'Women''s Artistic General National Development Pathway & Guidelines 2025+',
  'https://www.gymnasticsireland.com/disciplines/womens-artistic/competition',
  NULL,
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "RulesetProgram" WHERE "id" = 'canonical_gi_wag')
AND NOT EXISTS (
  SELECT 1 FROM "RulesetPackage" WHERE "code" = 'GI-WAG-GENERAL-2025-PLUS-V4-2026-01'
);

INSERT INTO "RulesetPackage" (
  "id","programId","code","name","cycleLabel","versionLabel","effectiveDate",
  "sourceDocument","sourceUrl","sourcePublishedAt","status","createdAt","updatedAt"
)
SELECT
  'canonical_gi_wag_plus_2025_plus_v4_2026_02',
  'canonical_gi_wag',
  'GI-WAG-PLUS-2025-PLUS-V4-2026-02',
  'GI WAG Plus National Development Pathway',
  '2025+',
  'V4 · February 2026',
  '2025-01-01',
  'Women''s Artistic Plus Levels National Development Pathway & Guidelines 2025+',
  'https://www.gymnasticsireland.com/disciplines/womens-artistic/competition',
  NULL,
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "RulesetProgram" WHERE "id" = 'canonical_gi_wag')
AND NOT EXISTS (
  SELECT 1 FROM "RulesetPackage" WHERE "code" = 'GI-WAG-PLUS-2025-PLUS-V4-2026-02'
);

WITH "rules" ("id","packageId","ruleType","ruleKey","valueJson","sourcePage") AS (
  VALUES
    ('gi25_general_scope','canonical_gi_wag_general_2025_plus_v4_2026_01','ELIGIBILITY','pathway_scope','{"openToAnyGymnast":true,"nationalSquadOrGiFigTrialRequires":"PLUS_OR_FIG","changedCircumstancesMaySwitchTo":"GENERAL_10","coachDecisionRequired":true}',6),
    ('gi25_general_progression','canonical_gi_wag_general_2025_plus_v4_2026_01','PROGRESSION','general_progression','{"safeCompletionRequired":true,"shouldNotMoveBack":true,"recommendedPromotionScorePercent":75,"introRequiresNoPreviousCompetition":true,"introMoveUpFollowingYear":true,"nationalAllAroundMedallistsLevels":[1,2,3,4,5,6,7,8,9],"nationalAllAroundMedallistsShouldMoveUpFollowingYear":true,"autumnOpenExcluded":true,"level10MayRemain":true,"coachDecisionRequired":true}',7),
    ('gi25_general_to_plus','canonical_gi_wag_general_2025_plus_v4_2026_01','CROSSOVER','general_to_plus','{"maximumLevelsLower":3,"examples":{"GENERAL_5":"PLUS_2","GENERAL_7":"PLUS_4"},"general10Minimum":"PLUS_6"}',7),
    ('gi25_general_plus_to_general','canonical_gi_wag_general_2025_plus_v4_2026_01','CROSSOVER','plus_to_general','{"PLUS_1":"GENERAL_3","PLUS_2":"GENERAL_4","PLUS_3":"GENERAL_5","PLUS_4":"GENERAL_7","PLUS_5":"GENERAL_8","PLUS_6":"GENERAL_9","PLUS_7":"GENERAL_10"}',7),
    ('gi25_general_autumn','canonical_gi_wag_general_2025_plus_v4_2026_01','PROGRESSION','autumn_team_higher_level','{"higherLevelApparatusAllowed":{"minimum":1,"maximum":3},"mayReturnToAllAroundLevelFollowingYear":true,"allFourAtHigherLevelRequiresAtLeastThatLevelFollowingYear":true}',7),
    ('gi25_general_fig_history','canonical_gi_wag_general_2025_plus_v4_2026_01','CROSSOVER','fig_history_boundaries','{"figAllFourScoreBelow40MaySwitchTo":"GENERAL_10","figAllFourScore40OrHigherShouldStayFig":true,"generalException":"GENERAL_10","general9MayCompeteFigNationalTeamMaximumApparatus":3}',7),
    ('gi25_general_start_value','canonical_gi_wag_general_2025_plus_v4_2026_01','SCORING','start_value_framework','{"executionStart":10.0,"barsBeamFloorStartValueSpecifiedByLevel":true,"vaultStartValue":"LEVEL_OR_FIG","bonusAddsToDifficulty":true,"bonusWithFall":false,"beamBonusWithBeamGrasp":false,"missingRequirementsSubtractFromStartValue":true}',17),
    ('gi25_general_fig_execution','canonical_gi_wag_general_2025_plus_v4_2026_01','DEDUCTION','fig_execution_application','{"figGeneralExecutionAllLevels":true,"levelsOnlyDeductionsAlsoApply":true}',6),
    ('gi25_general_fig_composition','canonical_gi_wag_general_2025_plus_v4_2026_01','DEDUCTION','fig_artistry_composition_application','{"allBeamLevels":true,"floorFrom":"GENERAL_3","figSpecificApparatusDeductions":true}',17),
    ('gi25_general_specific_requirements','canonical_gi_wag_general_2025_plus_v4_2026_01','RECOGNITION','specific_requirements','{"requirementsDefinedPerLevelAndRoutine":true,"upgradesPermitted":false}',18),
    ('gi25_general_additional','canonical_gi_wag_general_2025_plus_v4_2026_01','DEDUCTION','levels_additional_deductions','{"exceptLevels":["GENERAL_10"],"deviationFromTextNeutral":0.3,"vaultHipAngleFirstFlight":[0.1,0.3,0.5],"barsSwingBelowHorizontal":[0.1,0.3],"barsBodyAlignment":[0.1,0.3],"beamFloorAcroAmplitude":[0.1,0.3],"beamFloorBridgeShoulderExtension":[0.1,0.3,0.5],"beamFloorBodyAlignment":[0.1,0.3],"beamFloorStopBetweenConnections":0.5,"beamFloorHoldTime":0.3}',19),
    ('gi25_general_invalid_vault','canonical_gi_wag_general_2025_plus_v4_2026_01','VAULT','invalid_vault_treatment','{"GENERAL_1_TO_5":{"baseScore":5.0},"GENERAL_6_TO_10":{"figRules":true},"PLUS_ALL":{"figRules":true}}',19),
    ('gi25_plus_scope','canonical_gi_wag_plus_2025_plus_v4_2026_02','ELIGIBILITY','pathway_scope','{"openToAnyGymnast":true,"nationalSquadOrGiFigTrialRequires":"PLUS_OR_FIG","coachDecisionRequired":true}',10),
    ('gi25_plus_progression','canonical_gi_wag_plus_2025_plus_v4_2026_02','PROGRESSION','plus_progression','{"safeCompletionRequired":true,"shouldNotMoveBack":true,"recommendedMoveUpMinimumAverageEachApparatus":10.0,"coachDecisionRequired":true}',10),
    ('gi25_plus_general_to_plus','canonical_gi_wag_plus_2025_plus_v4_2026_02','CROSSOVER','general_to_plus','{"maximumLevelsLower":3,"examples":{"GENERAL_5":"PLUS_2","GENERAL_7":"PLUS_4"},"general10Minimum":"PLUS_6"}',10),
    ('gi25_plus_to_general','canonical_gi_wag_plus_2025_plus_v4_2026_02','CROSSOVER','plus_to_general','{"PLUS_1":"GENERAL_3","PLUS_2":"GENERAL_4","PLUS_3":"GENERAL_5","PLUS_4":"GENERAL_7","PLUS_5":"GENERAL_8","PLUS_6":"GENERAL_9","PLUS_7":"GENERAL_10"}',10),
    ('gi25_plus_fig_history','canonical_gi_wag_plus_2025_plus_v4_2026_02','CROSSOVER','fig_history_boundaries','{"figCompetitionMaximumThreeApparatusMinimum":"PLUS_5","figCompetitionAllFourApparatusMinimum":"PLUS_6","figAllAroundMedallistOnly":"PLUS_7"}',10),
    ('gi25_plus_start_value','canonical_gi_wag_plus_2025_plus_v4_2026_02','SCORING','start_value_framework','{"executionStart":10.0,"barsBeamFloorStartValueSpecifiedByLevel":true,"vaultStartValue":"LEVEL_OR_FIG","bonusAddsToDifficulty":true,"bonusWithFall":false,"beamBonusWithBeamGrasp":false,"missingRequirementsSubtractFromStartValue":true}',7),
    ('gi25_plus_fig_composition','canonical_gi_wag_plus_2025_plus_v4_2026_02','DEDUCTION','fig_artistry_composition_application','{"allBeamLevels":true,"floorFrom":"PLUS_2","figSpecificApparatusDeductions":true,"levelsOnlyDeductionsAlsoApply":true}',7),
    ('gi25_plus_fig_faults','canonical_gi_wag_plus_2025_plus_v4_2026_02','DEDUCTION','fig_faults_application','{"figGeneralFaultsAndPenalties":true,"figSpecificApparatusDeductions":true,"invalidVaultsUseFigRules":true}',8),
    ('gi25_plus_additional','canonical_gi_wag_plus_2025_plus_v4_2026_02','DEDUCTION','levels_additional_deductions','{"deviationFromTextNeutral":0.3,"vaultHipAngleFirstFlight":[0.1,0.3,0.5],"barsSwingBelowHorizontal":[0.1,0.3],"barsBodyAlignment":[0.1,0.3],"beamFloorAcroAmplitude":[0.1,0.3],"beamFloorBridgeShoulderExtension":[0.1,0.3,0.5],"beamFloorBodyAlignment":[0.1,0.3],"beamFloorStopBetweenConnections":0.5,"beamFloorHoldTime":0.3}',9)
)
INSERT INTO "FigApparatusRule" (
  "id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus"
)
SELECT
  "rules"."id",
  "rules"."packageId",
  'ALL',
  'ALL',
  "rules"."ruleType",
  "rules"."ruleKey",
  "rules"."valueJson",
  "rules"."sourcePage",
  'VERIFIED'
FROM "rules"
WHERE EXISTS (
  SELECT 1 FROM "RulesetPackage" package WHERE package."id" = "rules"."packageId"
)
AND NOT EXISTS (
  SELECT 1
  FROM "FigApparatusRule" existing
  WHERE existing."packageId" = "rules"."packageId"
    AND existing."apparatus" = 'ALL'
    AND existing."levelCode" = 'ALL'
    AND existing."ruleKey" = "rules"."ruleKey"
);
