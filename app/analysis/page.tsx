import {AppShell} from "@/app/components/app-shell";
import {requireAuthContext} from "@/app/lib/auth";

export const dynamic="force-dynamic";

export default async function AnalysisPage(){
  const c=await requireAuthContext();
  if(!c.access.canUseCoachingWorkspace) return null;
  const areas=[
    {label:"Testing",href:"/testing/results",description:"Review measurements, testing history and evidence coverage."},
    {label:"Training",href:"/training",description:"Review training evidence and completed sessions."},
    {label:"Routines",href:"/routines",description:"Inspect routine construction, evaluation and linked training evidence."},
    {label:"Competitions",href:"/competitions",description:"Review competition preparation, results and recorded evidence."},
  ];
  return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
    <section className="workspace-page">
      <a href="/more" className="workspace-back">← More</a>
      <div className="workspace-hero"><div><p className="workspace-kicker">Analysis</p><h1>Explore the evidence</h1><p className="workspace-meta">Compare context, change and recorded evidence without turning it into a ranking.</p></div></div>
      <article className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold text-[var(--muted)]">Evidence snapshot</p>
        <h2 className="mt-1 text-xl font-semibold">Start from the evidence Viaform already holds</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">Analysis brings together evidence from the working areas of Viaform. The underlying record stays with Training, Testing, Routines or Competitions; this workspace is for exploring relationships, differences and change over time.</p>
      </article>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{areas.map(area=><a key={area.href} href={area.href} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><strong>{area.label}</strong><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{area.description}</p><span className="mt-4 block text-sm font-semibold">Open →</span></a>)}</div>
    </section>
  </AppShell>;
}
