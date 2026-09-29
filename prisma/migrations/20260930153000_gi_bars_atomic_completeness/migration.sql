-- GI WAG Bars atomic completeness pass.
-- Source: General V4 Jan 2026; Plus V4 Feb 2026.
-- Shapes/holds and open FIG choices remain rules, not skill identities.

INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","canonicalKey","status","createdAt","updatedAt") VALUES
('gi_skill_bars_upward_hip_circle','WAG','BARS','Upward Hip Circle','["upward hip circle","pullover","pull over"]','GYMNASTICS_IRELAND','GI:WAG:BARS:UPWARD_HIP_CIRCLE','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_undershoot','WAG','BARS','Undershoot','["undershoot","undershoot dismount"]','GYMNASTICS_IRELAND','GI:WAG:BARS:UNDERSHOOT','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_trolley_swing','WAG','BARS','Trolley Swing','["trolley swing"]','GYMNASTICS_IRELAND','GI:WAG:BARS:TROLLEY_SWING','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_chin_up','WAG','BARS','Chin-up','["chin up","chin-up"]','GYMNASTICS_IRELAND','GI:WAG:BARS:CHIN_UP','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_pike_leg_lift','WAG','BARS','Pike Leg Lift','["pike leg lift","leg lift to bar"]','GYMNASTICS_IRELAND','GI:WAG:BARS:PIKE_LEG_LIFT','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_sole_circle','WAG','BARS','Sole Circle','["sole circle","toe circle"]','GYMNASTICS_IRELAND','GI:WAG:BARS:SOLE_CIRCLE','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_map_g1_uhc','canonical_gi_wag_general_1','gi_skill_bars_upward_hip_circle','OPTION','Bonus alternative.',CURRENT_TIMESTAMP),
('gi_map_g2_uhc','canonical_gi_wag_general_2','gi_skill_bars_upward_hip_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g3_uhc','canonical_gi_wag_general_3','gi_skill_bars_upward_hip_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g4_uhc','canonical_gi_wag_general_4','gi_skill_bars_upward_hip_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g5_uhc','canonical_gi_wag_general_5','gi_skill_bars_upward_hip_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g6_uhc','canonical_gi_wag_general_6','gi_skill_bars_upward_hip_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_p1_uhc','canonical_gi_wag_plus_1','gi_skill_bars_upward_hip_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_p2_uhc','canonical_gi_wag_plus_2','gi_skill_bars_upward_hip_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g3_us','canonical_gi_wag_general_3','gi_skill_bars_undershoot','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g4_us','canonical_gi_wag_general_4','gi_skill_bars_undershoot','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g5_us','canonical_gi_wag_general_5','gi_skill_bars_undershoot','REQUIRED','Dismount.',CURRENT_TIMESTAMP),
('gi_map_p2_us','canonical_gi_wag_plus_2','gi_skill_bars_undershoot','REQUIRED','Dismount.',CURRENT_TIMESTAMP),
('gi_map_p3_trolley','canonical_gi_wag_plus_3','gi_skill_bars_trolley_swing','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_p7_trolley','canonical_gi_wag_plus_7','gi_skill_bars_trolley_swing','OPTION','Optional entry.',CURRENT_TIMESTAMP),
('gi_map_p3_chin','canonical_gi_wag_plus_3','gi_skill_bars_chin_up','REQUIRED','Two repetitions.',CURRENT_TIMESTAMP),
('gi_map_p3_leglift','canonical_gi_wag_plus_3','gi_skill_bars_pike_leg_lift','REQUIRED','Two repetitions.',CURRENT_TIMESTAMP),
('gi_map_p6_sole','canonical_gi_wag_plus_6','gi_skill_bars_sole_circle','REQUIRED','Prescribed.',CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_map_g1_cast','canonical_gi_wag_general_1','gi_skill_bars_cast','REQUIRED','Two connected casts.',CURRENT_TIMESTAMP),
('gi_map_g4_cast','canonical_gi_wag_general_4','gi_skill_bars_cast','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g5_cast','canonical_gi_wag_general_5','gi_skill_bars_cast','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g6_cast','canonical_gi_wag_general_6','gi_skill_bars_cast','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g7_cast','canonical_gi_wag_general_7','gi_skill_bars_cast','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_g8_cast','canonical_gi_wag_general_8','gi_skill_bars_cast','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_map_p1_cast','canonical_gi_wag_plus_1','gi_skill_bars_cast','REQUIRED','Three connected casts.',CURRENT_TIMESTAMP),
('gi_map_p2_cast','canonical_gi_wag_plus_2','gi_skill_bars_cast','REQUIRED','Three casts.',CURRENT_TIMESTAMP),
('gi_map_p4_cast','canonical_gi_wag_plus_4','gi_skill_bars_cast','REQUIRED','Two casts.',CURRENT_TIMESTAMP),
('gi_map_g4_pikeon','canonical_gi_wag_general_4','gi_skill_bars_pike_on','OPTION','Pike-on option.',CURRENT_TIMESTAMP),
('gi_map_g4_straddleon','canonical_gi_wag_general_4','gi_skill_bars_straddle_on','OPTION','Straddle-on option.',CURRENT_TIMESTAMP),
('gi_map_g5_pikeon','canonical_gi_wag_general_5','gi_skill_bars_pike_on','OPTION','Pike-on option.',CURRENT_TIMESTAMP),
('gi_map_g5_straddleon','canonical_gi_wag_general_5','gi_skill_bars_straddle_on','OPTION','Straddle-on option.',CURRENT_TIMESTAMP),
('gi_map_g6_pikeon','canonical_gi_wag_general_6','gi_skill_bars_pike_on','OPTION','Pike-on option.',CURRENT_TIMESTAMP),
('gi_map_g6_straddleon','canonical_gi_wag_general_6','gi_skill_bars_straddle_on','OPTION','Straddle-on option.',CURRENT_TIMESTAMP),
('gi_map_g7_pikeon','canonical_gi_wag_general_7','gi_skill_bars_pike_on','OPTION','Pike-on option.',CURRENT_TIMESTAMP),
('gi_map_g7_straddleon','canonical_gi_wag_general_7','gi_skill_bars_straddle_on','OPTION','Straddle-on option.',CURRENT_TIMESTAMP),
('gi_map_g8_pikeon','canonical_gi_wag_general_8','gi_skill_bars_pike_on','OPTION','Pike-on option.',CURRENT_TIMESTAMP),
('gi_map_g8_straddleon','canonical_gi_wag_general_8','gi_skill_bars_straddle_on','OPTION','Straddle-on option.',CURRENT_TIMESTAMP),
('gi_map_p4_pikeon','canonical_gi_wag_plus_4','gi_skill_bars_pike_on','REQUIRED','Pike-on to high bar.',CURRENT_TIMESTAMP),
('gi_map_p5_pikeon','canonical_gi_wag_plus_5','gi_skill_bars_pike_on','REQUIRED','Prescribed.',CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_g1_cast','canonical_gi_wag_general_1','BARS','gi_skill_bars_cast',20,2,'CONNECTED','canonical_gi_wag_general_2025_plus_v4_2026_01',23,'Two atomic casts.'),
('gi_req_g2_cast','canonical_gi_wag_general_2','BARS','gi_skill_bars_cast',20,3,'CONNECTED','canonical_gi_wag_general_2025_plus_v4_2026_01',24,'Three atomic casts.'),
('gi_req_p1_glide','canonical_gi_wag_plus_1','BARS','gi_skill_bars_glide_swing',10,3,'CONNECTED','canonical_gi_wag_plus_2025_plus_v4_2026_02',20,'Three atomic glide swings.'),
('gi_req_p1_cast','canonical_gi_wag_plus_1','BARS','gi_skill_bars_cast',30,3,'CONNECTED','canonical_gi_wag_plus_2025_plus_v4_2026_02',20,'Three atomic casts.'),
('gi_req_p2_glide','canonical_gi_wag_plus_2','BARS','gi_skill_bars_glide_swing',10,3,'CONNECTED','canonical_gi_wag_plus_2025_plus_v4_2026_02',21,'Three atomic glide swings.'),
('gi_req_p2_cast','canonical_gi_wag_plus_2','BARS','gi_skill_bars_cast',30,3,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',21,'Three atomic casts.'),
('gi_req_p3_chin','canonical_gi_wag_plus_3','BARS','gi_skill_bars_chin_up',10,2,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',22,'Two atomic chin-ups.'),
('gi_req_p3_leglift','canonical_gi_wag_plus_3','BARS','gi_skill_bars_pike_leg_lift',20,2,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',22,'Two atomic pike leg lifts.');

INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_map_g6_flyaway','canonical_gi_wag_general_6',"id",'OPTION','FIG Flyaway identity reused.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:6.104:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_map_p4_flyaway','canonical_gi_wag_plus_4',"id",'OPTION','FIG Flyaway identity reused.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:6.104:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_map_p7_blind','canonical_gi_wag_plus_7',"id",'REQUIRED','Blind Change reuses FIG Giant half-turn identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:b';

INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes")
SELECT 'gi_req_p6_giants','canonical_gi_wag_plus_6','BARS',"id",50,2,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',25,'Two atomic Back Giants.' FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:a';
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes")
SELECT 'gi_req_p7_giants','canonical_gi_wag_plus_7','BARS',"id",40,2,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',26,'Two atomic Back Giants.' FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:a';
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes")
SELECT 'gi_req_p7_blinds','canonical_gi_wag_plus_7','BARS',"id",30,2,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',26,'Two atomic Blind Changes.' FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:b';
