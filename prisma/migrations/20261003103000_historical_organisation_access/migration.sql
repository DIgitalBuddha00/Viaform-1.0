CREATE TABLE "HistoricalOrganisationAccess" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "grantedByUserId" TEXT,
  "accessLevel" TEXT NOT NULL DEFAULT 'READ_ONLY',
  "reason" TEXT,
  "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "HistoricalOrganisationAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalOrganisationAccess_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HistoricalOrganisationAccess_userId_organisationId_key" ON "HistoricalOrganisationAccess"("userId","organisationId");
CREATE INDEX "HistoricalOrganisationAccess_userId_revokedAt_idx" ON "HistoricalOrganisationAccess"("userId","revokedAt");
CREATE INDEX "HistoricalOrganisationAccess_organisationId_revokedAt_idx" ON "HistoricalOrganisationAccess"("organisationId","revokedAt");
