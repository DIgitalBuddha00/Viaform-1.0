import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { cancelStaffInvitation, createStaffInvitation, resetStaffPin, setStaffActive, updateStaffAccess, updateStaffIdentity } from "@/app/actions/people";
import { COACHING_ROLES, DELEGATED_CAPABILITIES } from "@/app/lib/access-control";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { coachingRoleLabel } from "@/app/lib/navigation";

export const dynamic = "force-dynamic";
const capabilityLabel: Record<string,string> = {
  MANAGE_PEOPLE_AND_ROLES:"Manage people & roles",
  MANAGE_ROTATIONS:"Manage rotations",
  CONFIGURE_FACILITIES:"Configure facilities",
  MANAGE_PROGRAMMES_AND_METHODOLOGY:"Manage programmes & methodology",
};
const parse = (value: string) => { try { const x=JSON.parse(value); return Array.isArray(x)?x.filter((v):v is string=>typeof v==="string"):[]; } catch { return []; } };

export default async function PeoplePage({searchParams}:{searchParams:Promise<{invite?:string}>}) {
  const c=await requireAuthContext();
  if(!c.access.canManagePeopleAndRoles) notFound();
  const {invite}=await searchParams;
  const memberships=await prisma.organisationMembership.findMany({
    where:{organisationId:c.organisation.id},
    include:{user:true,groupAssignments:{include:{trainingGroup:true}}},
    orderBy:[{isActive:"desc"},{joinedAt:"asc"}],
  });
  const invitations=await prisma.staffInvitation.findMany({where:{organisationId:c.organisation.id,status:"PENDING",expiresAt:{gt:new Date()}},orderBy:{createdAt:"desc"}});
  return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}><section className="workspace-page"><a href="/more" className="workspace-back">← More</a><div className="workspace-hero"><div><p className="workspace-kicker">People & roles</p><h1>Club team</h1><p className="workspace-meta">{memberships.length} staff member{memberships.length===1?"":"s"}</p></div><div className="workspace-actions"><a href="/people/portal" className="workspace-button">Athlete & family access</a></div></div>

    <details className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <summary className="cursor-pointer font-semibold">+ Add staff account</summary>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Invite a coach to join this club. Set their access now; they choose their own Viaform password when they accept. PINs remain separate for coach switching on a shared device.</p>
      <form action={createStaffInvitation} className="mt-4 grid gap-4">
        <div className="grid gap-3 md:grid-cols-2"><input name="displayName" required placeholder="Coach name" className="rounded-xl border border-[var(--border)] px-3 py-3"/><input name="email" type="email" required placeholder="Coach email" className="rounded-xl border border-[var(--border)] px-3 py-3"/></div>
        <fieldset><legend className="text-sm font-semibold">Coaching roles</legend><div className="mt-2 flex flex-wrap gap-3">{COACHING_ROLES.map(role=><label key={role} className="text-sm"><input type="checkbox" name="coachingRoles" value={role} className="mr-2"/>{coachingRoleLabel(role)}</label>)}</div></fieldset>
        <fieldset><legend className="text-sm font-semibold">Delegated responsibilities</legend><div className="mt-2 flex flex-wrap gap-3">{DELEGATED_CAPABILITIES.map(cap=><label key={cap} className="text-sm"><input type="checkbox" name="delegatedCapabilities" value={cap} className="mr-2"/>{capabilityLabel[cap]}</label>)}</div></fieldset>
        {c.access.canManageAdministratorRole&&<label className="text-sm"><input type="checkbox" name="isAdministrator" className="mr-2"/>Administrator</label>}
        <button className="w-fit rounded-xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white">Create invitation</button>
      </form>
    </details>

    {invite&&<div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-sm font-semibold">Invitation ready</p><p className="mt-2 text-sm text-[var(--muted)]">Share this link with the coach. It expires in 7 days and lets them set their own password.</p><input readOnly value={invite} className="mt-3 w-full rounded-xl border border-[var(--border)] px-3 py-3 text-sm"/></div>}
    {invitations.length>0&&<section className="mt-7"><h2 className="text-lg font-semibold">Pending invitations</h2><div className="mt-3 grid gap-3">{invitations.map(inv=><article key={inv.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{inv.displayName||inv.email}</p><p className="text-sm text-[var(--muted)]">{inv.email} · expires {inv.expiresAt.toLocaleDateString()}</p></div><form action={cancelStaffInvitation}><input type="hidden" name="invitationId" value={inv.id}/><button className="text-sm text-[var(--muted)]">Cancel invitation</button></form></div></article>)}</div></section>}

    <div className="mt-8 grid gap-4">{memberships.map(m=>{const roles=parse(m.coachingRoles),caps=parse(m.delegatedCapabilities);return <article key={m.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{m.user.displayName}{m.id===c.membership.id?" · You":""}</h2><p className="mt-1 text-sm text-[var(--muted)]">{m.user.email}</p><p className="mt-2 text-xs text-[var(--muted)]">{m.isAdministrator?"Administrator · ":""}{roles.length?roles.map(coachingRoleLabel).join(" · "):"No coaching role"}{m.groupAssignments.length?" · "+m.groupAssignments.map(a=>a.trainingGroup.name).join(", "):""}</p></div><span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{m.isActive?"Active":"Inactive"}</span></div>
      <details className="mt-4 border-t border-[var(--border)] pt-4"><summary className="cursor-pointer text-sm font-semibold">Manage access</summary>
        <form action={updateStaffIdentity} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="membershipId" value={m.id}/><input name="displayName" required defaultValue={m.user.displayName} className="rounded-lg border border-[var(--border)] px-3 py-2"/><button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save name</button></form>
        <form action={updateStaffAccess} className="mt-4 grid gap-4">
          <input type="hidden" name="membershipId" value={m.id}/>
          <fieldset><legend className="text-xs font-semibold text-[var(--muted)]">Coaching roles</legend><div className="mt-2 flex flex-wrap gap-3">{COACHING_ROLES.map(role=><label key={role} className="text-sm"><input type="checkbox" name="coachingRoles" value={role} defaultChecked={roles.includes(role)} className="mr-2"/>{coachingRoleLabel(role)}</label>)}</div></fieldset>
          <fieldset><legend className="text-xs font-semibold text-[var(--muted)]">Delegated responsibilities</legend><div className="mt-2 flex flex-wrap gap-3">{DELEGATED_CAPABILITIES.map(cap=><label key={cap} className="text-sm"><input type="checkbox" name="delegatedCapabilities" value={cap} defaultChecked={caps.includes(cap)} className="mr-2"/>{capabilityLabel[cap]}</label>)}</div></fieldset>
          {c.access.canManageAdministratorRole&&<label className="text-sm"><input type="checkbox" name="isAdministrator" defaultChecked={m.isAdministrator} disabled={m.id===c.membership.id} className="mr-2"/>Administrator{m.id===c.membership.id?" · your own administrator access is protected":""}</label>}
          <button className="w-fit rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save roles & responsibilities</button>
        </form>
        <form action={resetStaffPin} className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4"><input type="hidden" name="membershipId" value={m.id}/><input name="pin" inputMode="numeric" pattern="[0-9]{4,8}" required placeholder="Coach PIN" className="rounded-lg border border-[var(--border)] px-3 py-2"/><button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Set / reset PIN</button></form>
        {m.id!==c.membership.id&&<form action={setStaffActive} className="mt-3"><input type="hidden" name="membershipId" value={m.id}/><input type="hidden" name="active" value={m.isActive?"false":"true"}/><button className="text-sm text-[var(--muted)]">{m.isActive?"Deactivate account":"Reactivate account"}</button></form>}
      </details>
    </article>})}</div>
  </section></AppShell>;
}
