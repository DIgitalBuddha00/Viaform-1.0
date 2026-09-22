INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_all_dv_values','canonical_fig_wag_2025_2028','ALL','ALL','DIFFICULTY','difficulty_values','{"A":0.1,"B":0.2,"C":0.3,"D":0.4,"E":0.5,"F":0.6,"G":0.7,"H":0.8,"I":0.9,"J":1.0}',22,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='ALL' AND "ruleKey"='difficulty_values');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_all_repeat_dv','canonical_fig_wag_2025_2028','ALL','ALL','RECOGNITION','same_element_dv_once','{"once":true,"order":"CHRONOLOGICAL"}',22,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='ALL' AND "ruleKey"='same_element_dv_once');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_all_dance_box','canonical_fig_wag_2025_2028','ALL','ALL','RECOGNITION','same_number_dance_dv_once','{"once":true,"order":"CHRONOLOGICAL"}',22,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='ALL' AND "ruleKey"='same_number_dance_dv_once');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_counting_dv','canonical_fig_wag_2025_2028','FLOOR','SENIOR','DIFFICULTY','counting_difficulty','{"maximum":8,"includesDismount":true,"minimumDance":3,"minimumAcro":3,"optional":2}',55,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='SENIOR' AND "ruleKey"='counting_difficulty');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_acro_lines','canonical_fig_wag_2025_2028','FLOOR','SENIOR','CONSTRUCTION','acro_lines','{"maximum":4,"minimumFlightElements":2,"requiresSalto":true}',55,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='SENIOR' AND "ruleKey"='acro_lines');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_fx_cr','canonical_fig_wag_2025_2028','FLOOR','SENIOR','COMPOSITION','composition_requirements','{"total":2.0,"each":0.5,"requirements":["DANCE_PASSAGE_WITH_180_SPLIT_OR_STRADDLE","SALTO_WITH_LA_TURN_MIN_360","SALTO_WITH_DOUBLE_BA","BACKWARD_AND_FORWARD_SALTO"]}',55,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "levelCode"='SENIOR' AND "ruleKey"='composition_requirements');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_dv_cap','canonical_fig_wag_2025_2028','ALL','JUNIOR','DIFFICULTY','difficulty_cap','{"from":"F","through":"J","maximumValue":0.5}',182,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='JUNIOR' AND "ruleKey"='difficulty_cap');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_short','canonical_fig_wag_2025_2028','ALL','JUNIOR','SCORING','short_exercise','{"6+":0,"5":4.0,"3-4":6.0,"1-2":8.0,"0":10.0}',182,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='JUNIOR' AND "ruleKey"='short_exercise');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_no_dmt_bonus','canonical_fig_wag_2025_2028','ALL','JUNIOR','BONUS','dismount_bonus','{"awarded":false}',183,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='ALL' AND "levelCode"='JUNIOR' AND "ruleKey"='dismount_bonus');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_vt_pair','canonical_fig_wag_2025_2028','VAULT','JUNIOR','FORMAT','apparatus_vault_pair','{"qualificationForFinal":2,"apparatusFinal":2,"differentVaults":true,"differentGroupsRequired":false,"differentNumbersRequired":true,"score":"AVERAGE","directionBonus":false}',183,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='VAULT' AND "levelCode"='JUNIOR' AND "ruleKey"='apparatus_vault_pair');

INSERT INTO "FigApparatusRule" ("id","packageId","apparatus","levelCode","ruleType","ruleKey","valueJson","sourcePage","verificationStatus")
SELECT 'fig25_jr_vt_prohibited','canonical_fig_wag_2025_2028','VAULT','JUNIOR','PROHIBITION','prohibited_vaults','{"sidewardTakeoffOrLanding":true,"doubleSaltos":true}',183,'VERIFIED'
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028') AND NOT EXISTS (SELECT 1 FROM "FigApparatusRule" WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='VAULT' AND "levelCode"='JUNIOR' AND "ruleKey"='prohibited_vaults');
