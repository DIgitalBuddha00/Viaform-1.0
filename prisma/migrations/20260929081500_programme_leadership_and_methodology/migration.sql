CREATE TABLE "ProgrammeLeadAssignment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "programmeId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgrammeLeadAssignment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProgrammeLeadAssignment_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "CoachingProgramme" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProgrammeLeadAssignment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ProgrammeLeadAssignment_programmeId_membershipId_key" ON "ProgrammeLeadAssignment"("programmeId","membershipId");
CREATE INDEX "ProgrammeLeadAssignment_organisationId_membershipId_idx" ON "ProgrammeLeadAssignment"("organisationId","membershipId");

CREATE TABLE "MethodologyRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "programmeId" TEXT,
  "createdByMembershipId" TEXT NOT NULL,
  "approvedByMembershipId" TEXT,
  "scopeType" TEXT NOT NULL DEFAULT 'GLOBAL',
  "scopeRef" TEXT,
  "apparatus" TEXT,
  "title" TEXT NOT NULL,
  "provenance" TEXT NOT NULL DEFAULT 'COACH_METHODOLOGY',
  "contributorName" TEXT,
  "technicalObjective" TEXT,
  "technicalBoundaries" TEXT,
  "defaultApproach" TEXT,
  "alternativeApproaches" TEXT,
  "uncertainty" TEXT,
  "sourceNote" TEXT,
  "sourceUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "approvedAt" DATETIME,
  CONSTRAINT "MethodologyRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MethodologyRecord_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "CoachingProgramme" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "MethodologyRecord_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MethodologyRecord_approvedByMembershipId_fkey" FOREIGN KEY ("approvedByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "MethodologyRecord_organisationId_status_scopeType_idx" ON "MethodologyRecord"("organisationId","status","scopeType");
CREATE INDEX "MethodologyRecord_organisationId_apparatus_status_idx" ON "MethodologyRecord"("organisationId","apparatus","status");
CREATE INDEX "MethodologyRecord_programmeId_status_idx" ON "MethodologyRecord"("programmeId","status");
