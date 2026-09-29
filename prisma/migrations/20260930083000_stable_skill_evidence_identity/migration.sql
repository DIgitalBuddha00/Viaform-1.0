-- Stable Viaform skill identity for planned work and longitudinal evidence.
ALTER TABLE "SessionBlockWorkItem" ADD COLUMN "skillId" TEXT;
ALTER TABLE "TrainingEvidence" ADD COLUMN "skillId" TEXT;

UPDATE "SessionBlockWorkItem"
SET "skillId" = (
  SELECT vs."id" FROM "ViaformSkill" vs
  WHERE (vs."figElementDefinitionId" = "SessionBlockWorkItem"."elementDefinitionId" AND "SessionBlockWorkItem"."elementDefinitionId" IS NOT NULL)
     OR (vs."figVaultDefinitionId" = "SessionBlockWorkItem"."vaultDefinitionId" AND "SessionBlockWorkItem"."vaultDefinitionId" IS NOT NULL)
  ORDER BY vs."createdAt" ASC LIMIT 1
)
WHERE "skillId" IS NULL AND ("elementDefinitionId" IS NOT NULL OR "vaultDefinitionId" IS NOT NULL);

UPDATE "TrainingEvidence"
SET "skillId" = COALESCE(
  (SELECT wi."skillId" FROM "SessionBlockWorkItem" wi WHERE wi."id" = "TrainingEvidence"."workItemId"),
  (SELECT vs."id" FROM "ViaformSkill" vs
   WHERE (vs."figElementDefinitionId" = "TrainingEvidence"."elementDefinitionId" AND "TrainingEvidence"."elementDefinitionId" IS NOT NULL)
      OR (vs."figVaultDefinitionId" = "TrainingEvidence"."vaultDefinitionId" AND "TrainingEvidence"."vaultDefinitionId" IS NOT NULL)
   ORDER BY vs."createdAt" ASC LIMIT 1)
)
WHERE "skillId" IS NULL;

CREATE INDEX "SessionBlockWorkItem_skillId_idx" ON "SessionBlockWorkItem"("skillId");
CREATE INDEX "TrainingEvidence_skillId_recordedAt_idx" ON "TrainingEvidence"("skillId","recordedAt");
