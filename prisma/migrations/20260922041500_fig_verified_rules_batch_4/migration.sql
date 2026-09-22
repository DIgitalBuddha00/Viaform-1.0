INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_all_cr_fulfilment','canonical_fig_wag_2025_2028','ALL','ALL','COMPOSITION','composition_requirement_fulfilment','{"tableElementsOnly":true,"oneElementMayFulfilMultiple":true,"repeatedElementCannotFulfilAnother":true,"maximum":2.0}',24,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='ALL' AND "ruleKey"='composition_requirement_fulfilment');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_all_direct_connection','canonical_fig_wag_2025_2028','ALL','ALL','CONNECTION','direct_connection_breaks','{"breaks":["STOP","EXTRA_STEP","FOOT_TOUCH_BEAM","LACK_OF_BALANCE","OBVIOUS_LEG_OR_HIP_EXTENSION_BEFORE_TAKEOFF","ADDITIONAL_OR_EXCESSIVE_ARM_SWING"],"indirectAllowedOnlyForFloorAcro":true,"recognitionBenefitOfGymnast":true}',25,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='ALL' AND "ruleKey"='direct_connection_breaks');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_ub_connection_interruptions','canonical_fig_wag_2025_2028','BARS','ALL','CONNECTION','connection_interruptions','{"emptySwingBlocksConnectionValue":true,"intermediateSwingBlocksConnectionValue":true,"emptySwingDefinition":"SWING_WITHOUT_TABLE_ELEMENT_BEFORE_REVERSING_DIRECTION","intermediateSwingDefinition":"PUMP_OR_UNNEEDED_LONG_SWING"}',45,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BARS' AND "levelCode"='ALL' AND "ruleKey"='connection_interruptions');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_ub_flight_recognition','canonical_fig_wag_2025_2028','BARS','ALL','RECOGNITION','flight_element_after_fall','{"graspBothHands":{"difficultyAwarded":true},"withoutBothHands":{"difficultyAwarded":false,"mayRepeatForDifficulty":true}}',46,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BARS' AND "levelCode"='ALL' AND "ruleKey"='flight_element_after_fall');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_ub_no_dmt','canonical_fig_wag_2025_2028','BARS','ALL','DISMOUNT','no_dismount_recognition','{"noAttempt":{"difficultyAwarded":false,"maximumCountingElements":7,"fallDeduction":true,"remountForDismountRemovesNoDismountDeduction":true},"saltoInitiatedNoFeetFirst":{"difficultyAwarded":false,"maximumCountingElements":7,"fallDeduction":true}}',46,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BARS' AND "levelCode"='ALL' AND "ruleKey"='no_dismount_recognition');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_bb_timing','canonical_fig_wag_2025_2028','BEAM','ALL','TIMING','exercise_and_fall_timing','{"exerciseSeconds":90,"overtimeFromSeconds":91,"elementsAfterLimitRecognised":true,"fallSeconds":10,"terminationSeconds":60}',48,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BEAM' AND "levelCode"='ALL' AND "ruleKey"='exercise_and_fall_timing');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_bb_landing_recognition','canonical_fig_wag_2025_2028','BEAM','ALL','RECOGNITION','element_landing_after_fall','{"returnWithFootOrTorsoRequired":true,"landOneOrTwoFeetOrPrescribedPosition":{"difficultyAwarded":true},"otherwise":{"difficultyAwarded":false,"mayRepeatForDifficulty":true}}',51,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BEAM' AND "levelCode"='ALL' AND "ruleKey"='element_landing_after_fall');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_bb_no_dmt','canonical_fig_wag_2025_2028','BEAM','ALL','DISMOUNT','no_dismount_recognition','{"saltoNotInitiated":{"difficultyAwarded":false,"maximumCountingElements":7,"fallDeduction":true,"remountForDismountRemovesNoDismountDeduction":true},"saltoInitiatedNoFeetFirst":{"difficultyAwarded":false,"maximumCountingElements":7,"fallDeduction":true}}',51,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BEAM' AND "levelCode"='ALL' AND "ruleKey"='no_dismount_recognition');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_timing','canonical_fig_wag_2025_2028','FLOOR','ALL','TIMING','exercise_timing','{"exerciseSeconds":90,"overtimeFromSeconds":91,"startsFirstMovement":true,"stopsLastPosition":true,"mustEndWithMusic":true,"elementsAfterLimitRecognised":true}',54,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='ALL' AND "ruleKey"='exercise_timing');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_dmt_construction','canonical_fig_wag_2025_2028','FLOOR','SENIOR','DISMOUNT','dismount_construction','{"definition":"LAST_COUNTING_ACRO_LINE","creditHighestDifficulty":true,"minimumAcroLinesForCredit":2,"noDifficultyAfterLastCountingAcroLine":true}',55,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='SENIOR' AND "ruleKey"='dismount_construction');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_dance_passage','canonical_fig_wag_2025_2028','FLOOR','SENIOR','COMPOSITION','dance_passage_construction','{"differentLeapsOrHops":2,"oneRequiresSplitOrStraddleDegrees":180,"directOrIndirect":true,"allowedLinks":["RUNNING_STEPS","SMALL_LEAPS","HOPS","CHASSE","CHAINE_TURNS"],"jumpsAllowed":false,"turnsAllowed":false,"chaineException":true,"firstLeapOrHopLandsOneLeg":true}',55,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='SENIOR' AND "ruleKey"='dance_passage_construction');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_cv','canonical_fig_wag_2025_2028','FLOOR','SENIOR','CONNECTION','connection_value','{"indirectAcro":{"0.1":["B+D","A+A+D"],"0.2":["C+D_OR_E","A+A+E"]},"directAcro":{"0.1":["A+D","C+C"],"0.2":["A+E","B_OR_C_PLUS_D"]},"mixed":{"0.1":["D_SALTO_PLUS_B_DANCE","E_SALTO_PLUS_A_DANCE"],"orderRequired":true},"turnsOneLeg":{"0.1":["D+B"],"stepToOppositeLegRequired":true,"demiPlieNotPermitted":true},"acroForConnectionValueWithoutHandSupport":true}',56,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='SENIOR' AND "ruleKey"='connection_value');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_dmt_bonus','canonical_fig_wag_2025_2028','FLOOR','SENIOR','BONUS','dismount_bonus','{"value":0.2,"minimumDifficulty":"D","moreThanTwoAcroLines":true,"lastAcroLineWithoutFall":true}',55,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='SENIOR' AND "ruleKey"='dismount_bonus');
