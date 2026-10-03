CREATE TABLE "TrainingQuarterFocusSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "focusId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingQuarterFocusSkill_focusId_fkey" FOREIGN KEY ("focusId") REFERENCES "TrainingQuarterFocus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingQuarterFocusSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TrainingQuarterFocusSkill_focusId_skillId_relationship_key" ON "TrainingQuarterFocusSkill"("focusId", "skillId", "relationship");
CREATE INDEX "TrainingQuarterFocusSkill_focusId_relationship_idx" ON "TrainingQuarterFocusSkill"("focusId", "relationship");
CREATE INDEX "TrainingQuarterFocusSkill_skillId_relationship_idx" ON "TrainingQuarterFocusSkill"("skillId", "relationship");
