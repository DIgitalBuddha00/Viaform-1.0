CREATE TABLE IF NOT EXISTS "TestMetric" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'CUSTOM',
  "apparatus" TEXT,
  "description" TEXT,
  "protocol" TEXT,
  "captureMode" TEXT NOT NULL DEFAULT 'MEASUREMENT',
  "unit" TEXT,
  "durationSeconds" INTEGER,
  "direction" TEXT NOT NULL DEFAULT 'COACH_INTERPRETATION',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TestMetric_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TestMetric_organisationId_name_key"
ON "TestMetric"("organisationId", "name");

CREATE INDEX IF NOT EXISTS "TestMetric_organisationId_category_status_idx"
ON "TestMetric"("organisationId", "category", "status");

CREATE TABLE IF NOT EXISTS "TestingSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "trainingGroupId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "testedAt" DATETIME NOT NULL,
  "purpose" TEXT,
  "conditions" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TestingSession_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TestingSession_trainingGroupId_fkey"
    FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TestingSession_createdByMembershipId_fkey"
    FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TestingSession_organisationId_testedAt_idx"
ON "TestingSession"("organisationId", "testedAt");

CREATE INDEX IF NOT EXISTS "TestingSession_trainingGroupId_testedAt_idx"
ON "TestingSession"("trainingGroupId", "testedAt");

CREATE TABLE IF NOT EXISTS "TestingSessionGymnast" (
  "sessionId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("sessionId", "gymnastId"),
  CONSTRAINT "TestingSessionGymnast_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TestingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TestingSessionGymnast_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TestingSessionGymnast_gymnastId_assignedAt_idx"
ON "TestingSessionGymnast"("gymnastId", "assignedAt");

CREATE TABLE IF NOT EXISTS "TestingResult" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "metricId" TEXT NOT NULL,
  "recordedByMembershipId" TEXT NOT NULL,
  "numberValue" REAL NOT NULL,
  "note" TEXT,
  "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TestingResult_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TestingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TestingResult_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TestingResult_metricId_fkey"
    FOREIGN KEY ("metricId") REFERENCES "TestMetric" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "TestingResult_recordedByMembershipId_fkey"
    FOREIGN KEY ("recordedByMembershipId") REFERENCES "OrganisationMembership" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TestingResult_sessionId_gymnastId_metricId_key"
ON "TestingResult"("sessionId", "gymnastId", "metricId");

CREATE INDEX IF NOT EXISTS "TestingResult_gymnastId_metricId_recordedAt_idx"
ON "TestingResult"("gymnastId", "metricId", "recordedAt");

CREATE INDEX IF NOT EXISTS "TestingResult_metricId_recordedAt_idx"
ON "TestingResult"("metricId", "recordedAt");

CREATE INDEX IF NOT EXISTS "TestingResult_recordedByMembershipId_recordedAt_idx"
ON "TestingResult"("recordedByMembershipId", "recordedAt");
