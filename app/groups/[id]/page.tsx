import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";
export const dynamic="force-dynamic";
export default async function GroupOverview({params}:{params:Promise<{id:string}>}) {
 const c=await requireAuthContext(); if(!c.access.canUseCoachingWorkspace) notFound(); const {id}=await params;
 const group=await prisma.trainingGroup.findFirst({where:{id,...groupScopeWhere(c.organisation.id,c.membership.id,c.access)},include:{memberships:{include:{gymnast:true},orderBy:{joinedAt:"asc"}},coachAssignments:{include:{membership:{include:{user:true}}}}}});
 if(!group) notFound();
 return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}><section>
 <a href="/groups" className="text-sm font-semibold text-[var(--muted)]">← My Groups</a><p className="mt-5 text-sm font-semibold text-[var(--muted)]">Group overview</p><h1 className="mt-2 text-3xl font-semibold">{group.name}</h1><p className="mt-3 text-[var(--muted)]">{group.memberships.length} gymnasts · {group.coachAssignments.length} assigned coaches</p>
 <div className="mt-8 grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Roster</h2><div className="mt-4 grid gap-2">{group.memberships.length?group.memberships.map(m=><a key={m.gymnastId} href={"/gymnasts/"+m.gymnastId} className="rounded-xl border border-[var(--border)] px-4 py-3 font-medium">{m.gymnast.name}{m.isPrimary?<span className="ml-2 text-xs font-normal text-[var(--muted)]">Primary group</span>:null}</a>):<p className="text-sm text-[var(--muted)]">No gymnasts assigned.</p>}</div></article>
 <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Coaching team</h2><div className="mt-4 grid gap-2">{group.coachAssignments.length?group.coachAssignments.map(a=><div key={a.membershipId} className="rounded-xl border border-[var(--border)] px-4 py-3">{a.membership.user.displayName}</div>):<p className="text-sm text-[var(--muted)]">No coaches explicitly assigned. Head Coach access remains available.</p>}</div></article></div>
 <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Planning","Training","Testing","Progress"].map(x=><article key={x} className="rounded-2xl border border-dashed border-[var(--border)] p-5"><h2 className="font-semibold">{x}</h2><p className="mt-2 text-sm text-[var(--muted)]">Connects here when this domain is built.</p></article>)}</div>
 </section></AppShell>;
}
