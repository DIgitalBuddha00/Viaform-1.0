CREATE TABLE IF NOT EXISTS "TrainingEvidence" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "blockId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "recordedByMembershipId" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "note" TEXT,
  "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrainingEvidence_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingEvidence_blockId_fkey"
    FOREIGN KEY ("blockId") REFERENCES "SessionBlock" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingEvidence_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingEvidence_recordedByMembershipId_fkey"
    FOREIGN KEY ("recordedByMembershipId") REFERENCES "OrganisationMembership" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TrainingEvidence_sessionId_blockId_recordedAt_idx"
ON "TrainingEvidence"("sessionId", "blockId", "recordedAt");

CREATE INDEX IF NOT EXISTS "TrainingEvidence_gymnastId_recordedAt_idx"
ON "TrainingEvidence"("gymnastId", "recordedAt");

CREATE INDEX IF NOT EXISTS "TrainingEvidence_recordedByMembershipId_recordedAt_idx"
ON "TrainingEvidence"("recordedByMembershipId", "recordedAt");
