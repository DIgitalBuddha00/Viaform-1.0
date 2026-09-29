CREATE TABLE "StaffInvitation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "displayName" TEXT,
  "tokenHash" TEXT NOT NULL,
  "isAdministrator" BOOLEAN NOT NULL DEFAULT false,
  "coachingRoles" TEXT NOT NULL DEFAULT '[]',
  "delegatedCapabilities" TEXT NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "expiresAt" DATETIME NOT NULL,
  "acceptedAt" DATETIME,
  "acceptedByUserId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "StaffInvitation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StaffInvitation_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StaffInvitation_tokenHash_key" ON "StaffInvitation"("tokenHash");
CREATE INDEX "StaffInvitation_organisationId_email_status_idx" ON "StaffInvitation"("organisationId","email","status");
CREATE INDEX "StaffInvitation_organisationId_status_expiresAt_idx" ON "StaffInvitation"("organisationId","status","expiresAt");
CREATE INDEX "StaffInvitation_email_status_expiresAt_idx" ON "StaffInvitation"("email","status","expiresAt");
