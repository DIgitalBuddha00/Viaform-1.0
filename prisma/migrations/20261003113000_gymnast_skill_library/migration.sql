CREATE TABLE "GymnastSkill" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "gymnastId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "firstEvidenceAt" DATETIME,
  "latestEvidenceAt" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "GymnastSkill_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GymnastSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "GymnastSkill_gymnastId_skillId_key" ON "GymnastSkill"("gymnastId","skillId");
CREATE INDEX "GymnastSkill_gymnastId_status_latestEvidenceAt_idx" ON "GymnastSkill"("gymnastId","status","latestEvidenceAt");
CREATE INDEX "GymnastSkill_skillId_status_latestEvidenceAt_idx" ON "GymnastSkill"("skillId","status","latestEvidenceAt");
ALTER TABLE "GymnastEvaluationItem" ADD COLUMN "skillId" TEXT REFERENCES "ViaformSkill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "GymnastEvaluationItem_skillId_idx" ON "GymnastEvaluationItem"("skillId");
