-- GI WAG Floor stable-skill mapping + Beam coach-name correction.
-- Source authority: General V4 Jan 2026 / Plus V4 Feb 2026.

-- Coach-facing terminology correction requested during Beam QA.
UPDATE "ViaformSkill"
SET "name"='Pivot Turn',
    "aliases"='["pivot turn","half turn","half turn on two feet","half turn on two feet in releve"]',
    "updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='GI:WAG:BEAM:HALF_TURN_TWO_FEET';

-- GI developmental Floor identities not represented as exact FIG-coded skills.
INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","canonicalKey","status","createdAt","updatedAt") VALUES
('gi_skill_floor_stretch_jump','WAG','FLOOR','Stretch Jump','["stretch jump","straight jump"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:STRETCH_JUMP','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_jump_half_turn','WAG','FLOOR','Jump 1/2 Turn','["jump half turn","half turn jump"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:JUMP_HALF_TURN','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_jump_full_turn','WAG','FLOOR','Jump Full Turn','["jump full turn","full turn jump"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:JUMP_FULL_TURN','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_backward_roll','WAG','FLOOR','Backward Roll','["backward roll","back roll"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:BACKWARD_ROLL','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_backward_roll_front_support','WAG','FLOOR','Backward Roll to Front Support','["backward roll to front support","back roll straight arms and legs to front support"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:BACKWARD_ROLL_FRONT_SUPPORT','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_backward_roll_handstand','WAG','FLOOR','Backward Roll to Handstand','["backward roll to handstand","back roll to handstand"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:BACKWARD_ROLL_HANDSTAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_chasse','WAG','FLOOR','Chassé','["chasse","chassé"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:CHASSE','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_splits','WAG','FLOOR','Splits','["splits","right splits","left splits"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:SPLITS','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Reuse FIG Floor identities for coded acro/dance.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_'||lower(replace(l."code",'_',''))||'_splitleap',l."id",s."id",'REQUIRED','GI Split Leap reuses FIG Floor identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:FLOOR:1.101:a'
WHERE l."id" IN ('canonical_gi_wag_general_3','canonical_gi_wag_general_4','canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_plus_1','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_'||lower(replace(l."code",'_',''))||'_switchleap',l."id",s."id",'REQUIRED','GI Switch Leap reuses FIG Floor identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:FLOOR:1.205:a'
WHERE l."id" IN ('canonical_gi_wag_general_9','canonical_gi_wag_plus_4','canonical_gi_wag_plus_5','canonical_gi_wag_plus_6');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_'||lower(replace(l."code",'_',''))||'_roundoff',l."id",s."id",'REQUIRED','GI Round-off reuses FIG Floor identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:FLOOR:3.106:a'
WHERE l."id" IN ('canonical_gi_wag_general_3','canonical_gi_wag_general_4','canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_general_7','canonical_gi_wag_plus_1','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4','canonical_gi_wag_plus_5','canonical_gi_wag_plus_6','canonical_gi_wag_plus_7');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_'||lower(replace(l."code",'_',''))||'_flic',l."id",s."id",'REQUIRED','GI Flic/Back Flic reuses FIG Floor Back Handspring identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:FLOOR:3.107:a'
WHERE l."id" IN ('canonical_gi_wag_general_4','canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_general_7','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4','canonical_gi_wag_plus_5','canonical_gi_wag_plus_6','canonical_gi_wag_plus_7');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_'||lower(replace(l."code",'_',''))||'_fhs',l."id",s."id",'REQUIRED','GI Handspring reuses FIG Floor Front Handspring identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:FLOOR:3.105:a'
WHERE l."id" IN ('canonical_gi_wag_general_6','canonical_gi_wag_general_7','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4');

-- Developmental identities used in prescribed routines. Counts/connections stay in rule JSON.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_floor_g1_jhalf','canonical_gi_wag_general_1','gi_skill_floor_jump_half_turn','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_g2_backrollsupport','canonical_gi_wag_general_2','gi_skill_floor_backward_roll_front_support','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_g3_jfull','canonical_gi_wag_general_3','gi_skill_floor_jump_full_turn','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_g4_jfull','canonical_gi_wag_general_4','gi_skill_floor_jump_full_turn','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_g5_jfull','canonical_gi_wag_general_5','gi_skill_floor_jump_full_turn','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_g6_backrollhs','canonical_gi_wag_general_6','gi_skill_floor_backward_roll_handstand','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_g7_backrollhs','canonical_gi_wag_general_7','gi_skill_floor_backward_roll_handstand','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_p1_chasse','canonical_gi_wag_plus_1','gi_skill_floor_chasse','REQUIRED','Atomic part of the prescribed dance sequence.',CURRENT_TIMESTAMP),
('gi_floor_p2_chasse','canonical_gi_wag_plus_2','gi_skill_floor_chasse','REQUIRED','Atomic part of Split Leap → Chassé → Split Leap.',CURRENT_TIMESTAMP),
('gi_floor_p3_chasse','canonical_gi_wag_plus_3','gi_skill_floor_chasse','REQUIRED','Atomic part of Split Leap → Chassé → Split Leap.',CURRENT_TIMESTAMP),
('gi_floor_p2_backrollsupport','canonical_gi_wag_plus_2','gi_skill_floor_backward_roll_front_support','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_p3_backrollsupport','canonical_gi_wag_plus_3','gi_skill_floor_backward_roll_front_support','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_p4_backrollhs','canonical_gi_wag_plus_4','gi_skill_floor_backward_roll_handstand','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_floor_p5_backrollhs','canonical_gi_wag_plus_5','gi_skill_floor_backward_roll_handstand','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP);

-- Explicit repeated sequence: Plus 2/3 Split Leap → Chassé → Split Leap.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_p2_floor_split1','canonical_gi_wag_plus_2','FLOOR','fig_element_fig25_fx_1_101_a',30,1,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',21,'First Split Leap occurrence.'),
('gi_req_p2_floor_chasse','canonical_gi_wag_plus_2','FLOOR','gi_skill_floor_chasse',31,1,'CONNECTED_SEQUENCE','canonical_gi_wag_plus_2025_plus_v4_2026_02',21,NULL),
('gi_req_p2_floor_split2','canonical_gi_wag_plus_2','FLOOR','fig_element_fig25_fx_1_101_a',32,1,'CONNECTED_SEQUENCE','canonical_gi_wag_plus_2025_plus_v4_2026_02',21,'Second Split Leap occurrence; same stable skill identity.'),
('gi_req_p3_floor_split1','canonical_gi_wag_plus_3','FLOOR','fig_element_fig25_fx_1_101_a',30,1,NULL,'canonical_gi_wag_plus_2025_plus_v4_2026_02',22,'First Split Leap occurrence.'),
('gi_req_p3_floor_chasse','canonical_gi_wag_plus_3','FLOOR','gi_skill_floor_chasse',31,1,'CONNECTED_SEQUENCE','canonical_gi_wag_plus_2025_plus_v4_2026_02',22,NULL),
('gi_req_p3_floor_split2','canonical_gi_wag_plus_3','FLOOR','fig_element_fig25_fx_1_101_a',32,1,'CONNECTED_SEQUENCE','canonical_gi_wag_plus_2025_plus_v4_2026_02',22,'Second Split Leap occurrence; same stable skill identity.');

-- Explicit repeated flic sequences: repetitions remain separate occurrences of one FIG Back Handspring identity.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes")
SELECT 'gi_req_p3_floor_flics','canonical_gi_wag_plus_3','FLOOR',"id",80,2,'AFTER_ROUND_OFF','canonical_gi_wag_plus_2025_plus_v4_2026_02',22,'Two flic occurrences; routine editor should expand to two rows.'
FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.107:a';
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes")
SELECT 'gi_req_p5_floor_flics','canonical_gi_wag_plus_5','FLOOR',"id",70,3,'AFTER_ROUND_OFF','canonical_gi_wag_plus_2025_plus_v4_2026_02',24,'Three flic occurrences; routine editor should expand to three rows.'
FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.107:a';
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes")
SELECT 'gi_req_p6_floor_flics','canonical_gi_wag_plus_6','FLOOR',"id",50,3,'AFTER_ROUND_OFF','canonical_gi_wag_plus_2025_plus_v4_2026_02',25,'Three flic occurrences; routine editor should expand to three rows.'
FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.107:a';
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes")
SELECT 'gi_req_p7_floor_flics','canonical_gi_wag_plus_7','FLOOR',"id",50,3,'AFTER_ROUND_OFF','canonical_gi_wag_plus_2025_plus_v4_2026_02',26,'Three flic occurrences; routine editor should expand to three rows.'
FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.107:a';
