import {FIG_DIFFICULTY_VALUES} from "./catalog";
export type FigDifficulty=keyof typeof FIG_DIFFICULTY_VALUES;
export type FigRoutineElement={difficulty:FigDifficulty;kind?:"ACRO"|"DANCE";chronology?:number};
export function difficultyValue(difficulty:FigDifficulty,level:"SENIOR"|"JUNIOR"="SENIOR"){const raw=FIG_DIFFICULTY_VALUES[difficulty];return level==="JUNIOR"?Math.min(raw,.5):raw}
export function baseDifficulty(elements:FigRoutineElement[],level:"SENIOR"|"JUNIOR"="SENIOR",max=8){return [...elements].sort((a,b)=>difficultyValue(b.difficulty,level)-difficultyValue(a.difficulty,level)).slice(0,max).reduce((sum,e)=>sum+difficultyValue(e.difficulty,level),0)}
export function countingMix(elements:FigRoutineElement[]){return {acro:elements.filter(e=>e.kind==="ACRO").length,dance:elements.filter(e=>e.kind==="DANCE").length}}
export function shortExercisePenalty(elementCount:number,level:"SENIOR"|"JUNIOR"="SENIOR"){const count=Math.max(0,Math.floor(elementCount));if(count>=(level==="JUNIOR"?6:7))return 0;if(count>=5)return 4;if(count>=3)return 6;if(count>=1)return 8;return 10}
