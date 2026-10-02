"use client";

import { useEffect, useState, useTransition } from "react";
import { PlanningSkillOption, searchPlanningSkills } from "@/app/actions/skill-search";

export function SkillSearch({
  name,
  apparatus,
  initialSelection,
  canonicalOnly = false,
}: {
  name: string;
  apparatus: string | null;
  initialSelection?: Pick<PlanningSkillOption, "id" | "name"> | null;
  canonicalOnly?: boolean;
}) {
  const [query, setQuery] = useState(initialSelection?.name ?? "");
  const [selectedId, setSelectedId] = useState(initialSelection?.id ?? "");
  const [matches, setMatches] = useState<PlanningSkillOption[]>([]);
  const [pending, startTransition] = useTransition();
  const normalized = query.trim();

  useEffect(() => {
    if (selectedId || normalized.length < 2) {
      setMatches([]);
      return;
    }
    const timeout = window.setTimeout(() => {
      startTransition(async () => setMatches(await searchPlanningSkills(normalized, apparatus, canonicalOnly)));
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [apparatus, canonicalOnly, normalized, selectedId]);

  return <div className="relative">
    <input type="hidden" name={name} value={selectedId}/>
    <input value={query} onChange={event => { setQuery(event.target.value); setSelectedId(""); }} placeholder="Search skill name, alias or FIG number…" autoComplete="off" className="w-full rounded-lg border border-[var(--border)] px-3 py-2"/>
    {normalized.length >= 2 && !selectedId && <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
      {pending && !matches.length ? <p className="px-3 py-2 text-sm text-[var(--muted)]">Searching…</p> : matches.length ? matches.map(skill => <button key={skill.id} type="button" onClick={() => { setSelectedId(skill.id); setQuery(skill.name); setMatches([]); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--surface-subtle)]"><span className="font-semibold">{skill.name}</span><span className="ml-2 text-xs text-[var(--muted)]">{skill.officialNumber ? "FIG " + skill.officialNumber : skill.provenance}</span></button>) : <p className="px-3 py-2 text-sm text-[var(--muted)]">No matching skills on this apparatus.</p>}
    </div>}
  </div>;
}
