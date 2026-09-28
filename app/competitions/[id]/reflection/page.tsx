import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { recordCompetitionAthleteReflection } from "@/app/actions/competitions";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
const apparatusLabel: Record<string,string> = { VAULT:"Vault", BARS:"Uneven Bars", BEAM:"Balance Beam", FLOOR:"Floor Exercise" };

export default async function CompetitionReflectionPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const event = await prisma.competitionEvent.findFirst({
    where: { id, organisationId: c.organisation.id },
    include: {
      entries: {
        include: {
          gymnast: true,
          apparatusPlans: { include: { performance: { include: { athleteReflection: true } } }, orderBy: { apparatus: "asc" } },
        },
        orderBy: { gymnast: { name: "asc" } },
      },
    },
  });
  if (!event) notFound();
  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <a href={"/competitions/" + event.id} className="text-sm font-semibold text-[var(--muted)]">← Competition workspace</a>
        <p className="mt-5 text-sm font-semibold text-[var(--muted)]">Competition day · Athlete reflection capture</p>
        <h1 className="mt-1 text-3xl font-semibold">{event.name}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">A focused surface for recording the gymnast’s own perspective. It stays separate from judge scores and coach observations. Athlete-account access is intentionally deferred to the later athlete/parent phase.</p>
        <div className="mt-6 grid gap-5">
          {event.entries.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-xl font-semibold">{entry.gymnast.name}</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {entry.apparatusPlans.map((plan) => {
                  const reflection = plan.performance?.athleteReflection;
                  return (
                    <form key={plan.id} action={recordCompetitionAthleteReflection} className="rounded-xl border border-[var(--border)] p-4">
                      <input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="planId" value={plan.id}/>
                      <p className="font-semibold">{apparatusLabel[plan.apparatus] ?? plan.apparatus}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{plan.routineNameSnapshot || "No saved routine selected"}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <input name="rating" type="number" min="1" max="5" step="1" defaultValue={reflection?.rating ?? ""} placeholder="How it felt 1–5" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                        <input name="confidence" type="number" min="1" max="10" step="1" defaultValue={reflection?.confidence ?? ""} placeholder="Confidence 1–10" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                      </div>
                      <select name="feltPrepared" defaultValue={reflection?.feltPrepared == null ? "" : reflection.feltPrepared ? "YES" : "NO"} className="mt-2 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"><option value="">Did you feel prepared? —</option><option value="YES">Yes</option><option value="NO">No</option></select>
                      <input name="whatFeltGood" defaultValue={reflection?.whatFeltGood ?? ""} placeholder="What felt good?" className="mt-2 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                      <input name="whatFeltHard" defaultValue={reflection?.whatFeltHard ?? ""} placeholder="What felt difficult?" className="mt-2 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                      <textarea name="athleteNote" defaultValue={reflection?.athleteNote ?? ""} placeholder="Anything else you want the coach to know?" className="mt-2 min-h-24 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                      <button className="mt-2 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save reflection</button>
                    </form>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
