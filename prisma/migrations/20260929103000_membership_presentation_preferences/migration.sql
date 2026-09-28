CREATE TABLE "MembershipPresentationPreference" (
  "membershipId" TEXT NOT NULL PRIMARY KEY,
  "homeWidgetOrder" TEXT NOT NULL DEFAULT '[]',
  "homeWidgetHidden" TEXT NOT NULL DEFAULT '[]',
  "homeWidgetWide" TEXT NOT NULL DEFAULT '[]',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MembershipPresentationPreference_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
