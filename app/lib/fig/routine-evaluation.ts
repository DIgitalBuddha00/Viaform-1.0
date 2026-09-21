import {FIG_DIFFICULTY_VALUES} from "./catalog";
export type FigRoutineElement={difficulty:keyof typeof FIG_DIFFICULTY_VALUES;kind?:"ACRO"|"DANCE"};
export function baseDifficulty(elements:FigRoutineElement[],max=8){return elements.slice(0,max).reduce((sum,e)=>sum+FIG_DIFFICULTY_VALUES[e.difficulty],0)}
export function countingMix(elements:FigRoutineElement[]){return {acro:elements.filter(e=>e.kind==="ACRO").length,dance:elements.filter(e=>e.kind==="DANCE").length}}
