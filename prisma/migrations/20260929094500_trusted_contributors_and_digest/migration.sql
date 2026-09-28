CREATE TABLE "TrustedContributor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "roleLabel" TEXT,
  "organisationName" TEXT,
  "scopeNote" TEXT,
  "sourceNote" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrustedContributor_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TrustedContributor_organisationId_name_key" ON "TrustedContributor"("organisationId","name");
CREATE INDEX "TrustedContributor_organisationId_status_name_idx" ON "TrustedContributor"("organisationId","status","name");

ALTER TABLE "MethodologyRecord" ADD COLUMN "trustedContributorId" TEXT REFERENCES "TrustedContributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "MethodologyRecord_trustedContributorId_status_idx" ON "MethodologyRecord"("trustedContributorId","status");
