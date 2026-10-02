"use server";
import {redirect} from "next/navigation";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import {gymnastScopeWhere} from "@/app/lib/coaching-scope";
const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
const words=(s:string)=>new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(x=>x.length>2));
const score=(q:Set<string>,...parts:(string|null|undefined)[])=>{const text=words(parts.filter(Boolean).join(" "));let n=0;q.forEach(x=>{if(text.has(x))n++});return n};
export async function askMentor(d:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)redirect("/dashboard");
 const question=v(d,"question"),gymnastId=v(d,"gymnastId")||null,apparatus=v(d,"apparatus")||null,contextType=v(d,"contextType")||"GENERAL",contextRef=v(d,"contextRef")||null;if(!question)return;
 let gymnast:null|{id:string,name:string}=null;if(gymnastId)gymnast=await prisma.gymnast.findFirst({where:{id:gymnastId,...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true,name:true}});if(gymnastId&&!gymnast)return;
 const [methods,checks,evidence,memory]=await Promise.all([
  prisma.methodologyRecord.findMany({where:{organisationId:c.organisation.id,status:"APPROVED",...(apparatus?{OR:[{apparatus},{apparatus:null}]}:{})},select:{id:true,title:true,provenance:true,technicalObjective:true,technicalBoundaries:true,defaultApproach:true,alternativeApproaches:true,uncertainty:true,apparatus:true},take:100}),
  gymnast?prisma.trainingCheckIn.findMany({where:{gymnastId:gymnast.id},orderBy:{recordedAt:"desc"},take:5,select:{feeling:true,confidence:true,fatigue:true,source:true,recordedAt:true}}):Promise.resolve([]),
  gymnast?prisma.trainingEvidence.findMany({where:{gymnastId:gymnast.id},orderBy:{recordedAt:"desc"},take:20,select:{outcome:true,note:true,fatigueSnapshot:true,recordedAt:true}}):Promise.resolve([]),
  gymnast?prisma.coachingMemoryObservation.findMany({where:{organisationId:c.organisation.id,gymnastId:gymnast.id},orderBy:{createdAt:"desc"},take:5,select:{observation:true,createdAt:true}}):Promise.resolve([])
 ]);
 const q=words(question);const relevant=methods.map(m=>({m,s:score(q,m.title,m.technicalObjective,m.technicalBoundaries,m.defaultApproach,m.alternativeApproaches,m.apparatus)})).sort((a,b)=>b.s-a.s).filter((x,i)=>x.s>0||i<3).slice(0,5).map(x=>x.m);
 const counts=evidence.reduce((a,e)=>{a[e.outcome]=(a[e.outcome]||0)+1;return a},{} as Record<string,number>);
 const lines:string[]=[];lines.push("Evidence snapshot");if(gymnast){lines.push(gymnast.name+": "+evidence.length+" recent training evidence records"+(evidence.length?" ("+Object.entries(counts).map(([k,n])=>k.toLowerCase()+" "+n).join(", ")+")":"."));const latest=checks[0];if(latest)lines.push("Latest Athlete State: "+[latest.feeling,latest.confidence,latest.fatigue].filter(Boolean).join(" · ")+" — gymnast self-report.");if(memory.length)lines.push("Recent Coaching Memory: "+memory[0].observation);}else lines.push("No gymnast was selected, so this answer is not using gymnast-specific evidence.");
 lines.push("");lines.push("Relevant methodology");if(relevant.length)relevant.forEach(m=>lines.push("• "+m.title+" ["+m.provenance.replaceAll("_"," ").toLowerCase()+"]"+(m.defaultApproach?": "+m.defaultApproach:"")));else lines.push("No approved club methodology matched this question.");
 lines.push("");lines.push("Worth considering");if(relevant[0]?.technicalObjective)lines.push(relevant[0].technicalObjective);else if(evidence.length)lines.push("Review the pattern in the recent evidence alongside the context in which it was recorded; the records alone do not establish why the pattern occurred.");else lines.push("There is limited stored evidence for Viaform to connect to this question.");
 if(relevant[0]?.alternativeApproaches)lines.push("Alternative approach: "+relevant[0].alternativeApproaches);if(relevant[0]?.technicalBoundaries)lines.push("Boundary: "+relevant[0].technicalBoundaries);
 lines.push("");lines.push("Coach decision required");lines.push("Use the evidence and methodology above as context. Viaform is not making a readiness, progression, selection or technical decision for you.");
 const uncertainty=[...relevant.map(m=>m.uncertainty).filter(Boolean),!evidence.length&&gymnast?"Limited recent training evidence.":null].filter(Boolean).join(" ");
 const row=await prisma.mentorQuestion.create({data:{organisationId:c.organisation.id,askedByMembershipId:c.membership.id,gymnastId:gymnast?.id??null,question,contextType,contextRef,apparatus,answer:lines.join("\n"),evidenceSnapshot:JSON.stringify({trainingEvidence:evidence,athleteState:checks,coachingMemory:memory}),methodologySnapshot:JSON.stringify(relevant),uncertainty:uncertainty||null}});
 redirect("/mentor?answer="+row.id);
}
