CREATE TABLE "CalendarEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CalendarEvent_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CalendarEvent_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "CalendarEvent_organisationId_startDate_idx" ON "CalendarEvent"("organisationId","startDate");
CREATE INDEX "CalendarEvent_organisationId_eventType_startDate_idx" ON "CalendarEvent"("organisationId","eventType","startDate");

CREATE TABLE "Macrocycle" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Macrocycle_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Macrocycle_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Macrocycle_organisationId_status_startDate_endDate_idx" ON "Macrocycle"("organisationId","status","startDate","endDate");

CREATE TABLE "MacrocycleGroup" (
  "macrocycleId" TEXT NOT NULL,
  "trainingGroupId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("macrocycleId","trainingGroupId"),
  CONSTRAINT "MacrocycleGroup_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "Macrocycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MacrocycleGroup_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MacrocycleGroup_trainingGroupId_idx" ON "MacrocycleGroup"("trainingGroupId");

CREATE TABLE "MacrocycleGymnast" (
  "macrocycleId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("macrocycleId","gymnastId"),
  CONSTRAINT "MacrocycleGymnast_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "Macrocycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MacrocycleGymnast_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MacrocycleGymnast_gymnastId_idx" ON "MacrocycleGymnast"("gymnastId");

CREATE TABLE "MacrocyclePhase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "macrocycleId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MacrocyclePhase_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "Macrocycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MacrocyclePhase_macrocycleId_orderIndex_startDate_idx" ON "MacrocyclePhase"("macrocycleId","orderIndex","startDate");
