CREATE TABLE IF NOT EXISTS "TrainingSessionGymnast" (
  "sessionId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'GROUP',
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("sessionId", "gymnastId"),
  CONSTRAINT "TrainingSessionGymnast_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingSessionGymnast_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TrainingSessionGymnast_gymnastId_assignedAt_idx"
ON "TrainingSessionGymnast"("gymnastId", "assignedAt");
