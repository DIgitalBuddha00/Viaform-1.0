-- GI WAG Vault developmental identity and progression relationships.
-- Competitive preparations remain evidence of what was performed; they do not become evidence of a completed FIG vault.
CREATE TABLE "VaultDevelopmentLink" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "developmentalSkillId" TEXT NOT NULL,
  "targetSkillId" TEXT NOT NULL,
  "relationship" TEXT NOT NULL DEFAULT 'DEVELOPS_TOWARD',
  "targetScope" TEXT NOT NULL DEFAULT 'SKILL',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VaultDevelopmentLink_developmentalSkillId_fkey" FOREIGN KEY ("developmentalSkillId") REFERENCES "ViaformSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VaultDevelopmentLink_targetSkillId_fkey" FOREIGN KEY ("targetSkillId") REFERENCES "ViaformSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "VaultDevelopmentLink_developmentalSkillId_targetSkillId_relationship_key" ON "VaultDevelopmentLink"("developmentalSkillId","targetSkillId","relationship");
CREATE INDEX "VaultDevelopmentLink_targetSkillId_idx" ON "VaultDevelopmentLink"("targetSkillId");
CREATE INDEX "VaultDevelopmentLink_developmentalSkillId_idx" ON "VaultDevelopmentLink"("developmentalSkillId");

-- Stable developmental identities. Height, mat stack and table configuration belong to evidence/setup context.
INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","canonicalKey","status","createdAt","updatedAt") VALUES
('gi_skill_vault_handspring_flat_back','WAG','VAULT','Handspring to Flat Back','["handspring flat back","handspring prep to back lying","handspring to back lying"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:HANDSPRING_FLAT_BACK','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_vault_handspring_stand','WAG','VAULT','Handspring to Stand','["handspring to stand","handspring prep to stand and fall forward","handspring front prep"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:HANDSPRING_STAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_vault_roundoff_shoulder','WAG','VAULT','Round-off Stretched Jump to Shoulder Stand','["round off stretched jump to shoulder stand","roundoff stretched jump to shoulder stand"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:ROUND_OFF_STRETCHED_JUMP_SHOULDER_STAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_vault_roundoff_flic_stand','WAG','VAULT','Round-off Flic to Stand','["round off flic to stand","roundoff back handspring to stand","yurchenko prep to stand"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:ROUND_OFF_FLIC_STAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_vault_tsuk_prep','WAG','VAULT','Tsukahara Prep to Stand','["tsuk prep","tsukahara prep","tsuk prep to stand and fall back"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:TSUKAHARA_PREP_STAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_vault_yurchenko_prep','WAG','VAULT','Yurchenko Prep to Stand','["yurchenko prep","yurchenko timer to stand","yurchenko prep to stand and fall back"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:YURCHENKO_PREP_STAND','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_vault_ro_layout','WAG','VAULT','Round-off Straight Back Salto','["round off straight back salto","roundoff layout"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:ROUND_OFF_STRAIGHT_BACK_SALTO','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('gi_skill_vault_board_front_layout','WAG','VAULT','Straight Front Salto from Springboard','["straight front salto from springboard","front layout from board"]','GYMNASTICS_IRELAND','GI:WAG:VAULT:SPRINGBOARD_STRAIGHT_FRONT_SALTO','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Map prescribed developmental vaults to assignable GI levels. Exact heights/configurations remain in FigApparatusRule.valueJson.
INSERT OR IGNORE INTO "RulesetLevelSkill" ("id","levelId","skillId","role","notes","createdAt") VALUES
('gi_vt_intro_hfb','canonical_gi_wag_intro','gi_skill_vault_handspring_flat_back','REQUIRED','Competition preparation; setup defined by GI Vault rule.',CURRENT_TIMESTAMP),
('gi_vt_g1_hfb','canonical_gi_wag_general_1','gi_skill_vault_handspring_flat_back','REQUIRED','Competition preparation; setup defined by GI Vault rule.',CURRENT_TIMESTAMP),
('gi_vt_g2_hfb','canonical_gi_wag_general_2','gi_skill_vault_handspring_flat_back','REQUIRED','Competition preparation; setup defined by GI Vault rule.',CURRENT_TIMESTAMP),
('gi_vt_g3_hfb','canonical_gi_wag_general_3','gi_skill_vault_handspring_flat_back','REQUIRED','Competition preparation; setup defined by GI Vault rule.',CURRENT_TIMESTAMP),
('gi_vt_g4_hfb','canonical_gi_wag_general_4','gi_skill_vault_handspring_flat_back','REQUIRED','Competition preparation on table; setup defined by GI Vault rule.',CURRENT_TIMESTAMP),
('gi_vt_g5_hs','canonical_gi_wag_general_5','gi_skill_vault_handspring_stand','REQUIRED','Competition preparation; setup defined by GI Vault rule.',CURRENT_TIMESTAMP),
('gi_vt_g6_hs','canonical_gi_wag_general_6','gi_skill_vault_handspring_stand','REQUIRED','Competition preparation; setup defined by GI Vault rule.',CURRENT_TIMESTAMP),
('gi_vt_g7_hs','canonical_gi_wag_general_7','gi_skill_vault_handspring_stand','OPTION','One of three prescribed preparation families.',CURRENT_TIMESTAMP),
('gi_vt_g7_tsuk','canonical_gi_wag_general_7','gi_skill_vault_tsuk_prep','OPTION','One of three prescribed preparation families.',CURRENT_TIMESTAMP),
('gi_vt_g7_yur','canonical_gi_wag_general_7','gi_skill_vault_yurchenko_prep','OPTION','One of three prescribed preparation families.',CURRENT_TIMESTAMP),
('gi_vt_g8_hs','canonical_gi_wag_general_8','gi_skill_vault_handspring_stand','OPTION','One of three prescribed preparation families.',CURRENT_TIMESTAMP),
('gi_vt_g8_tsuk','canonical_gi_wag_general_8','gi_skill_vault_tsuk_prep','OPTION','One of three prescribed preparation families.',CURRENT_TIMESTAMP),
('gi_vt_g8_yur','canonical_gi_wag_general_8','gi_skill_vault_yurchenko_prep','OPTION','One of three prescribed preparation families.',CURRENT_TIMESTAMP),
('gi_vt_p1_hfb','canonical_gi_wag_plus_1','gi_skill_vault_handspring_flat_back','REQUIRED','Competition preparation; 80cm setup is context, not identity.',CURRENT_TIMESTAMP),
('gi_vt_p2_hfb','canonical_gi_wag_plus_2','gi_skill_vault_handspring_flat_back','REQUIRED','Competition preparation; 100cm setup is context, not identity.',CURRENT_TIMESTAMP),
('gi_vt_p3_rosh','canonical_gi_wag_plus_3','gi_skill_vault_roundoff_shoulder','OPTION','Competition preparation.',CURRENT_TIMESTAMP),
('gi_vt_p3_hs','canonical_gi_wag_plus_3','gi_skill_vault_handspring_stand','OPTION','Competition preparation.',CURRENT_TIMESTAMP),
('gi_vt_p4_rolay','canonical_gi_wag_plus_4','gi_skill_vault_ro_layout','OPTION','Competition preparation.',CURRENT_TIMESTAMP),
('gi_vt_p4_frontlay','canonical_gi_wag_plus_4','gi_skill_vault_board_front_layout','OPTION','Competition preparation.',CURRENT_TIMESTAMP),
('gi_vt_p5_roflic','canonical_gi_wag_plus_5','gi_skill_vault_roundoff_flic_stand','OPTION','Competition preparation; block/mat height is context.',CURRENT_TIMESTAMP),
('gi_vt_p5_hs','canonical_gi_wag_plus_5','gi_skill_vault_handspring_stand','OPTION','Competition preparation; block/mat height is context.',CURRENT_TIMESTAMP),
('gi_vt_p5_tsuk','canonical_gi_wag_plus_5','gi_skill_vault_tsuk_prep','OPTION','Competition preparation; block/mat height is context.',CURRENT_TIMESTAMP),
('gi_vt_p6_yur','canonical_gi_wag_plus_6','gi_skill_vault_yurchenko_prep','OPTION','Competition preparation; table/mat height is context.',CURRENT_TIMESTAMP),
('gi_vt_p6_tsuk','canonical_gi_wag_plus_6','gi_skill_vault_tsuk_prep','OPTION','Competition preparation; table/mat height is context.',CURRENT_TIMESTAMP),
('gi_vt_p6_hs','canonical_gi_wag_plus_6','gi_skill_vault_handspring_stand','OPTION','Competition preparation; table/mat height is context.',CURRENT_TIMESTAMP);

-- Development links are intentionally conservative: link preparations only to directly corresponding canonical FIG entries.
-- Handspring-to-stand develops toward the FIG handspring-forward vault entry.
INSERT OR IGNORE INTO "VaultDevelopmentLink" ("id","developmentalSkillId","targetSkillId","relationship","targetScope","notes")
SELECT 'gi_vt_link_hs_fig100','gi_skill_vault_handspring_stand',s."id",'DEVELOPS_TOWARD','SKILL','Preparation evidence remains separate from completed FIG vault evidence.'
FROM "ViaformSkill" s WHERE s."canonicalKey"='FIG:VAULT:1.00:a';
-- Yurchenko prep corresponds directly to the FIG round-off/flic-flac-on timer entry.
INSERT OR IGNORE INTO "VaultDevelopmentLink" ("id","developmentalSkillId","targetSkillId","relationship","targetScope","notes")
SELECT 'gi_vt_link_yur_fig140','gi_skill_vault_yurchenko_prep',s."id",'DEVELOPS_TOWARD','SKILL','Preparation evidence remains separate from completed FIG vault evidence.'
FROM "ViaformSkill" s WHERE s."canonicalKey"='FIG:VAULT:1.40:a';
INSERT OR IGNORE INTO "VaultDevelopmentLink" ("id","developmentalSkillId","targetSkillId","relationship","targetScope","notes")
SELECT 'gi_vt_link_roflic_fig140','gi_skill_vault_roundoff_flic_stand',s."id",'DEVELOPS_TOWARD','SKILL','Block/mat preparation toward the same round-off/flic-flac-on foundation; setup remains evidence context.'
FROM "ViaformSkill" s WHERE s."canonicalKey"='FIG:VAULT:1.40:a';
