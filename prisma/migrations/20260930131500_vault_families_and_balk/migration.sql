-- Vault family progression layer.
-- Developmental evidence remains attached to the performed preparation and never becomes completed-vault evidence.
CREATE TABLE "VaultFamily" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "VaultFamily_code_key" ON "VaultFamily"("code");

CREATE TABLE "VaultFamilySkill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  CONSTRAINT "VaultFamilySkill_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "VaultFamily" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VaultFamilySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "VaultFamilySkill_familyId_skillId_key" ON "VaultFamilySkill"("familyId","skillId");
CREATE INDEX "VaultFamilySkill_skillId_idx" ON "VaultFamilySkill"("skillId");

CREATE TABLE "VaultDevelopmentFamilyLink" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "developmentalSkillId" TEXT NOT NULL,
  "familyId" TEXT NOT NULL,
  "relationship" TEXT NOT NULL DEFAULT 'DEVELOPS_TOWARD_FAMILY',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VaultDevelopmentFamilyLink_developmentalSkillId_fkey" FOREIGN KEY ("developmentalSkillId") REFERENCES "ViaformSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VaultDevelopmentFamilyLink_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "VaultFamily" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "VaultDevelopmentFamilyLink_developmentalSkillId_familyId_relationship_key" ON "VaultDevelopmentFamilyLink"("developmentalSkillId","familyId","relationship");
CREATE INDEX "VaultDevelopmentFamilyLink_familyId_idx" ON "VaultDevelopmentFamilyLink"("familyId");
CREATE INDEX "VaultDevelopmentFamilyLink_developmentalSkillId_idx" ON "VaultDevelopmentFamilyLink"("developmentalSkillId");

INSERT INTO "VaultFamily" ("id","code","name","description") VALUES
('vault_family_handspring_front','HANDSPRING_FRONT','Handspring Front Family','Forward handspring entry vaults that develop from handspring-front preparations.'),
('vault_family_tsukahara','TSUKAHARA','Tsukahara Family','Tsukahara-style vaults using the corresponding turning entry and backward second flight.'),
('vault_family_yurchenko','YURCHENKO','Yurchenko Family','Round-off/flic-flac entry vaults in the Yurchenko family.')
ON CONFLICT("code") DO NOTHING;

-- Membership is derived from the stable FIG catalogue identities, not duplicated vault definitions.
INSERT OR IGNORE INTO "VaultFamilySkill" ("id","familyId","skillId")
SELECT 'vfs_hs_'||replace(replace(s."canonicalKey",':','_'),'.','_'),'vault_family_handspring_front',s."id"
FROM "ViaformSkill" s
WHERE s."canonicalKey" LIKE 'FIG:VAULT:2.%';

INSERT OR IGNORE INTO "VaultFamilySkill" ("id","familyId","skillId")
SELECT 'vfs_tsuk_'||replace(replace(s."canonicalKey",':','_'),'.','_'),'vault_family_tsukahara',s."id"
FROM "ViaformSkill" s
WHERE s."canonicalKey" LIKE 'FIG:VAULT:3.%';

INSERT OR IGNORE INTO "VaultFamilySkill" ("id","familyId","skillId")
SELECT 'vfs_yur_'||replace(replace(s."canonicalKey",':','_'),'.','_'),'vault_family_yurchenko',s."id"
FROM "ViaformSkill" s
WHERE s."canonicalKey" LIKE 'FIG:VAULT:4.%';

-- The half-on family (FIG group 5) is not silently folded into Yurchenko: it has materially different table action and remains separately identifiable.

INSERT OR IGNORE INTO "VaultDevelopmentFamilyLink" ("id","developmentalSkillId","familyId","relationship","notes") VALUES
('vdf_handspring_stand','gi_skill_vault_handspring_stand','vault_family_handspring_front','DEVELOPS_TOWARD_FAMILY','Preparation evidence informs development toward the family but is not evidence of a completed FIG vault.'),
('vdf_handspring_flat_back','gi_skill_vault_handspring_flat_back','vault_family_handspring_front','DEVELOPS_TOWARD_FAMILY','Early preparation evidence informs development toward the family but is not evidence of a completed FIG vault.'),
('vdf_tsuk_prep','gi_skill_vault_tsuk_prep','vault_family_tsukahara','DEVELOPS_TOWARD_FAMILY','Tsukahara preparation evidence informs the family without selecting a finished Tsuk vault.'),
('vdf_yurchenko_prep','gi_skill_vault_yurchenko_prep','vault_family_yurchenko','DEVELOPS_TOWARD_FAMILY','Yurchenko preparation evidence informs the family without selecting a finished Yurchenko vault.'),
('vdf_roundoff_flic_stand','gi_skill_vault_roundoff_flic_stand','vault_family_yurchenko','DEVELOPS_TOWARD_FAMILY','Round-off flic preparation evidence informs the Yurchenko family; setup height remains evidence context.');
