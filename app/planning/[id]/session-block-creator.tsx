"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSessionBlock } from "@/app/actions/training-planning";

const CATEGORIES = [
  ["WARM_UP", "Warm-up"], ["COOLDOWN", "Cooldown"], ["APPARATUS", "Apparatus"], ["PHYSICAL_PREPARATION", "Physical preparation"],
  ["CONDITIONING", "Conditioning"], ["ROUTINES", "Routines"], ["TESTING", "Testing"], ["OTHER", "Other"],
] as const;
const BEHAVIOURS = [["GUIDED", "Guided sequence — no evidence counters"], ["EVIDENCE", "Skill evidence — Made / Missed / Spotted / Balk"]] as const;
const APPARATUS = [["", "No apparatus"], ["VAULT", "Vault"], ["UNEVEN_BARS", "Uneven Bars"], ["BALANCE_BEAM", "Balance Beam"], ["FLOOR_EXERCISE", "Floor Exercise"], ["PHYSICAL_PREPARATION", "Physical Preparation"]] as const;
const control = "rounded-lg border border-[var(--border)] px-3 py-2";

type Option = { id: string; name: string; apparatus?: string | null };
type OptimisticBlock = { id: string; title: string; category: string; durationMin: number | null; spaceName: string | null; state: "saving" | "saved" | "error"; error?: string };

export function SessionBlockCreator({ sessionId, spaces, gymnasts }: { sessionId: string; spaces: Option[]; gymnasts: Option[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [recent, setRecent] = useState<OptimisticBlock[]>([]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const temporaryId = `pending-${Date.now()}`;
    const spaceId = String(data.get("spaceId") ?? "");
    const optimistic: OptimisticBlock = {
      id: temporaryId,
      title: String(data.get("title") ?? "New block"),
      category: String(data.get("category") ?? "OTHER"),
      durationMin: data.get("durationMin") ? Number(data.get("durationMin")) : null,
      spaceName: spaces.find((space) => space.id === spaceId)?.name ?? null,
      state: "saving",
    };
    setRecent((current) => [...current, optimistic]);
    startTransition(async () => {
      const result = await createSessionBlock(data);
      if (!result?.block) {
        setRecent((current) => current.map((block) => block.id === temporaryId ? { ...block, state: "error", error: result?.error ?? "The block could not be added." } : block));
        return;
      }
      setRecent((current) => current.map((block) => block.id === temporaryId ? { ...optimistic, ...result.block, state: "saved" } : block));
      form.reset();
      router.refresh();
    });
  }

  return <div className="mt-4">
    {recent.length > 0 && <div className="mb-3 grid gap-2">{recent.map((block) => <div key={block.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3"><div><strong>{block.title}</strong><span className="ml-2 text-sm text-[var(--muted)]">{block.category.replaceAll("_", " ")}{block.spaceName ? ` · ${block.spaceName}` : ""}{block.durationMin ? ` · ${block.durationMin} min` : ""}</span></div><span className="text-xs font-semibold text-[var(--muted)]">{block.state === "saving" ? "Adding…" : block.state === "saved" ? "Added" : block.error}</span></div>)}</div>}
    <form onSubmit={submit} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <input type="hidden" name="sessionId" value={sessionId}/>
      <h3 className="font-semibold">Add training block</h3>
      <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <input name="title" required placeholder="Block title" className={control}/>
        <select name="category" className={control}>{CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select name="behaviour" required defaultValue="" className={control}><option value="" disabled>Choose block behaviour…</option>{BEHAVIOURS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        {spaces.length ? <select name="spaceId" className={control}><option value="">Area / apparatus…</option>{spaces.map((space) => <option key={space.id} value={space.id}>{space.name}{space.apparatus ? ` · ${space.apparatus.replaceAll("_", " ")}` : ""}</option>)}</select> : <select name="apparatus" className={control}>{APPARATUS.map(([value, label]) => <option key={value || "none"} value={value}>{label}</option>)}</select>}
        <input name="durationMin" type="number" min="1" max="480" placeholder="Minutes" className={control}/>
        <select name="targetGymnastId" className={control}><option value="">Whole group</option>{gymnasts.map((gymnast) => <option key={gymnast.id} value={gymnast.id}>{gymnast.name}</option>)}</select>
      </div>
      <input name="groupObjective" placeholder="Group objective" className={`${control} mt-2 w-full`}/>
      <textarea name="notes" placeholder="Block notes" className={`${control} mt-2 min-h-20 w-full`}/>
      <button disabled={pending} className="mt-3 rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Adding…" : "Add block"}</button>
    </form>
  </div>;
}
