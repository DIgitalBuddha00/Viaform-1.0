CREATE TABLE "CoachHandoff" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "fromMembershipId" TEXT NOT NULL,
  "toMembershipId" TEXT NOT NULL,
  "trainingGroupId" TEXT,
  "scope" TEXT NOT NULL DEFAULT 'SELECTED',
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" DATETIME,
  "sharedFocus" TEXT,
  "sharedNote" TEXT,
  "returnNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "closedAt" DATETIME,
  CONSTRAINT "CoachHandoff_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CoachHandoff_fromMembershipId_fkey" FOREIGN KEY ("fromMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CoachHandoff_toMembershipId_fkey" FOREIGN KEY ("toMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CoachHandoff_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "CoachHandoff_organisationId_status_startsAt_idx" ON "CoachHandoff"("organisationId","status","startsAt");
CREATE INDEX "CoachHandoff_fromMembershipId_status_createdAt_idx" ON "CoachHandoff"("fromMembershipId","status","createdAt");
CREATE INDEX "CoachHandoff_toMembershipId_status_createdAt_idx" ON "CoachHandoff"("toMembershipId","status","createdAt");

CREATE TABLE "CoachHandoffGymnast" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "handoffId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "individualNote" TEXT,
  "coverNote" TEXT,
  "contextSnapshot" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CoachHandoffGymnast_handoffId_fkey" FOREIGN KEY ("handoffId") REFERENCES "CoachHandoff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CoachHandoffGymnast_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CoachHandoffGymnast_handoffId_gymnastId_key" ON "CoachHandoffGymnast"("handoffId","gymnastId");
CREATE INDEX "CoachHandoffGymnast_gymnastId_createdAt_idx" ON "CoachHandoffGymnast"("gymnastId","createdAt");
