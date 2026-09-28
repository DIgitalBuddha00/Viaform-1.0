CREATE TABLE IF NOT EXISTS "FacilityLocation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "FacilityLocation_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "FacilityLocation_organisationId_name_key"
ON "FacilityLocation"("organisationId", "name");
CREATE INDEX IF NOT EXISTS "FacilityLocation_organisationId_status_idx"
ON "FacilityLocation"("organisationId", "status");

CREATE TABLE IF NOT EXISTS "TrainingSpace" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "locationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "capacity" INTEGER,
  "shareable" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingSpace_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "FacilityLocation" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TrainingSpace_locationId_name_key"
ON "TrainingSpace"("locationId", "name");
CREATE INDEX IF NOT EXISTS "TrainingSpace_locationId_orderIndex_status_idx"
ON "TrainingSpace"("locationId", "orderIndex", "status");

CREATE TABLE IF NOT EXISTS "FacilityResource" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "trainingSpaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "setupNotes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "FacilityResource_trainingSpaceId_fkey"
    FOREIGN KEY ("trainingSpaceId") REFERENCES "TrainingSpace" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "FacilityResource_trainingSpaceId_name_key"
ON "FacilityResource"("trainingSpaceId", "name");
CREATE INDEX IF NOT EXISTS "FacilityResource_trainingSpaceId_category_status_idx"
ON "FacilityResource"("trainingSpaceId", "category", "status");

CREATE TABLE IF NOT EXISTS "TrainingGroupFacility" (
  "trainingGroupId" TEXT NOT NULL PRIMARY KEY,
  "locationId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrainingGroupFacility_trainingGroupId_fkey"
    FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingGroupFacility_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "FacilityLocation" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "TrainingGroupFacility_locationId_idx"
ON "TrainingGroupFacility"("locationId");

CREATE TABLE IF NOT EXISTS "TrainingSessionFacility" (
  "sessionId" TEXT NOT NULL PRIMARY KEY,
  "locationId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrainingSessionFacility_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingSessionFacility_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "FacilityLocation" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "TrainingSessionFacility_locationId_idx"
ON "TrainingSessionFacility"("locationId");

CREATE TABLE IF NOT EXISTS "SessionBlockSpace" (
  "blockId" TEXT NOT NULL PRIMARY KEY,
  "trainingSpaceId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionBlockSpace_blockId_fkey"
    FOREIGN KEY ("blockId") REFERENCES "SessionBlock" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionBlockSpace_trainingSpaceId_fkey"
    FOREIGN KEY ("trainingSpaceId") REFERENCES "TrainingSpace" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "SessionBlockSpace_trainingSpaceId_idx"
ON "SessionBlockSpace"("trainingSpaceId");

CREATE TABLE IF NOT EXISTS "SessionBlockResource" (
  "blockId" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("blockId", "resourceId"),
  CONSTRAINT "SessionBlockResource_blockId_fkey"
    FOREIGN KEY ("blockId") REFERENCES "SessionBlock" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionBlockResource_resourceId_fkey"
    FOREIGN KEY ("resourceId") REFERENCES "FacilityResource" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "SessionBlockResource_resourceId_idx"
ON "SessionBlockResource"("resourceId");
