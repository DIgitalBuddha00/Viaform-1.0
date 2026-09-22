UPDATE "FigApparatusRule"
SET "valueJson"='{"requiredForApparatusFinalQualification":true,"vaults":2,"differentGroupsRequired":true,"score":"AVERAGE"}', "sourcePage"=40
WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='VAULT' AND "levelCode"='SENIOR' AND "ruleKey"='apparatus_qualification_second_vault';

UPDATE "FigApparatusRule"
SET "valueJson"='{"required":true,"vaults":2,"score":"AVERAGE"}', "sourcePage"=40
WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='VAULT' AND "levelCode"='SENIOR' AND "ruleKey"='apparatus_final_different_groups';

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_vt_senior_direction_bonus','canonical_fig_wag_2025_2028','VAULT','SENIOR','BONUS','different_second_flight_direction_bonus','{"value":0.2,"directions":["FORWARD","BACKWARD"],"bothWithoutFall":true,"cuervoDirection":"FORWARD"}',41,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='VAULT' AND "levelCode"='SENIOR' AND "ruleKey"='different_second_flight_direction_bonus');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_senior_short','canonical_fig_wag_2025_2028','ALL','SENIOR','SCORING','short_exercise','{"7+":0,"5-6":4.0,"3-4":6.0,"1-2":8.0,"0":10.0}',21,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='SENIOR' AND "ruleKey"='short_exercise');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_senior_dmt_bonus','canonical_fig_wag_2025_2028','ALL','SENIOR','BONUS','dismount_bonus','{"value":0.2,"minimumDifficulty":"D","withoutFall":true,"floorRequiresLastAcroLineWithoutFall":true,"apparatus":["BARS","BEAM","FLOOR"]}',26,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='SENIOR' AND "ruleKey"='dismount_bonus');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_all_cv_recognition','canonical_fig_wag_2025_2028','ALL','ALL','CONNECTION','connection_value_recognition','{"values":[0.1,0.2],"elementsNeedNotCountInEight":true,"tableElementsRequired":true,"devaluedElementsAllowed":true,"withoutFall":true,"directRequired":true,"floorAcroMayBeIndirect":true}',25,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='ALL' AND "ruleKey"='connection_value_recognition');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_all_cv_repeat','canonical_fig_wag_2025_2028','ALL','ALL','CONNECTION','connection_repetition','{"reuseAcrossConnections":false,"order":"CHRONOLOGICAL","sameElementTwiceWithinOneConnection":{"bars":true,"beamAcro":true,"floorAcro":true,"dance":false}}',26,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='ALL' AND "ruleKey"='connection_repetition');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_ub_cr','canonical_fig_wag_2025_2028','BARS','SENIOR','COMPOSITION','composition_requirements','{"total":2.0,"each":0.5,"requirements":["FLIGHT_HIGH_TO_LOW","FLIGHT_SAME_BAR","DIFFERENT_GRIPS_EXCLUDING_CAST_MOUNT_DISMOUNT","NON_FLIGHT_TURN_MIN_360_EXCLUDING_MOUNT"]}',44,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BARS' AND "levelCode"='SENIOR' AND "ruleKey"='composition_requirements');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_ub_cv','canonical_fig_wag_2025_2028','BARS','SENIOR','CONNECTION','connection_value','{"direct":true,"0.1":["D+D_OR_MORE"],"0.2":["D_FLIGHT_SAME_BAR_OR_LOW_TO_HIGH_PLUS_C_OR_MORE_ON_HIGH_IN_ORDER","E+E_ONE_FLIGHT","F+D_BOTH_FLIGHT"],"cOrDRequiresFlightOrTurnMin180":true}',44,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BARS' AND "levelCode"='SENIOR' AND "ruleKey"='connection_value');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_bb_cr','canonical_fig_wag_2025_2028','BEAM','SENIOR','COMPOSITION','composition_requirements','{"total":2.0,"each":0.5,"requirements":["TWO_DIFFERENT_DANCE_ONE_LEAP_OR_JUMP_180_SPLIT_OR_STRADDLE","GROUP_3_TURN_OR_LISTED_ROLL_FLAIR","ACRO_SERIES_TWO_FLIGHT_ONE_SALTO","ACRO_DIFFERENT_DIRECTIONS_FORWARD_OR_SIDEWARD_AND_BACKWARD"]}',49,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BEAM' AND "levelCode"='SENIOR' AND "ruleKey"='composition_requirements');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_bb_cv','canonical_fig_wag_2025_2028','BEAM','SENIOR','CONNECTION','connection_value','{"direct":true,"noCreditWithBeamGrasp":true,"acro":{"0.1":["C+C","B+D_TRAVELLING_BACKWARD_IN_ORDER","B+E"],"0.2":["C_OR_D_PLUS_D_OR_MORE","B+D_BOTH_FORWARD","B+F"]},"danceMixed":{"0.1":["C+C_OR_MORE_DANCE","A+C_TURNS_ONLY","B+D_MIXED"],"0.2":["D+D_OR_MORE"]}}',50,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BEAM' AND "levelCode"='SENIOR' AND "ruleKey"='connection_value');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_bb_series_bonus','canonical_fig_wag_2025_2028','BEAM','SENIOR','BONUS','series_bonus','{"value":0.1,"minimumElements":3,"minimumSeries":"B+B+C","anyOrder":true,"mountAllowed":true,"dismountMinimum":"C","inAdditionToConnectionValue":true}',50,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BEAM' AND "levelCode"='SENIOR' AND "ruleKey"='series_bonus');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_ub_prohibited','canonical_fig_wag_2025_2028','BARS','JUNIOR','PROHIBITION','prohibited_elements','{"saltoOrDismountTakeoffTwoFeet":true}',183,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BARS' AND "levelCode"='JUNIOR' AND "ruleKey"='prohibited_elements');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_bb_prohibited','canonical_fig_wag_2025_2028','BEAM','JUNIOR','PROHIBITION','prohibited_elements','{"danceCrossSitLanding":true}',183,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='BEAM' AND "levelCode"='JUNIOR' AND "ruleKey"='prohibited_elements');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_fx_prohibited','canonical_fig_wag_2025_2028','FLOOR','JUNIOR','PROHIBITION','prohibited_elements','{"acroSidewardTakeoffOrLandingIntoRoll":true}',183,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='JUNIOR' AND "ruleKey"='prohibited_elements');
