import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { resolveAccessProfile } from "./access-control";
import { logServerTiming } from "./server-performance";

const SESSION_COOKIE = "viaform_session";
const SESSION_DAYS = 30;
const ACTIVE_MEMBERSHIP_COOKIE="viaform_active_membership";

export function normaliseEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function makePassword(password: string) {
  const salt = randomBytes(24).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

export function makePin(pin:string){return makePassword(pin)}
export function verifyPin(pin:string,salt:string,hash:string){return verifyPassword(pin,salt,hash)}

export function verifyPassword(password: string, salt: string, hash: string) {
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, organisationId: string, activeMembershipId?: string | null) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await prisma.authSession.create({ data: { userId, organisationId, activeMembershipId: activeMembershipId ?? null, tokenHash: tokenHash(token), expiresAt } });
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
  jar.delete(ACTIVE_MEMBERSHIP_COOKIE);
}

export async function setActiveMembership(membershipId:string|null){const jar=await cookies(),token=jar.get(SESSION_COOKIE)?.value;if(token)await prisma.authSession.updateMany({where:{tokenHash:tokenHash(token)},data:{activeMembershipId:membershipId}});if(membershipId)jar.set(ACTIVE_MEMBERSHIP_COOKIE,membershipId,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/"});else jar.delete(ACTIVE_MEMBERSHIP_COOKIE);}

export async function currentAuthContext() {
  const authStartedAt=Date.now();
  const jar=await cookies(),token=jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const requested=jar.get(ACTIVE_MEMBERSHIP_COOKIE)?.value;
  const sessionStartedAt=Date.now();
  const session=await prisma.authSession.findUnique({
    where:{tokenHash:tokenHash(token)},
    select:{
      expiresAt:true,organisationId:true,activeMembershipId:true,
      user:{select:{id:true,email:true,displayName:true,isActive:true,passwordSalt:true,passwordHash:true}},
      organisation:{select:{id:true,name:true,slug:true}},
    },
  }).catch(()=>null);
  const sessionMs=Date.now()-sessionStartedAt;
  if(!session||session.expiresAt<=new Date()||!session.user.isActive||!session.organisationId||!session.organisation)return null;
  const activeId=requested??session.activeMembershipId;
  const membershipsStartedAt=Date.now();
  const memberships=await prisma.organisationMembership.findMany({
    where:{organisationId:session.organisationId,isActive:true,...(activeId?{OR:[{id:activeId},{userId:session.user.id}]}:{userId:session.user.id})},
    include:{user:true,organisation:true},
    take:activeId?2:1,
  });
  logServerTiming("auth.current",authStartedAt,{sessionMs,membershipsMs:Date.now()-membershipsStartedAt});
  const ownerMembership=memberships.find(m=>m.userId===session.user.id);
  if(!ownerMembership)return null;
  const activeMembership=activeId?memberships.find(m=>m.id===activeId)??ownerMembership:ownerMembership;
  return {user:activeMembership.user,loginUser:session.user,ownerMembership,membership:activeMembership,organisation:activeMembership.organisation,access:resolveAccessProfile(activeMembership)};
}

export async function requireAuthContext() {
  const context = await currentAuthContext();
  if (!context) redirect("/login");
  return context;
}

export async function currentPortalContext() {
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token)return null;
  const session=await prisma.authSession.findUnique({
    where:{tokenHash:tokenHash(token)},
    include:{user:{include:{athletePortalAccesses:{where:{status:"ACTIVE"},include:{gymnast:true,organisation:true},orderBy:{createdAt:"asc"}}}}}
  }).catch(()=>null);
  if(!session||session.expiresAt<=new Date()||!session.user.isActive)return null;
  const accesses=session.user.athletePortalAccesses.filter(x=>!session.organisationId||x.organisationId===session.organisationId);
  if(!accesses.length)return null;
  return {user:session.user,accesses,organisation:accesses[0].organisation};
}
export async function requirePortalContext(){
  const context=await currentPortalContext();
  if(!context)redirect("/login");
  return context;
}
