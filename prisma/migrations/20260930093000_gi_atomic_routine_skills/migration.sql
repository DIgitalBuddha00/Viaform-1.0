-- Atomic GI WAG routine skills and repeat-aware routine requirements.
CREATE TABLE "RulesetRoutineRequirement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "levelId" TEXT NOT NULL,
  "apparatus" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "sequenceIndex" INTEGER NOT NULL,
  "repetitions" INTEGER NOT NULL DEFAULT 1,
  "occurrenceContext" TEXT,
  "sourcePackageId" TEXT,
  "sourcePage" INTEGER,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RulesetRoutineRequirement_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "RulesetLevel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RulesetRoutineRequirement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RulesetRoutineRequirement_levelId_apparatus_sequenceIndex_key" ON "RulesetRoutineRequirement"("levelId","apparatus","sequenceIndex");
CREATE INDEX "RulesetRoutineRequirement_skillId_idx" ON "RulesetRoutineRequirement"("skillId");
CREATE INDEX "RulesetRoutineRequirement_levelId_apparatus_idx" ON "RulesetRoutineRequirement"("levelId","apparatus");

-- GI extension skills: atomic actions not represented as a single FIG-coded element.
INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","canonicalKey","status","createdAt","updatedAt") VALUES
('gi_skill_bars_tap_swing','WAG','BARS','Tap Swing','["tap swing","long hang tap swing"]','GYMNASTICS_IRELAND','GI:WAG:BARS:TAP_SWING','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_wrap_over','WAG','BARS','Wrap Over','["wrap over","wrap over the bar","swing wrap over"]','GYMNASTICS_IRELAND','GI:WAG:BARS:WRAP_OVER','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_underswing','WAG','BARS','Underswing','["under swing","underswing"]','GYMNASTICS_IRELAND','GI:WAG:BARS:UNDERSWING','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_bars_swing','WAG','BARS','Swing','["long hang swing","bar swing"]','GYMNASTICS_IRELAND','GI:WAG:BARS:SWING','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- General 6: source says 3 x tap swings; on the 3rd swing wrap over; immediate underswing, swing back; swing to wrap over.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_g6_bars_tap','canonical_gi_wag_general_6','BARS','gi_skill_bars_tap_swing',50,3,NULL,'canonical_gi_wag_general_2025_plus_v4_2026_01',28,'Each tap swing remains an individual routine occurrence.'),
('gi_req_g6_bars_wrap3','canonical_gi_wag_general_6','BARS','gi_skill_bars_wrap_over',60,1,'ON_REPETITION_3_OF_PREVIOUS','canonical_gi_wag_general_2025_plus_v4_2026_01',28,'Wrap over occurs on the third tap swing; separate skill identity.'),
('gi_req_g6_bars_under','canonical_gi_wag_general_6','BARS','gi_skill_bars_underswing',70,1,'IMMEDIATE_AFTER_PREVIOUS','canonical_gi_wag_general_2025_plus_v4_2026_01',28,NULL),
('gi_req_g6_bars_swingback','canonical_gi_wag_general_6','BARS','gi_skill_bars_swing',80,1,NULL,'canonical_gi_wag_general_2025_plus_v4_2026_01',28,'Swing back after underswing.'),
('gi_req_g6_bars_wrap2','canonical_gi_wag_general_6','BARS','gi_skill_bars_wrap_over',90,1,NULL,'canonical_gi_wag_general_2025_plus_v4_2026_01',28,'Second wrap over is a separate routine occurrence of the same atomic skill.');

-- General 7/8 repeat the same atomic 3-tap-swing pattern.
INSERT OR IGNORE INTO "RulesetRoutineRequirement" ("id","levelId","apparatus","skillId","sequenceIndex","repetitions","occurrenceContext","sourcePackageId","sourcePage","notes") VALUES
('gi_req_g7_bars_tap','canonical_gi_wag_general_7','BARS','gi_skill_bars_tap_swing',40,3,NULL,'canonical_gi_wag_general_2025_plus_v4_2026_01',29,'Three individual tap-swing occurrences.'),
('gi_req_g7_bars_wrap3','canonical_gi_wag_general_7','BARS','gi_skill_bars_wrap_over',50,1,'ON_REPETITION_3_OF_PREVIOUS','canonical_gi_wag_general_2025_plus_v4_2026_01',29,NULL),
('gi_req_g8_bars_tap','canonical_gi_wag_general_8','BARS','gi_skill_bars_tap_swing',50,3,NULL,'canonical_gi_wag_general_2025_plus_v4_2026_01',30,'Three individual tap-swing occurrences.'),
('gi_req_g8_bars_wrap3','canonical_gi_wag_general_8','BARS','gi_skill_bars_wrap_over',60,1,'ON_REPETITION_3_OF_PREVIOUS','canonical_gi_wag_general_2025_plus_v4_2026_01',30,NULL);
