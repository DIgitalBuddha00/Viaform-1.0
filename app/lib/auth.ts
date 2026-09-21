import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { resolveAccessProfile } from "./access-control";

const SESSION_COOKIE = "viaform_session";
const SESSION_DAYS = 30;

export function normaliseEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function makePassword(password: string) {
  const salt = randomBytes(24).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, organisationId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await prisma.authSession.create({ data: { userId, organisationId, tokenHash: tokenHash(token), expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.authSession.deleteMany({ where: { tokenHash: tokenHash(token) } }).catch(() => undefined);
  jar.delete(SESSION_COOKIE);
}

export async function currentAuthContext() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.authSession.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: { include: { memberships: { where: { isActive: true }, include: { organisation: true }, orderBy: { joinedAt: "asc" } } } } },
  }).catch(() => null);
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) return null;
  const membership = session.user.memberships.find((m) => m.organisationId === session.organisationId) ?? session.user.memberships[0];
  if (!membership) return null;
  return { user: session.user, membership, organisation: membership.organisation, access: resolveAccessProfile(membership) };
}

export async function requireAuthContext() {
  const context = await currentAuthContext();
  if (!context) redirect("/login");
  return context;
}
