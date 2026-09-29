import {AppShell} from "@/app/components/app-shell";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import {groupScopeWhere,gymnastScopeWhere} from "@/app/lib/coaching-scope";
import {setTrainingSessionArchived} from "@/app/actions/training-planning";
import {setTrainingPlanStatus,setMacrocycleStatus} from "@/app/actions/training-structure";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
const day=(d:Date)=>d.toISOString().slice(0,10);
export default async function Archive(){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace&&!c.access.canManagePeopleAndRoles)redirect("/dashboard");
 const scope=groupScopeWhere(c.organisation.id,c.membership.id,c.access), gymnastScope=gymnastScopeWhere(c.organisation.id,c.membership.id,c.access);
 const [sessions,plans,cycles]=await Promise.all([
  c.access.canUseCoachingWorkspace?prisma.trainingSession.findMany({where:{organisationId:c.organisation.id,status:"ARCHIVED",trainingGroup:scope},include:{trainingGroup:{select:{name:true}}},orderBy:{sessionDate:"desc"}}):[],
  c.access.canUseCoachingWorkspace?prisma.trainingPlan.findMany({where:{organisationId:c.organisation.id,status:"ARCHIVED",trainingGroup:scope},include:{trainingGroup:{select:{name:true}},gymnast:{select:{name:true}}},orderBy:{startDate:"desc"}}):[],
  c.access.canUseCoachingWorkspace?prisma.macrocycle.findMany({where:{organisationId:c.organisation.id,status:"ARCHIVED",...(c.access.canViewAllCoachingData?{}:{OR:[{groups:{some:{trainingGroup:scope}}},{gymnasts:{some:{gymnast:gymnastScope}}}]})},orderBy:{startDate:"desc"}}):[]
 ]);
 const total=sessions.length+plans.length+cycles.length;
 return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}><section className="workspace-page">
  <div className="workspace-hero"><div><p className="workspace-kicker">More · Archive</p><h1>Archive</h1><p className="workspace-meta">{total} archived records</p></div></div>
  <div className="more-sections">
   <section><h2>Sessions</h2><div className="grid gap-2">{sessions.map(s=><div key={s.id} className="workspace-row"><div><strong>{s.title}</strong><span>{s.trainingGroup.name} · {day(s.sessionDate)} · {s.startTime}–{s.endTime}</span></div><form action={setTrainingSessionArchived}><input type="hidden" name="sessionId" value={s.id}/><input type="hidden" name="archive" value="false"/><button className="workspace-button">Restore</button></form></div>)}{!sessions.length&&<div className="empty-state">No archived sessions.</div>}</div></section>
   <section><h2>Training plans</h2><div className="grid gap-2">{plans.map(p=><div key={p.id} className="workspace-row"><div><strong>{p.name}</strong><span>{p.gymnast?.name??p.trainingGroup.name} · {day(p.startDate)} – {day(p.endDate)}</span></div><form action={setTrainingPlanStatus}><input type="hidden" name="planId" value={p.id}/><input type="hidden" name="status" value="ACTIVE"/><button className="workspace-button">Restore</button></form></div>)}{!plans.length&&<div className="empty-state">No archived training plans.</div>}</div></section>
   <section><h2>Macrocycles</h2><div className="grid gap-2">{cycles.map(m=><div key={m.id} className="workspace-row"><div><strong>{m.name}</strong><span>{day(m.startDate)} – {day(m.endDate)}</span></div><form action={setMacrocycleStatus}><input type="hidden" name="macrocycleId" value={m.id}/><input type="hidden" name="status" value="ACTIVE"/><button className="workspace-button">Restore</button></form></div>)}{!cycles.length&&<div className="empty-state">No archived macrocycles.</div>}</div></section>
  </div>
 </section></AppShell>
}