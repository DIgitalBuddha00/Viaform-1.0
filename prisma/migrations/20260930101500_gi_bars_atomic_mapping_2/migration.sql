-- GI WAG Bars atomic skill mapping, batch 2.
-- Source: General V4 Jan 2026 and Plus V4 Feb 2026.
-- Repetitions/order/connection remain RulesetRoutineRequirement metadata.

-- Developmental GI skills with no exact FIG-coded identity in the current Viaform catalogue.
INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","canonicalKey","status","createdAt","updatedAt") VALUES
('gi_skill_bars_cast','WAG','BARS','Cast','["cast","bar cast"]','GYMNASTICS_IRELAND','GI:WAG:BARS:CAST','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_backward_hip_circle','WAG','BARS','Backward Hip Circle','["back hip circle","backward hip circle"]','GYMNASTICS_IRELAND','GI:WAG:BARS:BACKWARD_HIP_CIRCLE','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_glide_swing','WAG','BARS','Glide Swing','["glide","glide swing"]','GYMNASTICS_IRELAND','GI:WAG:BARS:GLIDE_SWING','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_pike_on','WAG','BARS','Pike On','["pike on","pike-on"]','GYMNASTICS_IRELAND','GI:WAG:BARS:PIKE_ON','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_straddle_on','WAG','BARS','Straddle On','["straddle on","straddle-on"]','GYMNASTICS_IRELAND','GI:WAG:BARS:STRADDLE_ON','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_long_upstart','WAG','BARS','Long Upstart','["long upstart","long kip","long hang kip"]','GYMNASTICS_IRELAND','GI:WAG:BARS:LONG_UPSTART','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Map GI "Upstart" terminology to the existing FIG Glide Kip identity rather than duplicating it.
UPDATE "ViaformSkill"
SET "aliases"='["kip","glide kip","low bar kip","upstart"]',"updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='FIG:ELEMENT:BARS:1.101:a';

-- General 5: three plain swings, wrap on third, immediate underswing.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_g5_bars_swing','canonical_gi_wag_general_5','BARS','gi_skill_bars_swing',50,3,NULL,'canonical_gi_wag_general_2025_plus_v4_2026_01',27,'Three individual plain swing occurrences.'),
('gi_req_g5_bars_wrap3','canonical_gi_wag_general_5','BARS','gi_skill_bars_wrap_over',60,1,'ON_REPETITION_3_OF_PREVIOUS','canonical_gi_wag_general_2025_plus_v4_2026_01',27,NULL),
('gi_req_g5_bars_under','canonical_gi_wag_general_5','BARS','gi_skill_bars_underswing',70,1,'IMMEDIATE_AFTER_PREVIOUS','canonical_gi_wag_general_2025_plus_v4_2026_01',27,NULL);

-- Plus 3: three plain swings, wrap on third, then immediate underswing and swing back.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_p3_bars_swing','canonical_gi_wag_plus_3','BARS','gi_skill_bars_swing',40,3,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',22,'Three individual plain swing occurrences.'),
('gi_req_p3_bars_wrap3','canonical_gi_wag_plus_3','BARS','gi_skill_bars_wrap_over',50,1,'ON_REPETITION_3_OF_PREVIOUS','canonical_gi_wag_plus_2025_plus_v4_2026_02',22,NULL),
('gi_req_p3_bars_under','canonical_gi_wag_plus_3','BARS','gi_skill_bars_underswing',60,1,'IMMEDIATE_AFTER_PREVIOUS','canonical_gi_wag_plus_2025_plus_v4_2026_02',22,NULL),
('gi_req_p3_bars_back','canonical_gi_wag_plus_3','BARS','gi_skill_bars_swing',70,1,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',22,'Swing back is its own occurrence.');

-- Plus 4: four plain swings; wrap over on fourth; immediate underswing; swing back.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_p4_bars_swing','canonical_gi_wag_plus_4','BARS','gi_skill_bars_swing',60,4,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',23,'Four individual plain swing occurrences.'),
('gi_req_p4_bars_wrap4','canonical_gi_wag_plus_4','BARS','gi_skill_bars_wrap_over',70,1,'ON_REPETITION_4_OF_PREVIOUS','canonical_gi_wag_plus_2025_plus_v4_2026_02',23,NULL),
('gi_req_p4_bars_under','canonical_gi_wag_plus_4','BARS','gi_skill_bars_underswing',80,1,'IMMEDIATE_AFTER_PREVIOUS','canonical_gi_wag_plus_2025_plus_v4_2026_02',23,NULL),
('gi_req_p4_bars_back','canonical_gi_wag_plus_4','BARS','gi_skill_bars_swing',90,1,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',23,NULL);

-- Plus 4–5 Teams explicitly specifies four TAP swings, not four plain swings.
-- Team-only competition contexts are retained in source rules; these rows intentionally do not invent assignable RulesetLevel records.

-- FIG overlaps used by GI: attach the existing stable FIG identities to the assignable level.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") SELECT
'gi_map_p5_giant','canonical_gi_wag_plus_5',"id",'REQUIRED','GI Giant Circle maps to the existing FIG Back Giant identity.',CURRENT_TIMESTAMP
FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") SELECT
'gi_map_p6_giant','canonical_gi_wag_plus_6',"id",'REQUIRED','Two occurrences are required by the GI source; repetition count remains in the source routine rule.',CURRENT_TIMESTAMP
FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") SELECT
'gi_map_p7_giant','canonical_gi_wag_plus_7',"id",'REQUIRED','Two occurrences are required by the GI source; repetition count remains in the source routine rule.',CURRENT_TIMESTAMP
FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:a';

-- Common GI developmental skill availability by level (identity only; exact order/count remains in routine requirements/rules).
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_map_g2_cast','canonical_gi_wag_general_2','gi_skill_bars_cast','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_g3_cast','canonical_gi_wag_general_3','gi_skill_bars_cast','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_g3_bhc','canonical_gi_wag_general_3','gi_skill_bars_backward_hip_circle','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_g4_glide','canonical_gi_wag_general_4','gi_skill_bars_glide_swing','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_g4_bhc','canonical_gi_wag_general_4','gi_skill_bars_backward_hip_circle','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_g5_glide','canonical_gi_wag_general_5','gi_skill_bars_glide_swing','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_g5_bhc','canonical_gi_wag_general_5','gi_skill_bars_backward_hip_circle','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_g6_tap','canonical_gi_wag_general_6','gi_skill_bars_tap_swing','REQUIRED','Three occurrences; represented atomically.',CURRENT_TIMESTAMP),
('gi_map_g7_tap','canonical_gi_wag_general_7','gi_skill_bars_tap_swing','REQUIRED','Three occurrences; represented atomically.',CURRENT_TIMESTAMP),
('gi_map_g8_tap','canonical_gi_wag_general_8','gi_skill_bars_tap_swing','REQUIRED','Three occurrences; represented atomically.',CURRENT_TIMESTAMP),
('gi_map_p3_swing','canonical_gi_wag_plus_3','gi_skill_bars_swing','REQUIRED','Repeated plain swings represented atomically.',CURRENT_TIMESTAMP),
('gi_map_p4_swing','canonical_gi_wag_plus_4','gi_skill_bars_swing','REQUIRED','Four repeated plain swings represented atomically.',CURRENT_TIMESTAMP),
('gi_map_p5_longup','canonical_gi_wag_plus_5','gi_skill_bars_long_upstart','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_p6_longup','canonical_gi_wag_plus_6','gi_skill_bars_long_upstart','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP),
('gi_map_p7_longup','canonical_gi_wag_plus_7','gi_skill_bars_long_upstart','REQUIRED','GI prescribed Bars routine.',CURRENT_TIMESTAMP);
