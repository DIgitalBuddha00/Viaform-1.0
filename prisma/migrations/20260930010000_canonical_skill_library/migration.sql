CREATE TABLE "ViaformSkill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "discipline" TEXT NOT NULL DEFAULT 'WAG',
  "apparatus" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "aliases" TEXT NOT NULL DEFAULT '[]',
  "provenance" TEXT NOT NULL DEFAULT 'FIG',
  "sourceOrganisationId" TEXT,
  "figElementDefinitionId" TEXT,
  "figVaultDefinitionId" TEXT,
  "canonicalKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ViaformSkill_sourceOrganisationId_fkey" FOREIGN KEY ("sourceOrganisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ViaformSkill_figElementDefinitionId_fkey" FOREIGN KEY ("figElementDefinitionId") REFERENCES "FigElementDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ViaformSkill_figVaultDefinitionId_fkey" FOREIGN KEY ("figVaultDefinitionId") REFERENCES "FigVaultDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ViaformSkill_canonicalKey_key" ON "ViaformSkill"("canonicalKey");
CREATE INDEX "ViaformSkill_figElementDefinitionId_idx" ON "ViaformSkill"("figElementDefinitionId");
CREATE INDEX "ViaformSkill_figVaultDefinitionId_idx" ON "ViaformSkill"("figVaultDefinitionId");
CREATE INDEX "ViaformSkill_discipline_apparatus_status_idx" ON "ViaformSkill"("discipline","apparatus","status");
CREATE INDEX "ViaformSkill_sourceOrganisationId_status_idx" ON "ViaformSkill"("sourceOrganisationId","status");

CREATE TABLE "RulesetLevelSkill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "levelId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'REQUIREMENT',
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RulesetLevelSkill_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "RulesetLevel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RulesetLevelSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RulesetLevelSkill_levelId_skillId_role_key" ON "RulesetLevelSkill"("levelId","skillId","role");
CREATE INDEX "RulesetLevelSkill_skillId_idx" ON "RulesetLevelSkill"("skillId");
CREATE INDEX "RulesetLevelSkill_levelId_orderIndex_idx" ON "RulesetLevelSkill"("levelId","orderIndex");

CREATE TABLE "ProgrammeStageSkill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "stageId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'DEVELOP',
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgrammeStageSkill_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ProgrammeStage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProgrammeStageSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ProgrammeStageSkill_stageId_skillId_role_key" ON "ProgrammeStageSkill"("stageId","skillId","role");
CREATE INDEX "ProgrammeStageSkill_skillId_idx" ON "ProgrammeStageSkill"("skillId");
CREATE INDEX "ProgrammeStageSkill_stageId_orderIndex_idx" ON "ProgrammeStageSkill"("stageId","orderIndex");

INSERT INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","figElementDefinitionId","canonicalKey","status","createdAt","updatedAt")
SELECT 'fig_element_' || "id",'WAG',"apparatus","name","aliases",'FIG',"id",'FIG:ELEMENT:' || "apparatus" || ':' || "officialNumber" || ':' || "variantKey","status",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM "FigElementDefinition";
INSERT INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","figVaultDefinitionId","canonicalKey","status","createdAt","updatedAt")
SELECT 'fig_vault_' || "id",'WAG','VAULT',"name","aliases",'FIG',"id",'FIG:VAULT:' || "officialNumber" || ':' || "variantKey","status",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM "FigVaultDefinition";
