-- GI WAG stable-skill completeness audit: Beam + Floor developmental mappings.
-- Source authority: General V4 Jan 2026 and Plus V4 Feb 2026.
-- This migration links existing stable identities only where the source explicitly prescribes them.
-- Open-ended "any FIG" requirements remain in FigApparatusRule and are intentionally not expanded to every FIG skill.

-- BEAM: developmental skills that existed but were under-mapped.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_beam_g1_pivot','canonical_gi_wag_general_1','gi_skill_beam_half_turn_two_feet','REQUIRED','Two half turns on two feet are prescribed.',CURRENT_TIMESTAMP),
('gi_beam_g2_pivot','canonical_gi_wag_general_2','gi_skill_beam_half_turn_two_feet','REQUIRED','Two half turns on two feet are prescribed.',CURRENT_TIMESTAMP),
('gi_beam_g3_pivot','canonical_gi_wag_general_3','gi_skill_beam_half_turn_two_feet','REQUIRED','Half turn on two feet follows the spin preparation.',CURRENT_TIMESTAMP),
('gi_beam_g4_pivot','canonical_gi_wag_general_4','gi_skill_beam_half_turn_two_feet','REQUIRED','Half turn is prescribed after the half spin.',CURRENT_TIMESTAMP),
('gi_beam_p1_pivot','canonical_gi_wag_plus_1','gi_skill_beam_half_turn_two_feet','REQUIRED','Two half turns on two feet are prescribed.',CURRENT_TIMESTAMP),
('gi_beam_p2_pivot','canonical_gi_wag_plus_2','gi_skill_beam_half_turn_two_feet','REQUIRED','Half turn on two feet follows the half spin.',CURRENT_TIMESTAMP),

('gi_beam_g2_stretch','canonical_gi_wag_general_2','gi_skill_beam_stretch_jump','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_beam_g3_stretch','canonical_gi_wag_general_3','gi_skill_beam_stretch_jump','REQUIRED','Two connected stretch jumps are prescribed.',CURRENT_TIMESTAMP),
('gi_beam_g4_stretch','canonical_gi_wag_general_4','gi_skill_beam_stretch_jump','REQUIRED','Connected to tuck jump.',CURRENT_TIMESTAMP),
('gi_beam_g5_stretch','canonical_gi_wag_general_5','gi_skill_beam_stretch_jump','REQUIRED','Connected to the selected split dance element.',CURRENT_TIMESTAMP),
('gi_beam_g6_stretch','canonical_gi_wag_general_6','gi_skill_beam_stretch_jump','REQUIRED','Stretch jump is used in the prescribed dismount options.',CURRENT_TIMESTAMP),
('gi_beam_p1_stretch','canonical_gi_wag_plus_1','gi_skill_beam_stretch_jump','REQUIRED','Two connected stretch jumps are prescribed.',CURRENT_TIMESTAMP),
('gi_beam_p2_stretch','canonical_gi_wag_plus_2','gi_skill_beam_stretch_jump','REQUIRED','Two connected stretch jumps are prescribed.',CURRENT_TIMESTAMP),
('gi_beam_p3_stretch','canonical_gi_wag_plus_3','gi_skill_beam_stretch_jump','REQUIRED','Connected to the selected split dance element and used in dismount option.',CURRENT_TIMESTAMP),

('gi_beam_g4_tuck','canonical_gi_wag_general_4','gi_skill_beam_tuck_jump','REQUIRED','Connected to stretch jump.',CURRENT_TIMESTAMP),
('gi_beam_g5_tuck','canonical_gi_wag_general_5','gi_skill_beam_tuck_jump','OPTION','Tuck, pike or wolf jump option.',CURRENT_TIMESTAMP),
('gi_beam_g6_tuck','canonical_gi_wag_general_6','gi_skill_beam_tuck_jump','REQUIRED','Connected to selected split dance element.',CURRENT_TIMESTAMP),
('gi_beam_p4_tuck','canonical_gi_wag_plus_4','gi_skill_beam_tuck_jump','REQUIRED','Connected to split jump.',CURRENT_TIMESTAMP),

('gi_beam_g2_arab','canonical_gi_wag_general_2','gi_skill_beam_arabesque','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP),
('gi_beam_g3_arab','canonical_gi_wag_general_3','gi_skill_beam_arabesque','REQUIRED','Prescribed routine.',CURRENT_TIMESTAMP);

-- Repeated Beam occurrences stay one stable skill identity with explicit repetitions.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_g1_beam_pivots','canonical_gi_wag_general_1','BEAM','gi_skill_beam_half_turn_two_feet',10,2,'CONNECTED_WITH_STEP','canonical_gi_wag_general_2025_plus_v4_2026_01',23,'Two occurrences of Pivot Turn; routine UI should expand them individually.'),
('gi_req_g2_beam_pivots','canonical_gi_wag_general_2','BEAM','gi_skill_beam_half_turn_two_feet',10,2,'SAME_DIRECTION_CONSECUTIVE','canonical_gi_wag_general_2025_plus_v4_2026_01',24,'Two occurrences; one is performed in squat per source requirement.'),
('gi_req_g3_beam_stretch','canonical_gi_wag_general_3','BEAM','gi_skill_beam_stretch_jump',30,2,'CONNECTED','canonical_gi_wag_general_2025_plus_v4_2026_01',25,'Two connected stretch-jump occurrences.'),
('gi_req_p1_beam_pivots','canonical_gi_wag_plus_1','BEAM','gi_skill_beam_half_turn_two_feet',10,2,'SAME_DIRECTION_CONNECTED','canonical_gi_wag_plus_2025_plus_v4_2026_02',20,'Two occurrences; one is performed in squat per source requirement.'),
('gi_req_p1_beam_stretch','canonical_gi_wag_plus_1','BEAM','gi_skill_beam_stretch_jump',20,2,'CONNECTED','canonical_gi_wag_plus_2025_plus_v4_2026_02',20,'Two connected stretch-jump occurrences.'),
('gi_req_p2_beam_stretch','canonical_gi_wag_plus_2','BEAM','gi_skill_beam_stretch_jump',20,2,'CONNECTED','canonical_gi_wag_plus_2025_plus_v4_2026_02',21,'Two connected stretch-jump occurrences.');

-- FLOOR: complete source-confirmed mappings for developmental identities already in the stable library.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_floor_intro_jhalf','canonical_gi_wag_intro','gi_skill_floor_jump_half_turn','REQUIRED','Set routine.',CURRENT_TIMESTAMP),
('gi_floor_g2_jhalf','canonical_gi_wag_general_2','gi_skill_floor_jump_half_turn','REQUIRED','Set routine.',CURRENT_TIMESTAMP),

('gi_floor_intro_backroll','canonical_gi_wag_intro','gi_skill_floor_backward_roll','REQUIRED','Backward roll occurs in the set routine.',CURRENT_TIMESTAMP),
('gi_floor_g1_backroll','canonical_gi_wag_general_1','gi_skill_floor_backward_roll','REQUIRED','Backward roll occurs in the set routine.',CURRENT_TIMESTAMP),

('gi_floor_intro_splits','canonical_gi_wag_intro','gi_skill_floor_splits','REQUIRED','Right or left splits are prescribed.',CURRENT_TIMESTAMP),
('gi_floor_g1_splits','canonical_gi_wag_general_1','gi_skill_floor_splits','REQUIRED','Right or left splits are prescribed.',CURRENT_TIMESTAMP),
('gi_floor_g2_splits','canonical_gi_wag_general_2','gi_skill_floor_splits','REQUIRED','Right or left splits are prescribed.',CURRENT_TIMESTAMP),
('gi_floor_g3_splits','canonical_gi_wag_general_3','gi_skill_floor_splits','REQUIRED','Right or left splits are prescribed.',CURRENT_TIMESTAMP),
('gi_floor_g4_splits','canonical_gi_wag_general_4','gi_skill_floor_splits','REQUIRED','Right or left splits are prescribed.',CURRENT_TIMESTAMP),
('gi_floor_p2_splits','canonical_gi_wag_plus_2','gi_skill_floor_splits','REQUIRED','Right or left splits are prescribed.',CURRENT_TIMESTAMP),

('gi_floor_g1_stretch','canonical_gi_wag_general_1','gi_skill_floor_stretch_jump','REQUIRED','Immediate stretch jump after roll to stand.',CURRENT_TIMESTAMP),

('gi_floor_g2_chasse','canonical_gi_wag_general_2','gi_skill_floor_chasse','REQUIRED','Chassé is prescribed in the set routine.',CURRENT_TIMESTAMP);

-- Preserve the two Split Leap occurrences in Plus 2/3 as one stable identity (already modeled)
-- while Chassé remains its own atomic skill. No compound sequence identity is created.
