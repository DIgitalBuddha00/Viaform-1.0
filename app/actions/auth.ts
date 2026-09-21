"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { createSession, destroySession, makePassword, normaliseEmail, verifyPassword } from "@/app/lib/auth";

const field = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function createFirstOrganisation(data: FormData) {
  if ((await prisma.user.count()) > 0) redirect("/login");
  const displayName = field(data, "displayName");
  const email = normaliseEmail(data.get("email"));
  const organisationName = field(data, "organisationName");
  const password = String(data.get("password") ?? "");
  if (!displayName || !email || !organisationName || password.length < 10) redirect("/setup?error=invalid");
  const credentials = makePassword(password);
  const baseSlug = slugify(organisationName) || "organisation";
  const slug = (await prisma.organisation.findUnique({ where: { slug: baseSlug } })) ? baseSlug + "-" + Date.now().toString(36) : baseSlug;

  const created = await prisma.$transaction(async (tx) => {
    if ((await tx.user.count()) > 0) return null;
    const organisation = await tx.organisation.create({ data: { name: organisationName, slug } });
    const user = await tx.user.create({ data: { email, displayName, passwordHash: credentials.hash, passwordSalt: credentials.salt } });
    await tx.organisationMembership.create({
      data: { userId: user.id, organisationId: organisation.id, isAdministrator: true, coachingRoles: JSON.stringify(["HEAD_COACH"]) },
    });
    return { user, organisation };
  });
  if (!created) redirect("/login");
  await createSession(created.user.id, created.organisation.id);
  redirect("/dashboard");
}

export async function signIn(data: FormData) {
  const email = normaliseEmail(data.get("email"));
  const password = String(data.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email }, include: { memberships: { where: { isActive: true }, orderBy: { joinedAt: "asc" } } } });
  if (!user || !user.isActive || !verifyPassword(password, user.passwordSalt, user.passwordHash)) redirect("/login?error=invalid");
  const membership = user.memberships[0];
  if (!membership) redirect("/login?error=access");
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id, membership.organisationId);
  redirect("/dashboard");
}

export async function signOut() {
  await destroySession();
  redirect("/login");
}
