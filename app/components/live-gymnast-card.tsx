"use client";
import {useState,useTransition} from "react";
import {recordTrainingEvidence,decrementTrainingEvidence,recordTrainingCheckIn} from "@/app/actions/live-training";

type Work={id:string;title:string;targetCount:number|null;targetGymnastId:string|null};
type Station={id:string;name:string;workItemId:string|null};
type Ev={workItemId:string|null;stationId:string|null;outcome:string};
type Check={feeling:string|null;confidence:string|null;recordedAt:string};
export function LiveGymnastCard({sessionId,blockId,gymnast,isLive,works,stations,evidence,latestCheck}:{sessionId:string;blockId:string;gymnast:{id:string;name:string;profileImageUrl:string|null};isLive:boolean;works:Work[];stations:Station[];evidence:Ev[];latestCheck:Check|null}){
 const [workId,setWorkId]=useState(works[0]?.id??""); const [stationId,setStationId]=useState(""); const [open,setOpen]=useState(false); const [check,setCheck]=useState(latestCheck); const [pending,start]=useTransition();
 const initials=gymnast.name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();
 const counts=(o:string)=>evidence.filter(e=>(!workId||e.workItemId===workId)&&(!stationId||e.stationId===stationId)&&e.outcome===o).length;
 const submit=(action:(d:FormData)=>Promise<void>,data:Record<string,string>)=>start(async()=>{const f=new FormData();Object.entries(data).forEach(([k,v])=>f.set(k,v));await action(f)});
 const setMood=(kind:"feeling"|"confidence",v:string)=>{setCheck(c=>({feeling:c?.feeling??null,confidence:c?.confidence??null,recordedAt:new Date().toISOString(),[kind]:v}));submit(recordTrainingCheckIn,{sessionId,blockId,gymnastId:gymnast.id,[kind]:v})};
 return <article className="live-gymnast-card">
  <div className="live-person-head">{gymnast.profileImageUrl?<img src={gymnast.profileImageUrl} alt="" className="live-avatar"/>:<span className="live-avatar live-avatar-fallback">{initials}</span>}<strong>{gymnast.name}</strong></div>
  {stations.length>0&&<div className="live-choice-row"><span>Station</span><div><button className={!stationId?"is-selected":""} onClick={()=>setStationId("")}>Whole block</button>{stations.map(s=><button key={s.id} className={stationId===s.id?"is-selected":""} onClick={()=>{setStationId(s.id);if(s.workItemId)setWorkId(s.workItemId)}}>{s.name}</button>)}</div></div>}
  {works.length>0&&<div className="live-choice-row"><span>Work</span><div>{works.map(w=><button key={w.id} className={workId===w.id?"is-selected":""} onClick={()=>setWorkId(w.id)}>{w.title}</button>)}</div></div>}
  {isLive?<div className="live-counter-grid">{["MADE","MISSED","SPOTTED","BALK"].map(o=>{const n=counts(o);return <div className="live-counter" key={o}><span className="live-counter-label">{o==="MADE"?"Made":o==="MISSED"?"Missed":o==="SPOTTED"?"Spotted":"Balk"}</span><div className="live-counter-controls"><button disabled={pending||n===0} onClick={()=>submit(decrementTrainingEvidence,{sessionId,blockId,gymnastId:gymnast.id,stationId,workItemId:workId,outcome:o})}>−</button><strong>{n}</strong><button disabled={pending} onClick={()=>submit(recordTrainingEvidence,{sessionId,blockId,gymnastId:gymnast.id,stationId,workItemId:workId,outcome:o})}>+</button></div></div>})}</div>:null}
  <div className="live-card-checkin"><button className="live-checkin-toggle" onClick={()=>setOpen(!open)}>Feeling {check?.feeling||check?.confidence?"· update":"· check in"} <span>{open?"−":"+"}</span></button>{open&&<div className="live-checkin-panel"><p>How are you feeling right now?</p><div>{[["GREAT","Great"],["GOOD","Good"],["OKAY","Okay"],["LOW","Low"],["NOT_WELL","Not well"]].map(([v,l])=><button key={v} className={check?.feeling===v?"is-selected":""} onClick={()=>setMood("feeling",v)}>{l}</button>)}</div><p>Confidence for this block</p><div>{[["CONFIDENT","Confident"],["OKAY","Okay"],["UNSURE","Unsure"],["NERVOUS","Nervous"]].map(([v,l])=><button key={v} className={check?.confidence===v?"is-selected":""} onClick={()=>setMood("confidence",v)}>{l}</button>)}</div></div>}</div>
 </article>
}