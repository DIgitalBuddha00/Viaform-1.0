CREATE TABLE "CompetitionOperationsStaff" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "CompetitionOperationsStaff_eventId_membershipId_role_key" ON "CompetitionOperationsStaff"("eventId","membershipId","role");
CREATE INDEX "CompetitionOperationsStaff_eventId_role_idx" ON "CompetitionOperationsStaff"("eventId","role");
CREATE INDEX "CompetitionOperationsStaff_membershipId_idx" ON "CompetitionOperationsStaff"("membershipId");

CREATE TABLE "CompetitionOperationsAthlete" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "arrivalTime" TEXT,
  "warmupTime" TEXT,
  "competitionTime" TEXT,
  "handoffNote" TEXT,
  "operationalNote" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "CompetitionOperationsAthlete_entryId_key" ON "CompetitionOperationsAthlete"("entryId");
CREATE INDEX "CompetitionOperationsAthlete_eventId_status_idx" ON "CompetitionOperationsAthlete"("eventId","status");

CREATE TABLE "CompetitionOperationsSlot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "slotType" TEXT NOT NULL DEFAULT 'OTHER',
  "plannedTime" TEXT,
  "actualTime" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX "CompetitionOperationsSlot_eventId_orderIndex_idx" ON "CompetitionOperationsSlot"("eventId","orderIndex");
CREATE INDEX "CompetitionOperationsSlot_eventId_status_idx" ON "CompetitionOperationsSlot"("eventId","status");

CREATE TABLE "CompetitionOperationsLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "authorMembershipId" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'UPDATE',
  "message" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "CompetitionOperationsLog_eventId_createdAt_idx" ON "CompetitionOperationsLog"("eventId","createdAt");
CREATE INDEX "CompetitionOperationsLog_authorMembershipId_createdAt_idx" ON "CompetitionOperationsLog"("authorMembershipId","createdAt");
