import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
export const dynamic="force-dynamic";
export default async function GymnastOverview({params}:{params:Promise<{id:string}>}) {
 const c=await requireAuthContext(); if(!c.access.canUseCoachingWorkspace) notFound(); const {id}=await params;
 const gymnast=await prisma.gymnast.findFirst({where:{id,...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},include:{groups:{include:{trainingGroup:true},orderBy:{joinedAt:"asc"}},programmeAssignments:{include:{programme:true,stage:true}}}});
 if(!gymnast) notFound(); const primary=gymnast.groups.find(x=>x.isPrimary);
 return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}><section>
 <a href="/groups" className="text-sm font-semibold text-[var(--muted)]">← My Groups</a><p className="mt-5 text-sm font-semibold text-[var(--muted)]">Gymnast overview</p><h1 className="mt-2 text-3xl font-semibold">{gymnast.name}</h1><p className="mt-3 text-[var(--muted)]">{primary?"Primary group: "+primary.trainingGroup.name:gymnast.groups.length?"No primary group":"Currently unassigned"}</p>
 <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Programme context</h2><p className="mt-2 text-sm text-[var(--muted)]">{gymnast.programmeAssignments?gymnast.programmeAssignments.programme.name+(gymnast.programmeAssignments.stage?" · "+gymnast.programmeAssignments.stage.name:""):"Uses group context unless an individual pathway is assigned"}</p></article><article className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Groups</h2><div className="mt-4 flex flex-wrap gap-2">{gymnast.groups.length?gymnast.groups.map(g=><a key={g.trainingGroupId} href={"/groups/"+g.trainingGroupId} className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium">{g.trainingGroup.name}{g.isPrimary?" · primary":""}</a>):<span className="text-sm text-[var(--muted)]">No group memberships yet.</span>}</div></article>
 <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Training","Testing","Routines","Progress"].map(x=><article key={x} className="rounded-2xl border border-dashed border-[var(--border)] p-5"><h2 className="font-semibold">{x}</h2><p className="mt-2 text-sm text-[var(--muted)]">Summary and navigation will appear as this domain is rebuilt.</p></article>)}</div>
 </section></AppShell>;
}
