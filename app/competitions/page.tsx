import {AppShell} from "@/app/components/app-shell";
import {OverviewWidgets,type OverviewWidget} from "@/app/components/overview-widgets";
import {createCompetitionEvent} from "@/app/actions/competitions";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import {readOverviewLayout} from "@/app/lib/widget-layout";
export const dynamic="force-dynamic";
const dv=(d:Date)=>d.toISOString().slice(0,10);

export default async function Competitions(){
 const c=await requireAuthContext();
 const [events,preference]=await Promise.all([
  c.access.canUseCoachingWorkspace?prisma.competitionEvent.findMany({
   where:{organisationId:c.organisation.id},
   include:{entries:{include:{gymnast:{select:{id:true,name:true}},apparatusPlans:{include:{performance:{include:{athleteReflection:true}}}}}}},
   orderBy:[{eventDate:"desc"},{createdAt:"desc"}],take:60
  }):Promise.resolve([]),
  prisma.membershipPresentationPreference.findUnique({where:{membershipId:c.membership.id}})
 ]);
 const today=new Date();today.setUTCHours(0,0,0,0);
 const upcoming=events.filter(e=>e.eventDate>=today).sort((a,b)=>a.eventDate.getTime()-b.eventDate.getTime());
 const recent=events.filter(e=>e.eventDate<today);
 const next=upcoming[0]??null;
 const upcomingEntries=upcoming.reduce((n,e)=>n+e.entries.length,0);
 const recentPlans=recent.flatMap(e=>e.entries.flatMap(x=>x.apparatusPlans));
 const recorded=recentPlans.filter(p=>p.performance);
 const reflections=recorded.filter(p=>p.performance?.athleteReflection).length;
 const controls=events.filter(e=>e.eventType==="CONTROL").length,external=events.filter(e=>e.eventType==="EXTERNAL").length;
 const small=(label:string,value:string|number,href:string)=><a href={href} className="overview-data-card"><p>{label}</p><strong>{value}</strong></a>;
 const widgets:OverviewWidget[]=[
  {id:"NEXT",title:"Next competition",category:"Schedule",default:true,defaultSize:"L",small:small("Next competition",next?.name??"None",next?"/competitions/"+next.id:"#competitions-list"),medium:<a href={next?"/competitions/"+next.id:"#competitions-list"} className="overview-data-card"><p>Next competition</p><strong>{next?.name??"No upcoming competitions"}</strong>{next&&<div><span>{dv(next.eventDate)}{next.location?" · "+next.location:""}</span><span>{next.entries.length} entered</span></div>}</a>},
  {id:"UPCOMING",title:"Upcoming competitions",category:"Schedule",default:true,small:small("Upcoming",upcoming.length,"#competitions-list"),medium:<a href="#competitions-list" className="overview-data-card"><p>Upcoming</p><strong>{upcoming.length} competition{upcoming.length===1?"":"s"}</strong><div>{upcoming.slice(0,3).map(e=><span key={e.id}>{dv(e.eventDate)} · {e.name}</span>)}</div></a>},
  {id:"ENTRIES",title:"Upcoming entries",category:"People",default:true,small:small("Upcoming entries",upcomingEntries,"#competitions-list"),medium:<a href="#competitions-list" className="overview-data-card"><p>Upcoming entries</p><strong>{upcomingEntries} gymnast entr{upcomingEntries===1?"y":"ies"}</strong><div>{upcoming.slice(0,3).map(e=><span key={e.id}>{e.name} · {e.entries.length}</span>)}</div></a>},
  {id:"RECENT",title:"Recent competition",category:"History",default:true,small:small("Recent competition",recent[0]?.name??"None",recent[0]?"/competitions/"+recent[0].id:"#competitions-list"),medium:<a href={recent[0]?"/competitions/"+recent[0].id:"#competitions-list"} className="overview-data-card"><p>Recent competition</p><strong>{recent[0]?.name??"No previous competitions"}</strong>{recent[0]&&<div><span>{dv(recent[0].eventDate)} · {recent[0].entries.length} entries</span></div>}</a>},
  {id:"RESULTS",title:"Recorded outcomes",category:"Evidence",default:true,small:small("Recorded outcomes",recorded.length,"#competition-history"),medium:<a href="#competition-history" className="overview-data-card"><p>Recorded outcomes</p><strong>{recorded.length}</strong><div><span>Across previous competitions</span></div></a>},
  {id:"EVIDENCE_COVERAGE",title:"Competition evidence",category:"Evidence",default:false,small:small("Competition evidence",recentPlans.length?recorded.length+"/"+recentPlans.length:"None","#competition-history"),medium:<a href="#competition-history" className="overview-data-card"><p>Competition evidence</p><strong>{recentPlans.length?recorded.length+" of "+recentPlans.length+" apparatus outcomes":"No previous apparatus plans"}</strong><div><span>{reflections} athlete reflection{reflections===1?"":"s"}</span></div></a>},
  {id:"CONTROL",title:"Control competitions",category:"Competition",default:false,small:small("Control competitions",controls,"#competitions-list"),medium:<a href="#competitions-list" className="overview-data-card"><p>Control competitions</p><strong>{controls}</strong></a>},
  {id:"EXTERNAL",title:"External competitions",category:"Competition",default:false,small:small("External competitions",external,"#competitions-list"),medium:<a href="#competitions-list" className="overview-data-card"><p>External competitions</p><strong>{external}</strong></a>},
  {id:"ATHLETE_PERSPECTIVE",title:"Athlete perspective",category:"Perspectives",default:false,small:small("Athlete perspective",reflections,"#competition-history"),medium:<a href="#competition-history" className="overview-data-card"><p>Athlete perspective</p><strong>{reflections} reflection{reflections===1?"":"s"}</strong></a>}
 ];
 return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}><section className="workspace-page">
  <div className="workspace-hero"><div><p className="workspace-kicker">Competitions</p><h1>Competitions</h1><p className="workspace-meta">{upcoming.length} upcoming · {recent.length} previous</p></div><div className="workspace-actions"><a href="#new-competition" className="workspace-button workspace-button-primary">+ New competition</a></div></div>
  <div className="mt-7"><OverviewWidgets surface="COMPETITIONS" initialLayout={readOverviewLayout(preference,"COMPETITIONS")} widgets={widgets}/></div>
  <details id="new-competition" className="management-panel mt-6"><summary>New competition</summary><form action={createCompetitionEvent} className="p-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4"><input name="name" required placeholder="Competition name" className="rounded-xl border border-[var(--border)] px-3 py-3"/><select name="eventType" required defaultValue="EXTERNAL" className="rounded-xl border border-[var(--border)] px-3 py-3"><option value="EXTERNAL">External competition</option><option value="CONTROL">Control competition</option></select><input name="eventDate" type="date" required className="rounded-xl border border-[var(--border)] px-3 py-3"/><input name="location" placeholder="Location" className="rounded-xl border border-[var(--border)] px-3 py-3"/><textarea name="notes" placeholder="Notes" className="min-h-20 rounded-xl border border-[var(--border)] px-3 py-3 md:col-span-2 lg:col-span-3"/><button className="workspace-button workspace-button-primary">Create</button></form></details>
  <div id="competitions-list" className="mt-7"><div className="section-heading"><h2>Upcoming</h2><span>{upcoming.length}</span></div><div className="mt-3 grid gap-3">{upcoming.map(e=><a key={e.id} href={"/competitions/"+e.id} className="workspace-row"><div><strong>{e.name}</strong><span>{e.eventType==="CONTROL"?"Control competition":"External competition"} · {dv(e.eventDate)}{e.location?" · "+e.location:""}</span></div><em>{e.entries.length} gymnast{e.entries.length===1?"":"s"} · {e.status}</em></a>)}{!upcoming.length&&<div className="empty-state">No upcoming competitions</div>}</div></div>
  {recent.length>0&&<details id="competition-history" className="management-panel mt-8"><summary>Previous competitions · {recent.length}</summary><div className="p-4 grid gap-2">{recent.map(e=><a key={e.id} href={"/competitions/"+e.id} className="workspace-row"><div><strong>{e.name}</strong><span>{dv(e.eventDate)}{e.location?" · "+e.location:""}</span></div><em>{e.entries.length} gymnast{e.entries.length===1?"":"s"}</em></a>)}</div></details>}
 </section></AppShell>
}