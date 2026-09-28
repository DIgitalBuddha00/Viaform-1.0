"use client";

import { useMemo, useState } from "react";

type SkillOption={id:string;name:string;aliases:string;officialNumber:string|null;provenance:string};

export function SkillSearch({name,skills}:{name:string;skills:SkillOption[]}){
 const [query,setQuery]=useState(""),[selectedId,setSelectedId]=useState("");
 const normalized=query.trim().toLocaleLowerCase();
 const matches=useMemo(()=>normalized?skills.filter(skill=>{
  let aliases:string[]=[];try{const parsed=JSON.parse(skill.aliases||"[]");if(Array.isArray(parsed))aliases=parsed.map(String);}catch{}
  return [skill.name,skill.officialNumber??"",skill.provenance,...aliases].some(value=>value.toLocaleLowerCase().includes(normalized));
 }).slice(0,20):[],[normalized,skills]);
 const selected=skills.find(skill=>skill.id===selectedId);
 return <div className="relative">
  <input type="hidden" name={name} value={selectedId}/>
  <input value={query} onChange={event=>{setQuery(event.target.value);setSelectedId("");}} placeholder="Search skill name, alias or FIG number…" autoComplete="off" className="w-full rounded-lg border border-[var(--border)] px-3 py-2"/>
  {normalized&&!selected&&<div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
   {matches.length?matches.map(skill=><button key={skill.id} type="button" onClick={()=>{setSelectedId(skill.id);setQuery(skill.name);}} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--surface-subtle)]"><span className="font-semibold">{skill.name}</span><span className="ml-2 text-xs text-[var(--muted)]">{skill.officialNumber?"FIG "+skill.officialNumber:skill.provenance}</span></button>):<p className="px-3 py-2 text-sm text-[var(--muted)]">No matching skills on this apparatus.</p>}
  </div>}
 </div>;
}
