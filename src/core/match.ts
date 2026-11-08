import {KINDS,ROUNDS,net,type Kind,type Move,type PersonKey} from './rules.ts';
import {strategy} from './strategies.ts';
export interface Round {player:Move;npc:Move;gain:[number,number]}
export function resolveRound(kind:Kind,history:Round[],player:Move):Round {const npc=strategy(kind,history.map(r=>r.npc),history.map(r=>r.player));return {player,npc,gain:net(player,npc)}}
export interface MatchResult {kind:Kind;rounds:Round[];gains:[number,number]}
export function match(a:Kind,b:Kind,rounds=ROUNDS):[number,number]{const ah:Move[]=[],bh:Move[]=[];const result:[number,number]=[0,0];for(let i=0;i<rounds;i++){const x=strategy(a,ah,bh),y=strategy(b,bh,ah),g=net(x,y);ah.push(x);bh.push(y);result[0]+=g[0];result[1]+=g[1]}return result}
export const matrix=Object.fromEntries(KINDS.map(a=>[a,Object.fromEntries(KINDS.map(b=>[b,match(a,b)[0]]))])) as Record<Kind,Record<Kind,number>>;
export function leaderboard(results:MatchResult[]){
 if(results.length!==4||new Set(results.map(r=>r.kind)).size!==4||results.some(r=>r.rounds.length!==ROUNDS))throw new Error('Four complete matches required');
 const keys:PersonKey[]=['P',...KINDS];const cross=Object.fromEntries(keys.map(a=>[a,Object.fromEntries(keys.map(b=>[b,a===b?null:a==='P'?results.find(r=>r.kind===b)!.gains[0]:b==='P'?results.find(r=>r.kind===a)!.gains[1]:matrix[a][b]]))])) as Record<PersonKey,Record<PersonKey,number|null>>;
 const totals=Object.fromEntries(keys.map(a=>[a,20+keys.reduce((s,b)=>s+(cross[a][b]??0),0)])) as Record<PersonKey,number>;
 const ranks=Object.fromEntries(keys.map(a=>[a,1+keys.filter(b=>totals[b]>totals[a]).length])) as Record<PersonKey,number>;
 return {keys,cross,totals,ranks};
}
