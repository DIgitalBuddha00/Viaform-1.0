"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  assignGymnastToRotationGroup,
  createRotationAssignment,
  createRotationGroup,
  deleteRotationAssignment,
  removeGymnastFromRotationGroup,
} from "@/app/actions/rotations";

type RotationGroup = { id: string; name: string; gymnastIds: string[] };
type Assignment = {
  id: string;
  rotationGroupId: string;
  blockId: string | null;
  trainingSpaceId: string | null;
  startTime: string;
  endTime: string;
  notes: string | null;
};
type NamedOption = { id: string; name: string };

const control = "min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2";

function addMinutes(time: string, amount: number, limit: string) {
  const [hour, minute] = time.split(":").map(Number);
  const [limitHour, limitMinute] = limit.split(":").map(Number);
  const next = Math.min(hour * 60 + minute + amount, limitHour * 60 + limitMinute);
  return `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
}

export function SessionRotationEditor({
  sessionId,
  trainingGroupName,
  sessionStart,
  sessionEnd,
  spaces,
  blocks,
  gymnasts,
  initialGroups,
  initialAssignments,
  canEdit,
}: {
  sessionId: string;
  trainingGroupName: string;
  sessionStart: string;
  sessionEnd: string;
  spaces: NamedOption[];
  blocks: NamedOption[];
  gymnasts: NamedOption[];
  initialGroups: RotationGroup[];
  initialAssignments: Assignment[];
  canEdit: boolean;
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const defaultEnd = addMinutes(sessionStart, 20, sessionEnd);
  const sortedAssignments = useMemo(
    () => [...assignments].sort((a, b) => a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime)),
    [assignments],
  );
  const assignedGymnastIds = new Set(groups.flatMap((group) => group.gymnastIds));

  function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createRotationAssignment(data);
      if (result.error || !result.assignment) {
        setNotice(result.error ?? "The rotation could not be added.");
        return;
      }
      if (result.group) {
        setGroups((current) => [
          ...current.filter((group) => group.id !== result.group?.id).map((group) => ({ ...group, gymnastIds: [] })),
          { ...result.group!, gymnastIds: gymnasts.map((gymnast) => gymnast.id) },
        ]);
      }
      setAssignments((current) => [...current, result.assignment!]);
      setNotice("Rotation added and visible below.");
      form.reset();
    });
  }

  function addGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createRotationGroup(data);
      if (result.error || !result.group) {
        setNotice(result.error ?? "The group could not be created.");
        return;
      }
      setGroups((current) => [...current, { ...result.group!, gymnastIds: [] }]);
      setNotice(`${result.group.name} is ready. Add gymnasts, then assign its time and area.`);
      form.reset();
    });
  }

  function addGymnast(groupId: string, gymnastId: string) {
    if (!gymnastId) return;
    const data = new FormData();
    data.set("sessionId", sessionId);
    data.set("rotationGroupId", groupId);
    data.set("gymnastId", gymnastId);
    startTransition(async () => {
      const result = await assignGymnastToRotationGroup(data);
      if (result.error) return setNotice(result.error);
      setGroups((current) => current.map((group) => group.id === groupId ? { ...group, gymnastIds: [...group.gymnastIds.filter((id) => id !== gymnastId), gymnastId] } : { ...group, gymnastIds: group.gymnastIds.filter((id) => id !== gymnastId) }));
      setNotice("Gymnast added to the rotation group.");
    });
  }

  function removeGymnast(groupId: string, gymnastId: string) {
    const data = new FormData();
    data.set("sessionId", sessionId);
    data.set("gymnastId", gymnastId);
    startTransition(async () => {
      const result = await removeGymnastFromRotationGroup(data);
      if (result.error) return setNotice(result.error);
      setGroups((current) => current.map((group) => group.id === groupId ? { ...group, gymnastIds: group.gymnastIds.filter((id) => id !== gymnastId) } : group));
      setNotice("Gymnast removed from the rotation group.");
    });
  }

  function removeAssignment(assignmentId: string) {
    const data = new FormData();
    data.set("sessionId", sessionId);
    data.set("assignmentId", assignmentId);
    startTransition(async () => {
      const result = await deleteRotationAssignment(data);
      if (result.error) return setNotice(result.error);
      setAssignments((current) => current.filter((assignment) => assignment.id !== assignmentId));
      setNotice("Rotation removed.");
    });
  }

  const groupName = (id: string) => groups.find((group) => group.id === id)?.name ?? "Group";
  const optionName = (options: NamedOption[], id: string | null, fallback: string) => options.find((option) => option.id === id)?.name ?? fallback;

  return <div>
    {canEdit && spaces.length > 0 && <form onSubmit={addAssignment} className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="sessionId" value={sessionId}/>
      <label className="grid gap-1 text-xs font-semibold">Group
        <select key={groups.map((group) => group.id).join(":")} name="rotationGroupId" required className={control} defaultValue={groups[0]?.id ?? "WHOLE_SESSION_GROUP"}>
          {!groups.some((group) => group.name === trainingGroupName) && <option value="WHOLE_SESSION_GROUP">{trainingGroupName} · whole group</option>}
          {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-semibold">Area / apparatus
        <select name="spaceId" required className={control} defaultValue=""><option value="" disabled>Choose area…</option>{spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}</select>
      </label>
      <label className="grid gap-1 text-xs font-semibold">From<input name="startTime" type="time" min={sessionStart} max={sessionEnd} required defaultValue={sessionStart} className={control}/></label>
      <label className="grid gap-1 text-xs font-semibold">To<input name="endTime" type="time" min={sessionStart} max={sessionEnd} required defaultValue={defaultEnd} className={control}/></label>
      <label className="grid gap-1 text-xs font-semibold md:col-span-2">Linked training block (optional)
        <select name="blockId" className={control} defaultValue=""><option value="">No linked block</option>{blocks.map((block) => <option key={block.id} value={block.id}>{block.name}</option>)}</select>
      </label>
      <label className="grid gap-1 text-xs font-semibold md:col-span-2">Notes<input name="notes" placeholder="Warm-up, changeover, coaching note…" className={control}/></label>
      <button disabled={pending} className="workspace-button workspace-button-primary md:w-fit">{pending ? "Saving…" : "Add rotation"}</button>
    </form>}

    {canEdit && !spaces.length && <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">Assign a facility with active training areas before adding a rotation.</p>}
    {notice && <p role="status" className="mt-3 text-sm font-medium text-[var(--accent-strong)]">{notice}</p>}

    <div className="mt-4 grid gap-2">
      {sortedAssignments.map((assignment) => <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
        <div><strong>{assignment.startTime}–{assignment.endTime} · {optionName(spaces, assignment.trainingSpaceId, "Open area")}</strong><p className="mt-1 text-sm text-[var(--muted)]">{groupName(assignment.rotationGroupId)}{assignment.blockId ? ` · ${optionName(blocks, assignment.blockId, "Training block")}` : ""}{assignment.notes ? ` · ${assignment.notes}` : ""}</p></div>
        {canEdit && <button type="button" disabled={pending} onClick={() => removeAssignment(assignment.id)} className="text-sm text-[var(--muted)]">Remove</button>}
      </div>)}
      {!sortedAssignments.length && <div className="empty-state">No rotation assignments yet. Choose a group, area, and time above.</div>}
    </div>

    {canEdit && <details className="mt-4 rounded-xl border border-[var(--border)] p-3">
      <summary className="cursor-pointer text-sm font-semibold">Split the session into rotation groups</summary>
      <form onSubmit={addGroup} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="sessionId" value={sessionId}/><input name="name" required maxLength={80} placeholder="Group name, e.g. Blue" className={control}/><button disabled={pending} className="workspace-button">Add group</button></form>
      <div className="mt-3 grid gap-3">{groups.map((group) => {
        const available = gymnasts.filter((gymnast) => !assignedGymnastIds.has(gymnast.id));
        return <div key={group.id} className="rounded-xl border border-[var(--border)] p-3"><strong>{group.name}</strong><div className="mt-2 flex flex-wrap gap-2">{group.gymnastIds.map((id) => <button type="button" key={id} disabled={pending} onClick={() => removeGymnast(group.id, id)} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{optionName(gymnasts, id, "Gymnast")} ×</button>)}{!group.gymnastIds.length && <span className="text-sm text-[var(--muted)]">No gymnasts assigned</span>}</div>{available.length > 0 && <select aria-label={`Add gymnast to ${group.name}`} defaultValue="" onChange={(event) => { addGymnast(group.id, event.target.value); event.currentTarget.value = ""; }} className={`${control} mt-3 text-sm`}><option value="">Add gymnast…</option>{available.map((gymnast) => <option key={gymnast.id} value={gymnast.id}>{gymnast.name}</option>)}</select>}</div>;
      })}</div>
    </details>}
  </div>;
}
