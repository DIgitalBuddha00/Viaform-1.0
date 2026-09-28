CREATE TABLE "AthletePortalAccess" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "AthletePortalAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AthletePortalAccess_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AthletePortalAccess_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AthletePortalAccess_userId_gymnastId_relationship_key" ON "AthletePortalAccess"("userId","gymnastId","relationship");
CREATE INDEX "AthletePortalAccess_organisationId_relationship_status_idx" ON "AthletePortalAccess"("organisationId","relationship","status");
CREATE INDEX "AthletePortalAccess_gymnastId_relationship_status_idx" ON "AthletePortalAccess"("gymnastId","relationship","status");
CREATE INDEX "AthletePortalAccess_userId_status_idx" ON "AthletePortalAccess"("userId","status");
