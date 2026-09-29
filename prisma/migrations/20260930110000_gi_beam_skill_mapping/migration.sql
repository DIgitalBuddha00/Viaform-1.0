-- GI WAG Beam stable-skill mapping, current General V4 Jan 2026 / Plus V4 Feb 2026.
-- FIG-coded movements reuse existing ViaformSkill identities. Requirements/choices/connections remain in GI rule JSON.

-- Developmental Beam identities that are not exact FIG-coded elements.
INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","canonicalKey","status","createdAt","updatedAt") VALUES
('gi_skill_beam_stretch_jump','WAG','BEAM','Stretch Jump','["stretch jump","straight jump"]','GYMNASTICS_IRELAND','GI:WAG:BEAM:STRETCH_JUMP','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_beam_tuck_jump','WAG','BEAM','Tuck Jump','["tuck jump"]','GYMNASTICS_IRELAND','GI:WAG:BEAM:TUCK_JUMP','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_beam_half_turn_two_feet','WAG','BEAM','Half Turn on Two Feet','["half turn","half turn on two feet"]','GYMNASTICS_IRELAND','GI:WAG:BEAM:HALF_TURN_TWO_FEET','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_beam_arabesque','WAG','BEAM','Arabesque','["arabesque","arabesque hold"]','GYMNASTICS_IRELAND','GI:WAG:BEAM:ARABESQUE','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_beam_split_leg_handstand','WAG','BEAM','Split-leg Handstand','["split handstand","split-leg handstand"]','GYMNASTICS_IRELAND','GI:WAG:BEAM:SPLIT_LEG_HANDSTAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Reuse stable FIG identities across GI levels.
-- Full turn
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_fullturn',l."id",s."id",'REQUIRED','GI requirement maps to existing FIG Beam Full Turn.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:3.101:a'
WHERE l."id" IN ('canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4');

-- Split leap / split jump / Sissone alternatives: map each permitted stable skill rather than inventing a compound "split leap or jump" skill.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_splitleap',l."id",s."id",'OPTION','Permitted GI dance requirement option.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:2.101:a'
WHERE l."id" IN ('canonical_gi_wag_general_4','canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_splitjump',l."id",s."id",'OPTION','Permitted GI dance requirement option.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:2.202:a'
WHERE l."id" IN ('canonical_gi_wag_general_2','canonical_gi_wag_general_3','canonical_gi_wag_general_4','canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_plus_1','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_sissone',l."id",s."id",'OPTION','Permitted GI dance requirement option.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:2.108:a'
WHERE l."id" IN ('canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3');

-- Acrobatic FIG overlaps.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_cartwheel',l."id",s."id",'OPTION','GI Beam Cartwheel reuses FIG identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:4.107:a'
WHERE l."id" IN ('canonical_gi_wag_general_4','canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_plus_1','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_frontwalk',l."id",s."id",'OPTION','GI Beam Front Walkover reuses FIG identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:4.108:a'
WHERE l."id" IN ('canonical_gi_wag_general_6','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_backwalk',l."id",s."id",'OPTION','GI Beam Back Walkover reuses FIG identity.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:4.109:a'
WHERE l."id" IN ('canonical_gi_wag_general_5','canonical_gi_wag_general_6','canonical_gi_wag_plus_2','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4','canonical_gi_wag_plus_5');
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_'||lower(replace(l."code",'_',''))||'_bhs',l."id",s."id",'OPTION','GI flic/back flic maps to FIG Beam Back Handspring.',CURRENT_TIMESTAMP
FROM "RulesetLevel" l JOIN "ViaformSkill" s ON s."canonicalKey"='FIG:ELEMENT:BEAM:5.102:a'
WHERE l."id" IN ('canonical_gi_wag_general_6','canonical_gi_wag_plus_3','canonical_gi_wag_plus_4','canonical_gi_wag_plus_5');

-- Developmental skills are linked only where explicitly present.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_beam_g1_stretch','canonical_gi_wag_general_1','gi_skill_beam_stretch_jump','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_beam_g1_tuck','canonical_gi_wag_general_1','gi_skill_beam_tuck_jump','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_beam_g1_arab','canonical_gi_wag_general_1','gi_skill_beam_arabesque','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_beam_g2_split_hs','canonical_gi_wag_general_2','gi_skill_beam_split_leg_handstand','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_beam_g3_split_hs','canonical_gi_wag_general_3','gi_skill_beam_split_leg_handstand','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_beam_p1_split_hs','canonical_gi_wag_plus_1','gi_skill_beam_split_leg_handstand','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP);
