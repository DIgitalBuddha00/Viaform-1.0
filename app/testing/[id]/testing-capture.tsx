"use client";

import { useEffect, useState } from "react";
import { recordTestingResult } from "@/app/actions/testing";

type Props = {
  sessionId: string;
  gymnastId: string;
  metricId: string;
  captureMode: string;
  unit: string | null;
  durationSeconds: number | null;
  initialValue: number | null;
  initialNote: string | null;
  scoringMode: string;
  initialPoints: number | null;
  batteryPoints: number | null;
  disabled: boolean;
};

function clock(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe - minutes * 60;
  return String(minutes).padStart(2, "0") + ":" + remainder.toFixed(1).padStart(4, "0");
}

export function TestingCapture(props: Props) {
  const [value, setValue] = useState(props.initialValue === null ? "" : String(props.initialValue));
  const [time, setTime] = useState(props.captureMode === "COUNTDOWN_TALLY" ? props.durationSeconds ?? 60 : 0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const step = props.captureMode === "STOPWATCH" ? 0.1 : -0.1;
    const timer = window.setInterval(() => {
      setTime((current) => {
        const next = props.captureMode === "COUNTDOWN_TALLY" ? Math.max(0, current + step) : current + step;
        if (props.captureMode === "COUNTDOWN_TALLY" && next <= 0) setRunning(false);
        return next;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, props.captureMode]);

  function reset() {
    setRunning(false);
    setTime(props.captureMode === "COUNTDOWN_TALLY" ? props.durationSeconds ?? 60 : 0);
    if (props.captureMode !== "MEASUREMENT") setValue("");
  }

  function stopWatch() {
    if (running && props.captureMode === "STOPWATCH") setValue(time.toFixed(1));
    setRunning((current) => !current);
  }

  function tally(delta: number) {
    setValue((current) => String(Math.max(0, Number(current || 0) + delta)));
  }

  return (
    <form action={recordTestingResult} className="grid gap-3 rounded-xl border border-[var(--border)] p-3">
      <input type="hidden" name="sessionId" value={props.sessionId} />
      <input type="hidden" name="gymnastId" value={props.gymnastId} />
      <input type="hidden" name="metricId" value={props.metricId} />
      <input type="hidden" name="numberValue" value={value} />
      {props.batteryPoints!==null&&<div className="testing-points-summary"><span>Battery points</span><strong>{props.batteryPoints}</strong></div>}

      {props.captureMode === "COUNTDOWN_TALLY" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">{clock(time)}</p>
            <div className="mt-2 flex justify-center gap-2">
              <button type="button" disabled={props.disabled} onClick={() => setRunning((current) => !current)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">{running ? "Pause" : "Start"}</button>
              <button type="button" disabled={props.disabled} onClick={reset} className="rounded-lg px-3 py-2 text-sm text-[var(--muted)]">Reset</button>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-3 text-center">
            <div className="flex items-center justify-center gap-4">
              <button type="button" disabled={props.disabled} onClick={() => tally(-1)} className="testing-tally-button">−</button>
              <input aria-label="Tally result" disabled={props.disabled} type="number" min="0" step="1" inputMode="numeric" value={value} onChange={e=>setValue(e.target.value)} className="testing-tally-input"/>
              <button type="button" disabled={props.disabled} onClick={() => tally(1)} className="testing-tally-button">+</button>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{props.unit || "repetitions"}</p>
          </div>
        </div>
      )}

      {props.captureMode === "STOPWATCH" && (
        <div className="rounded-xl border border-[var(--border)] p-3 text-center">
          <p className="text-3xl font-semibold tabular-nums">{clock(time)}</p>
          <div className="mt-2 flex justify-center gap-2">
            <button type="button" disabled={props.disabled} onClick={stopWatch} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold">{running ? "Stop" : "Start"}</button>
            <button type="button" disabled={props.disabled} onClick={reset} className="rounded-lg px-3 py-2 text-sm text-[var(--muted)]">Reset</button>
          </div>
          {value && <p className="mt-2 text-sm">Selected result: {value} {props.unit || "sec"}</p>}
        </div>
      )}

      {props.captureMode === "REPETITION_TALLY" && (
        <div className="flex items-center justify-center gap-4 rounded-xl border border-[var(--border)] p-3">
          <button type="button" disabled={props.disabled} onClick={() => tally(-1)} className="testing-tally-button">−</button>
          <input aria-label="Tally result" disabled={props.disabled} type="number" min="0" step="1" inputMode="numeric" value={value} onChange={e=>setValue(e.target.value)} className="testing-tally-input"/>
          <button type="button" disabled={props.disabled} onClick={() => tally(1)} className="testing-tally-button">+</button>
        </div>
      )}

      {props.captureMode === "MEASUREMENT" && (
        <label className="text-sm font-medium">
          Result {props.unit ? "(" + props.unit + ")" : ""}
          <input disabled={props.disabled} type="number" step="any" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-3 text-lg" />
        </label>
      )}

      {props.scoringMode==="MANUAL"&&<label className="text-sm font-medium">Points<input name="pointsValue" disabled={props.disabled} type="number" step="any" inputMode="decimal" defaultValue={props.initialPoints??""} placeholder="Enter points from reference" className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-3 text-lg"/></label>}
      {props.scoringMode==="AUTOMATIC"&&<div className="testing-result-points">{props.initialPoints!==null?<><strong>{props.initialPoints} points</strong><span>Calculated from the saved point system</span></>:<span>Save the result to calculate points from the point system.</span>}</div>}
      <input name="note" disabled={props.disabled} defaultValue={props.initialNote ?? ""} placeholder="Coach context (optional)" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
      <button disabled={props.disabled || value === ""} className="rounded-xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white">
        {props.initialValue === null ? "Save result" : "Update result"}
      </button>
    </form>
  );
}
