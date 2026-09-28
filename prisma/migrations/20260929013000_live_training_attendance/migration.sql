CREATE TABLE IF NOT EXISTS "TrainingAttendance" (
  "sessionId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NOT_RECORDED',
  "recordedByMembershipId" TEXT NOT NULL,
  "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  PRIMARY KEY ("sessionId", "gymnastId"),
  CONSTRAINT "TrainingAttendance_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingAttendance_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingAttendance_recordedByMembershipId_fkey"
    FOREIGN KEY ("recordedByMembershipId") REFERENCES "OrganisationMembership" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TrainingAttendance_gymnastId_recordedAt_idx"
ON "TrainingAttendance"("gymnastId", "recordedAt");

CREATE INDEX IF NOT EXISTS "TrainingAttendance_recordedByMembershipId_recordedAt_idx"
ON "TrainingAttendance"("recordedByMembershipId", "recordedAt");
