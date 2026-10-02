import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { addCoachingMemoryObservation, saveTrainingSessionReview } from "@/app/actions/training-review";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

const outcomeLabel: Record<string,string> = { MADE:"Made", MISSED:"Missed", SPOTTED:"Spotted", BALK:"Balk" };

export default async function TrainingReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const session = await prisma.trainingSession.findFirst({
    where: {
      id,
      organisationId: c.organisation.id,
      status: "COMPLETED",
      trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
    },
    include: {
      trainingGroup: true,
      blocks: { orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] },
      gymnasts: { include: { gymnast: true }, orderBy: { assignedAt: "asc" } },
      evidence: { orderBy: { recordedAt: "asc" } },
      attendance: true,
      checkIns: { orderBy: { recordedAt: "asc" } },
    },
  });
  if (!session) notFound();
  const [review, memories] = await Promise.all([
    prisma.trainingSessionReview.findUnique({ where: { sessionId: id } }),
    prisma.coachingMemoryObservation.findMany({ where: { organisationId: c.organisation.id, sessionId: id }, orderBy: { createdAt: "desc" } }),
  ]);
  const gymnastNames = new Map(session.gymnasts.map(g => [g.gymnastId, g.gymnast.name]));
  const counts = new Map<string,number>();
  for (const e of session.evidence) counts.set(e.outcome, (counts.get(e.outcome) ?? 0) + 1);
  const attended = session.attendance.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
  const stateChanges = session.gymnasts.map(entry => {
    const checks = session.checkIns.filter(check => check.gymnastId === entry.gymnastId);
    if (checks.length < 2) return null;
    const first = checks[0], last = checks[checks.length - 1];
    const changes = [
      first.feeling !== last.feeling && first.feeling && last.feeling ? "feeling " + first.feeling.replaceAll("_"," ").toLowerCase() + " → " + last.feeling.replaceAll("_"," ").toLowerCase() : null,
      first.confidence !== last.confidence && first.confidence && last.confidence ? "confidence " + first.confidence.toLowerCase() + " → " + last.confidence.toLowerCase() : null,
      first.fatigue !== last.fatigue && first.fatigue && last.fatigue ? "fatigue " + first.fatigue.replaceAll("_"," ").toLowerCase() + " → " + last.fatigue.replaceAll("_"," ").toLowerCase() : null,
    ].filter(Boolean);
    return changes.length ? { name: entry.gymnast.name, changes } : null;
  }).filter(Boolean) as {name:string;changes:string[]}[];

  return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
    <section className="workspace-page">
      <Link href="/training" className="workspace-back">← Training</Link>
      <div className="workspace-hero"><div><p className="workspace-kicker">Finish & Review</p><h1>{session.title}</h1><p className="workspace-meta">{session.trainingGroup.name} · {session.sessionDate.toISOString().slice(0,10)} · {session.startTime}–{session.endTime}</p></div><Link href={"/training/"+session.id} className="workspace-button">Open session record</Link></div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="workspace-kicker">What happened</p><h2 className="mt-1 text-xl font-semibold">Session snapshot</h2><p className="mt-3 text-sm text-[var(--muted)]">{attended} present / late · {session.blocks.length} blocks · {session.evidence.length} evidence records</p><div className="mt-4 flex flex-wrap gap-2">{["MADE","MISSED","SPOTTED","BALK"].map(o=><span key={o} className="rounded-full border border-[var(--border)] px-3 py-1 text-sm">{outcomeLabel[o]} {counts.get(o)??0}</span>)}</div></article>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="workspace-kicker">Changes during training</p><h2 className="mt-1 text-xl font-semibold">Athlete State context</h2>{stateChanges.length?<div className="mt-3 grid gap-2">{stateChanges.map(x=><div key={x.name} className="text-sm"><strong>{x.name}</strong><span className="ml-2 text-[var(--muted)]">{x.changes.join(" · ")}</span></div>)}</div>:<p className="mt-3 text-sm text-[var(--muted)]">No within-session Athlete State changes were captured. Athlete State here is treated as gymnast self-report from the Live Training card.</p>}</article>
      </div>

      <article className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="workspace-kicker">Coach review</p><h2 className="mt-1 text-xl font-semibold">Evidence captured → carry forward</h2><p className="mt-2 text-sm text-[var(--muted)]">Record what is worth carrying forward. This does not automatically change a future plan, routine, priority or readiness decision.</p><form action={saveTrainingSessionReview} className="mt-4 grid gap-4"><input type="hidden" name="sessionId" value={session.id}/><label className="grid gap-2 text-sm font-semibold">Session review<textarea name="summary" defaultValue={review?.summary??""} rows={4} className="rounded-xl border border-[var(--border)] bg-transparent p-3 font-normal" placeholder="What mattered from this session?"/></label><label className="grid gap-2 text-sm font-semibold">Carry forward<textarea name="carryForward" defaultValue={review?.carryForward??""} rows={3} className="rounded-xl border border-[var(--border)] bg-transparent p-3 font-normal" placeholder="Anything worth remembering for the next relevant coaching context?"/></label><div><button className="workspace-button workspace-button-primary">Save review</button></div></form></article>

      <article className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="workspace-kicker">Coaching Memory</p><h2 className="mt-1 text-xl font-semibold">Remember something from today</h2><p className="mt-2 text-sm text-[var(--muted)]">Coach-authored observations stay distinct from Athlete State and attempt evidence.</p><form action={addCoachingMemoryObservation} className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]"><input type="hidden" name="sessionId" value={session.id}/><select name="gymnastId" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"><option value="">Whole session / group</option>{session.gymnasts.map(g=><option key={g.gymnastId} value={g.gymnastId}>{g.gymnast.name}</option>)}</select><input name="observation" required className="rounded-xl border border-[var(--border)] bg-transparent p-3 text-sm" placeholder="Coaching observation to remember"/><button className="workspace-button workspace-button-primary">Remember this</button></form>{memories.length>0&&<div className="mt-5 grid gap-2">{memories.map(m=><div key={m.id} className="rounded-xl border border-[var(--border)] p-3 text-sm"><strong>{m.gymnastId ? gymnastNames.get(m.gymnastId) ?? "Gymnast" : "Group / session"}</strong><p className="mt-1">{m.observation}</p><small className="mt-1 block text-[var(--muted)]">{m.createdAt.toISOString().slice(0,16).replace("T"," ")}</small></div>)}</div>}</article>

      <p className="mt-6 text-sm text-[var(--muted)]">Evidence records what happened. Athlete State is gymnast self-report by Live Training convention. Coaching Memory is coach-authored context. Coach judgement remains required.</p>
    </section>
  </AppShell>;
}
