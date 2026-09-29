import { notFound } from "next/navigation";
import { acceptStaffInvitation } from "@/app/actions/people";
import { prisma } from "@/app/lib/prisma";
import { createHash } from "node:crypto";

export const dynamic="force-dynamic";
const tokenHash=(token:string)=>createHash("sha256").update(token).digest("hex");

export default async function StaffInvitePage({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{error?:string}>}){
  const {token}=await params,{error}=await searchParams;
  const invitation=await prisma.staffInvitation.findUnique({where:{tokenHash:tokenHash(token)},include:{organisation:true}});
  if(!invitation)notFound();
  const expired=invitation.status!=="PENDING"||invitation.expiresAt<=new Date();
  const existing=await prisma.user.findUnique({where:{email:invitation.email},select:{id:true}});
  return <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12"><section className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Viaform invitation</p>
    <h1 className="mt-3 text-3xl font-semibold">{expired?"Invitation unavailable":"Join "+invitation.organisation.name}</h1>
    {expired?<p className="mt-3 text-sm text-[var(--muted)]">This invitation has expired or has already been used. Ask the club administrator for a new invitation.</p>:<>
      <p className="mt-3 text-sm text-[var(--muted)]">Invited as {invitation.displayName||invitation.email} · {invitation.email}</p>
      {error&&<p className="mt-5 rounded-xl border border-[var(--border)] p-3 text-sm">{error==="password"?"That password does not match the existing Viaform account for this email.":error==="expired"?"This invitation is no longer available.":"Use a password of at least 10 characters."}</p>}
      <form action={acceptStaffInvitation} className="mt-7 grid gap-4">
        <input type="hidden" name="token" value={token}/>
        {!existing&&<label className="grid gap-2 text-sm font-medium">Your name<input name="displayName" defaultValue={invitation.displayName??""} required className="rounded-xl border border-[var(--border)] px-4 py-3"/></label>}
        <label className="grid gap-2 text-sm font-medium">{existing?"Your existing Viaform password":"Choose your Viaform password"}<input name="password" type="password" minLength={10} required className="rounded-xl border border-[var(--border)] px-4 py-3"/></label>
        <button className="mt-2 rounded-xl bg-[var(--foreground)] px-5 py-3 font-semibold text-white">{existing?"Confirm and join club":"Create account and join club"}</button>
      </form>
    </>}
  </section></main>;
}
