import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export default async function MorePage() {
  const c = await requireAuthContext();
  const cards = [
    { label: "People & roles", href: "/people", detail: "Staff accounts, coaching roles, delegated responsibilities and access.", show: c.access.canManagePeopleAndRoles },
    { label: "Programmes", href: "/programmes", detail: "Club-owned coaching programmes, stages and pathway context.", show: c.access.canManageProgrammesAndMethodology || c.access.canUseCoachingWorkspace },
    { label: "Programme leadership", href: "/programme-leads", detail: "Assign Programme Leads and Head Coaches to explicit programme responsibilities.", show: c.access.canManageProgrammesAndMethodology },
    { label: "Methodology", href: "/methodology", detail: "Sourced club coaching approaches, boundaries, uncertainty and review.", show: c.access.canUseCoachingWorkspace || c.access.canManageProgrammesAndMethodology },
    { label: "Rulesets", href: "/rulesets", detail: "Enable and assign Viaform-managed governing-body rulesets.", show: c.access.canManageProgrammesAndMethodology || c.access.canUseCoachingWorkspace },
    { label: "Facilities & equipment", href: "/facilities", detail: "Training spaces, equipment, capacities and availability.", show: c.access.canConfigureFacilities || c.access.canUseCoachingWorkspace },
  ].filter((card) => card.show);
  return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}><section>
    <p className="text-sm font-semibold text-[var(--muted)]">More</p>
    <h1 className="mt-2 text-3xl font-semibold">Club operations</h1>
    <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Configure the people, pathways and training environment that support day-to-day coaching. Access follows administrator and delegated responsibilities.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-2">{cards.map((card)=><a key={card.href} href={card.href} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="text-lg font-semibold">{card.label}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.detail}</p><span className="mt-4 block text-sm font-semibold">Open →</span></a>)}</div>
    {!cards.length&&<p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">No club-operation responsibilities are currently assigned to this account.</p>}
  </section></AppShell>;
}
