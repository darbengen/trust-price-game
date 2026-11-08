import {text} from '../content.zh.ts';
import type {Round} from '../core/match.ts';
export type WhisperEvent=keyof typeof text.whispers;
export interface WhisperContext {phase:'enter'|'roundStart'|'revealed'|'end'|'before';round:number;matchIndex:number;history:Round[];gameHistory:Round[];wallet:number;matchGain:number}
export interface WhisperMemory {used:string[];lastMatch:number;lastRound:number;count:number;seed:number;lowSeen:boolean}
export const initialWhisperMemory=(seed=123456789):WhisperMemory=>({used:[],lastMatch:-1,lastRound:-99,count:0,seed:seed>>>0,lowSeen:false});
export function pickWhisper(ctx:WhisperContext,memory:WhisperMemory):{text:string;event:WhisperEvent;memory:WhisperMemory}|null {
 const h=ctx.history, last=h.at(-1),previous=h.at(-2), prior=ctx.gameHistory.slice(0,-1);
 const events:WhisperEvent[]=[];
 if(ctx.phase==='enter')events.push(ctx.matchIndex===0?'enterFirst':'enterNext');
 if(ctx.phase==='roundStart'&&ctx.round===7)events.push('lastRound');
 if(ctx.phase==='end')events.push(ctx.matchGain>=5?'endGain':ctx.matchGain<=-3?'endLoss':'endEven');
 if(ctx.phase==='revealed'&&last){
  if(last.player==='X'&&!prior.some(r=>r.player==='X'))events.push('firstCheat');
  if(last.player==='C'&&last.npc==='X'&&!prior.some(r=>r.player==='C'&&r.npc==='X'))events.push('firstBetrayed');
  if(last.npc==='X'&&h.length>1&&h.slice(0,-1).every(r=>r.npc==='C'))events.push('opponentTurned');
  if(previous?.player==='C'&&previous.npc==='X')events.push(last.player==='X'?'retaliate':'forgive');
  if(last.player==='X'&&last.npc==='C')events.push('cheatTrusting');
  if(h.length>=3&&h.slice(-3).every(r=>r.player==='X'))events.push('cheatStreak');
  if(h.length>=3&&h.slice(-3).every(r=>r.player==='C'))events.push('trustStreak');
  if(last.player==='C'&&last.npc==='X'&&h.slice(0,-1).some(r=>r.player==='C'&&r.npc==='X'))events.push('betrayedAgain');
  if(ctx.wallet<8&&!memory.lowSeen)events.push('lowCoins');
  if(last.player==='X'&&last.npc==='X')events.push('bothCheat');
  if(h.length>=2&&h.slice(-2).every(r=>r.player==='C'&&r.npc==='C'))events.push('bothTrust');
  if(h.length===1&&last.player==='C')events.push('trustFirst');
 }
 const must=new Set<WhisperEvent>(['firstCheat','firstBetrayed','opponentTurned','lastRound','endGain','endLoss','endEven','enterFirst']);
 const count=memory.lastMatch===ctx.matchIndex?memory.count:0;
 for(const event of events){
  if(!must.has(event)&&(count>=4||(memory.lastMatch===ctx.matchIndex&&ctx.round-memory.lastRound<3)))continue;
  const available=text.whispers[event].filter(s=>!memory.used.includes(s));if(!available.length)continue;
  const seed=(Math.imul(memory.seed,1664525)+1013904223)>>>0, line=available[seed%available.length];
  return {text:line,event,memory:{used:[...memory.used,line],lastMatch:ctx.matchIndex,lastRound:ctx.round,count:count+1,seed,lowSeen:memory.lowSeen||event==='lowCoins'}};
 }
 return null;
}
