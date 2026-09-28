CREATE TABLE "CompetitionEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "eventType" TEXT NOT NULL DEFAULT 'EXTERNAL',
  "eventDate" DATETIME NOT NULL,
  "location" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CompetitionEvent_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CompetitionEvent_createdByMembershipId_fkey"
    FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "CompetitionEvent_organisationId_eventDate_idx"
ON "CompetitionEvent"("organisationId", "eventDate");

CREATE INDEX "CompetitionEvent_organisationId_eventType_status_idx"
ON "CompetitionEvent"("organisationId", "eventType", "status");

CREATE TABLE "CompetitionEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "competitionEventId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "rulesetProgramCode" TEXT,
  "rulesetProgramName" TEXT,
  "rulesetLevelCode" TEXT,
  "rulesetLevelName" TEXT,
  "rulesetPackageCode" TEXT,
  "rulesetVersionLabel" TEXT,
  "ageDivision" TEXT,
  "sessionLabel" TEXT,
  "squadLabel" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ENTERED',
  "coachNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CompetitionEntry_competitionEventId_fkey"
    FOREIGN KEY ("competitionEventId") REFERENCES "CompetitionEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CompetitionEntry_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CompetitionEntry_competitionEventId_gymnastId_key"
ON "CompetitionEntry"("competitionEventId", "gymnastId");

CREATE INDEX "CompetitionEntry_gymnastId_createdAt_idx"
ON "CompetitionEntry"("gymnastId", "createdAt");

CREATE TABLE "CompetitionApparatusPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "competitionEntryId" TEXT NOT NULL,
  "apparatus" TEXT NOT NULL,
  "routineId" TEXT,
  "routineNameSnapshot" TEXT,
  "planNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CompetitionApparatusPlan_competitionEntryId_fkey"
    FOREIGN KEY ("competitionEntryId") REFERENCES "CompetitionEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CompetitionApparatusPlan_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "GymnastRoutine" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CompetitionApparatusPlan_competitionEntryId_apparatus_key"
ON "CompetitionApparatusPlan"("competitionEntryId", "apparatus");

CREATE INDEX "CompetitionApparatusPlan_routineId_idx"
ON "CompetitionApparatusPlan"("routineId");
