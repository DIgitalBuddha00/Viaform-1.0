"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClubRotationSlot, deleteClubRotationSlot, updateClubRotationSlot } from "@/app/actions/club-rotations";
import { clock, minutes } from "@/app/lib/club-rotation-time";

type Space = { id: string; name: string; apparatus: string | null; shareable: boolean };
type Group = { id: string; name: string };
type Coach = { id: string; name: string };
type Slot = { id: string; variantIndex: number; trainingSpaceId: string; trainingGroupId: string; coachMembershipId: string | null; startTime: string; endTime: string; notes: string | null };
const control = "min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm";
const palette = ["#dcece7", "#f3dfec", "#e0e7f5", "#f5e8d2", "#dfefe9", "#eee1f5", "#f5e0dc", "#e3ebd6", "#e4e7f0", "#f4e9e4"];
const rowHeight = 17;

export function RotationBoard({ planId, day, variantCount, spaces, groups, coaches, slots, canManage, start, end }: {
  planId: string; day: string; variantCount: number; spaces: Space[]; groups: Group[]; coaches: Coach[]; slots: Slot[];
  canManage: boolean; start: string; end: string;
}) {
  const router = useRouter();
  const [pending, transition] = useTransition();
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [coachId, setCoachId] = useState("");
  const [duration, setDuration] = useState(20);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(true);
  const [onlyVariant, setOnlyVariant] = useState(0);
  const first = minutes(from), last = minutes(to);
  const safeRange = Number.isFinite(first) && Number.isFinite(last) && last > first && last - first <= 900;
  const ticks = safeRange ? Math.ceil((last - first) / 5) : 0;
  const variants = showAll ? Array.from({ length: variantCount }, (_, i) => i) : [onlyVariant];
  const chosen = slots.find(slot => slot.id === selected);

  function place(variantIndex: number, trainingSpaceId: string, offset: number) {
    if (!canManage || pending || !groupId || !safeRange) return;
    const startTime = clock(first + offset * 5), endTime = clock(first + offset * 5 + duration);
    if (minutes(endTime) > last) { setNotice("Block extends past the board hours."); return; }
    const data = new FormData();
    for (const [key, value] of Object.entries({ planId, variantIndex: String(variantIndex), dayOfWeek: day, trainingGroupId: groupId, trainingSpaceId, coachMembershipId: coachId, startTime, endTime })) data.set(key, value);
    transition(async () => {
      const result = await createClubRotationSlot(data);
      setNotice(result.error ?? "");
      if (!result.error) router.refresh();
    });
  }

  function save(data: FormData) {
    transition(async () => {
      const result = await updateClubRotationSlot(data);
      setNotice(result.error ?? "");
      if (!result.error) { setSelected(null); router.refresh(); }
    });
  }

  function remove() {
    if (!chosen) return;
    const data = new FormData(); data.set("planId", planId); data.set("slotId", chosen.id);
    transition(async () => {
      const result = await deleteClubRotationSlot(data);
      setNotice(result.error ?? "");
      if (!result.error) { setSelected(null); router.refresh(); }
    });
  }

  return <div className="mt-4">
    <div className="flex flex-wrap items-end gap-2">
      {canManage && <><label className="grid gap-1 text-xs font-semibold">Group<select className={control} value={groupId} onChange={e => setGroupId(e.target.value)}>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-semibold">Coach<select className={control} value={coachId} onChange={e => setCoachId(e.target.value)}><option value="">No coach</option>{coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-semibold">Minutes<select className={control} value={duration} onChange={e => setDuration(Number(e.target.value))}>{[5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120].map(n => <option key={n} value={n}>{n}</option>)}</select></label></>}
      <label className="grid gap-1 text-xs font-semibold">From<input type="time" step="300" className={control} value={from} onChange={e => setFrom(e.target.value)}/></label>
      <label className="grid gap-1 text-xs font-semibold">To<input type="time" step="300" className={control} value={to} onChange={e => setTo(e.target.value)}/></label>
      {variantCount > 1 && <button type="button" className="workspace-button" onClick={() => setShowAll(!showAll)}>{showAll ? "One rota" : "Compare rotas"}</button>}
      {!showAll && variantCount > 1 && <select className={control} value={onlyVariant} onChange={e => setOnlyVariant(Number(e.target.value))}>{Array.from({ length: variantCount }, (_, i) => <option key={i} value={i}>Rota {i + 1}</option>)}</select>}
    </div>
    {notice && <p role="status" className="mt-2 text-sm text-[var(--accent-strong)]">{notice}</p>}
    {!safeRange && <p className="mt-3 text-sm">Choose a valid time range.</p>}
    {safeRange && <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]"><div className="flex w-max gap-5 p-3">
      {variants.map(variant => <section key={variant} aria-label={`Rota ${variant + 1}`} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
        <h3 className="pb-2 text-center text-sm font-bold">Rota {variant + 1}</h3>
        <div className="flex"><div className="w-14 shrink-0"><div className="h-11"/>
          <div className="relative" style={{ height: ticks * rowHeight }}>{Array.from({ length: ticks + 1 }, (_, i) => i).filter(i => (first + i * 5) % 15 === 0).map(i => <span key={i} className="absolute left-0 text-[10px] text-[var(--muted)]" style={{ top: i * rowHeight - 6 }}>{clock(first + i * 5)}</span>)}</div></div>
          {spaces.map(space => <div key={space.id} className="w-28 shrink-0 border-l border-[var(--border)] sm:w-32"><div className="flex h-11 items-center justify-center border-b border-[var(--border)] px-1 text-center text-xs font-bold leading-tight">{space.name}</div>
            <div className="relative cursor-crosshair" style={{ height: ticks * rowHeight, backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${rowHeight - 1}px, var(--border) ${rowHeight - 1}px, var(--border) ${rowHeight}px)` }} onClick={e => { const y = e.clientY - e.currentTarget.getBoundingClientRect().top; place(variant, space.id, Math.max(0, Math.min(ticks - 1, Math.floor(y / rowHeight)))); }}>
              {slots.filter(s => s.variantIndex === variant && s.trainingSpaceId === space.id && minutes(s.endTime) > first && minutes(s.startTime) < last).map(s => {
                const groupIndex = groups.findIndex(g => g.id === s.trainingGroupId);
                const top = Math.max(0, (minutes(s.startTime) - first) / 5 * rowHeight);
                const bottom = Math.min(ticks * rowHeight, (minutes(s.endTime) - first) / 5 * rowHeight);
                return <button type="button" key={s.id} className="absolute inset-x-0.5 z-10 overflow-hidden rounded-md border border-[var(--border)] px-1 text-left text-[10px] leading-tight shadow-sm" style={{ top, height: Math.max(8, bottom - top - 2), backgroundColor: palette[(groupIndex + palette.length) % palette.length] }} onClick={e => { e.stopPropagation(); setSelected(s.id); setNotice(""); }}>
                  <strong className="block truncate">{groups[groupIndex]?.name ?? "Group"}</strong><span className="block truncate">{s.startTime}–{s.endTime}{s.coachMembershipId ? " · " + (coaches.find(c => c.id === s.coachMembershipId)?.name ?? "Coach") : ""}</span>
                </button>;
              })}
            </div>
          </div>)}
        </div>
      </section>)}
    </div></div>}
    {canManage && <p className="mt-2 text-xs text-[var(--muted)]">Select a group and tap the apparatus at its start time. Tap a block to edit it.</p>}
    {chosen && <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><h3 className="font-semibold">Edit block</h3><form action={save} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="planId" value={planId}/><input type="hidden" name="slotId" value={chosen.id}/><input type="hidden" name="dayOfWeek" value={day}/><input type="hidden" name="variantIndex" value={chosen.variantIndex}/>
      <select name="trainingGroupId" defaultValue={chosen.trainingGroupId} className={control}>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
      <select name="trainingSpaceId" defaultValue={chosen.trainingSpaceId} className={control}>{spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <select name="coachMembershipId" defaultValue={chosen.coachMembershipId ?? ""} className={control}><option value="">No coach</option>{coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <label className="grid gap-1 text-xs">Start<input name="startTime" type="time" step="300" required defaultValue={chosen.startTime} className={control}/></label>
      <label className="grid gap-1 text-xs">End<input name="endTime" type="time" step="300" required defaultValue={chosen.endTime} className={control}/></label>
      <input name="notes" defaultValue={chosen.notes ?? ""} placeholder="Notes" className={control}/>
      {canManage && <button disabled={pending} className="workspace-button workspace-button-primary">Save block</button>}
    </form><div className="mt-3 flex gap-3">{canManage && <button type="button" disabled={pending} onClick={remove} className="workspace-button">Remove block</button>}<button type="button" onClick={() => setSelected(null)} className="workspace-button">Close</button></div></div>}
  </div>;
}
