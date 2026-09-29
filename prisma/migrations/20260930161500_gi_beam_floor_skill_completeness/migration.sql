-- GI WAG Beam/Floor performed-skill completeness pass.
-- Sources: General V4 Jan 2026; Plus V4 Feb 2026.
-- Reuse stable FIG identities where exact. Do not expand open-ended FIG requirements.

-- Beam: source-confirmed exact FIG identities missing from earlier mapping.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_g4_handstand','canonical_gi_wag_general_4',"id",'REQUIRED','GI handstand requirement reuses FIG Beam Handstand Hold identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:4.103:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_p1_handstand','canonical_gi_wag_plus_1',"id",'OPTION','Bonus handstand recognition reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:4.103:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_p4_handstand','canonical_gi_wag_plus_4',"id",'OPTION','Connection bonus option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:4.103:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_p5_handstand','canonical_gi_wag_plus_5',"id",'OPTION','Connection requirement option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:4.103:a';

INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_g6_roundoff','canonical_gi_wag_general_6',"id",'OPTION','Dismount option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:5.108:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_p3_roundoff','canonical_gi_wag_plus_3',"id",'OPTION','Dismount option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:5.108:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_p4_roundoff','canonical_gi_wag_plus_4',"id",'OPTION','Dismount option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:5.108:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_p5_roundoff','canonical_gi_wag_plus_5',"id",'OPTION','Dismount/forward-sideward acro option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:5.108:a';

INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_g5_pikejump','canonical_gi_wag_general_5',"id",'OPTION','Pike jump option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:2.107:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_g5_wolfjump','canonical_gi_wag_general_5',"id",'OPTION','Wolf jump option.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:2.112:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_beam_p7_switch','canonical_gi_wag_plus_7',"id",'OPTION','Switch Leap may form part of dance series.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:BEAM:2.205:a';

-- Floor: additional developmental performed actions not represented by an exact FIG skill.
INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","canonicalKey","status","createdAt","updatedAt") VALUES
('gi_skill_floor_forward_roll','WAG','FLOOR','Forward Roll','["forward roll","forward roll to stand"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:FORWARD_ROLL','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_cartwheel','WAG','FLOOR','Cartwheel','["cartwheel","one handed cartwheel","one-handed cartwheel"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:CARTWHEEL','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_handstand','WAG','FLOOR','Handstand','["handstand","handstand hold"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:HANDSTAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_handstand_forward_roll','WAG','FLOOR','Handstand Forward Roll','["handstand forward roll","handstand to forward roll"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:HANDSTAND_FORWARD_ROLL','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_backward_walkover','WAG','FLOOR','Backward Walkover','["backward walkover","back walkover","bwo"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:BACKWARD_WALKOVER','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_floor_forward_walkover','WAG','FLOOR','Forward Walkover','["forward walkover","front walkover","fwo"]','GYMNASTICS_IRELAND','GI:WAG:FLOOR:FORWARD_WALKOVER','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_floor_intro_fwdroll','canonical_gi_wag_intro','gi_skill_floor_forward_roll','REQUIRED','Set routine.',CURRENT_TIMESTAMP),
('gi_floor_g2_fwdroll','canonical_gi_wag_general_2','gi_skill_floor_forward_roll','REQUIRED','Forward roll to straddle stand.',CURRENT_TIMESTAMP),
('gi_floor_intro_cartwheel','canonical_gi_wag_intro','gi_skill_floor_cartwheel','REQUIRED','Repeated cartwheel sequence.',CURRENT_TIMESTAMP),
('gi_floor_g1_cartwheel','canonical_gi_wag_general_1','gi_skill_floor_cartwheel','REQUIRED','Repeated cartwheel sequence.',CURRENT_TIMESTAMP),
('gi_floor_g2_cartwheel','canonical_gi_wag_general_2','gi_skill_floor_cartwheel','REQUIRED','One-handed cartwheel uses same developmental cartwheel identity with routine context.',CURRENT_TIMESTAMP),
('gi_floor_intro_handstand','canonical_gi_wag_intro','gi_skill_floor_handstand','REQUIRED','Handstand into forward roll.',CURRENT_TIMESTAMP),
('gi_floor_g1_handstand','canonical_gi_wag_general_1','gi_skill_floor_handstand','REQUIRED','Handstand requirement.',CURRENT_TIMESTAMP),
('gi_floor_g2_handstand','canonical_gi_wag_general_2','gi_skill_floor_handstand','REQUIRED','Handstand hold requirement.',CURRENT_TIMESTAMP),
('gi_floor_p1_handstand','canonical_gi_wag_plus_1','gi_skill_floor_handstand','REQUIRED','Handstand requirement.',CURRENT_TIMESTAMP),
('gi_floor_intro_hsroll','canonical_gi_wag_intro','gi_skill_floor_handstand_forward_roll','REQUIRED','Atomic performed action in set routine.',CURRENT_TIMESTAMP),
('gi_floor_g3_hsroll','canonical_gi_wag_general_3','gi_skill_floor_handstand_forward_roll','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_floor_g4_hsroll','canonical_gi_wag_general_4','gi_skill_floor_handstand_forward_roll','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_floor_g3_bwo','canonical_gi_wag_general_3','gi_skill_floor_backward_walkover','OPTION','Bridge kick-over or backward walkover.',CURRENT_TIMESTAMP),
('gi_floor_g4_bwo','canonical_gi_wag_general_4','gi_skill_floor_backward_walkover','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_floor_p2_bwo','canonical_gi_wag_plus_2','gi_skill_floor_backward_walkover','REQUIRED','Prescribed.',CURRENT_TIMESTAMP),
('gi_floor_g5_fwo','canonical_gi_wag_general_5','gi_skill_floor_forward_walkover','OPTION','Tick-tock or forward walkover.',CURRENT_TIMESTAMP);

-- Floor exact FIG overlaps that were source-confirmed but absent from level mapping.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g5_frontsalto','canonical_gi_wag_general_5',"id",'REQUIRED','GI Front Salto reuses FIG forward tucked/piked salto identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g6_frontsalto','canonical_gi_wag_general_6',"id",'REQUIRED','GI Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g7_frontsalto','canonical_gi_wag_general_7',"id",'REQUIRED','GI Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g8_frontsalto','canonical_gi_wag_general_8',"id",'REQUIRED','GI Tuck Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g9_frontsalto','canonical_gi_wag_general_9',"id",'REQUIRED','GI Tucked Forward Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_p3_frontsalto','canonical_gi_wag_plus_3',"id",'REQUIRED','GI Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_p4_frontsalto','canonical_gi_wag_plus_4',"id",'REQUIRED','GI Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_p5_frontsalto','canonical_gi_wag_plus_5',"id",'REQUIRED','GI Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_p6_frontsalto','canonical_gi_wag_plus_6',"id",'REQUIRED','GI Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_p7_frontsalto','canonical_gi_wag_plus_7',"id",'REQUIRED','GI Front Salto reuses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:4.101:a';

INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g7_backsalto','canonical_gi_wag_general_7',"id",'REQUIRED','Tuck Back Salto uses FIG backward salto identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:5.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g8_backsalto','canonical_gi_wag_general_8',"id",'REQUIRED','Tuck Back Salto uses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:5.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_g9_backsalto','canonical_gi_wag_general_9',"id",'REQUIRED','Tucked Backward Salto uses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:5.101:a';
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt")
SELECT 'gi_floor_p4_backsalto','canonical_gi_wag_plus_4',"id",'REQUIRED','Back Salto uses FIG identity.',CURRENT_TIMESTAMP FROM "ViaformSkill" WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:5.101:a';

-- Repeated cartwheels remain repeated occurrences of one stable developmental identity.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_intro_floor_cartwheel','canonical_gi_wag_intro','FLOOR','gi_skill_floor_cartwheel',80,2,'CONTINUOUS_WITH_SKIP','canonical_gi_wag_general_2025_plus_v4_2026_01',22,'Two cartwheel occurrences.'),
('gi_req_g1_floor_cartwheel','canonical_gi_wag_general_1','FLOOR','gi_skill_floor_cartwheel',90,2,'WITH_SKIP','canonical_gi_wag_general_2025_plus_v4_2026_01',23,'Two cartwheel occurrences.');
