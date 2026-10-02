import {notFound} from "next/navigation";
import {PortalShell} from "@/app/components/portal-shell";
import {PortalGymnastView} from "@/app/components/portal-gymnast-view";
import {requirePortalContext} from "@/app/lib/auth";
export const dynamic="force-dynamic";
export default async function FamilyPage({searchParams}:{searchParams:Promise<{gymnast?:string}>}){
 const c=await requirePortalContext(),q=await searchParams,accesses=c.accesses.filter(x=>x.relationship==="GUARDIAN");if(!accesses.length)notFound();
 const selected=accesses.find(x=>x.gymnastId===q.gymnast)??accesses[0];
 return <PortalShell displayName={c.user.displayName} organisationName={c.organisation.name} audience="GUARDIAN">
  <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--accent-strong)]">Family view</p><h1 className="mt-1 text-3xl font-semibold">{accesses.length>1?"Your gymnasts":"Training & progress"}</h1><p className="mt-2 text-sm text-[var(--muted)]">Shared training context, goals, club recognition and progress.</p></div>
  {accesses.length>1&&<nav className="flex max-w-full gap-2 overflow-x-auto pb-1">{accesses.map(a=><a key={a.id} href={"/family?gymnast="+a.gymnastId} className={"whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold "+(a.id===selected.id?"bg-[var(--foreground)] text-[var(--background)]":"border-[var(--border)] bg-[var(--surface)]")}>{a.gymnast.name}</a>)}</nav>}</div>
  <nav className="mt-5 flex gap-2 overflow-x-auto pb-2"><a href="#training" className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">Training</a><a href="#culture" className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">Club</a><a href="#goals" className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">Goals</a><a href="#progress" className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">Progress</a></nav>
  <section className="mt-4"><PortalGymnastView gymnastId={selected.gymnastId} organisationId={selected.organisationId} audience="GUARDIAN"/></section>
 </PortalShell>;
}