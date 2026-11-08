import {KINDS,payout,type Kind,type PersonKey,type Move} from './rules.ts';
import {learnedMove,type LearnedPolicy} from './learnYou.ts';
import {strategy} from './strategies.ts';
export interface Citizen {id:number;kind:PersonKey;money:number;alive:boolean}
export interface PairRecord {a:Move[];b:Move[]}
export interface World {people:Citizen[];pairs:Record<string,PairRecord>;cycle:number;stable:number;done:boolean;coefficient:number;includeYou:boolean;youPolicy:LearnedPolicy}
export interface Change {id:number;money:number;alive:boolean}
export interface Scan {scanner:number;targets:number[];changes:Change[];dead:number[]}
export interface CycleResult {world:World;scans:Scan[];fee:number;feeChanges:Change[];dead:number[];counts:number[];decreased:boolean}
export const createWorld=(coefficient=.8,options:{includeYou?:boolean;policy?:LearnedPolicy}={}):World=>({people:Array.from({length:options.includeYou?101:100},(_,id)=>({id,kind:id===100?'P':KINDS[Math.floor(id/25)],money:20,alive:true})),pairs:{},cycle:0,stable:0,done:false,coefficient,includeYou:options.includeYou??false,youPolicy:options.policy??{opening:'C',reply:['C','X','C','X']}});
// Deterministic, no rendering or time dependencies. The input is never mutated.
export function runCycle(input:World):CycleResult{
 const w:World={...input,people:input.people.map(p=>({...p})),pairs:{...input.pairs},cycle:input.cycle+1};
 const start=w.people.filter(p=>p.alive), startMoney=new Map(start.map(p=>[p.id,p.money])), income=new Map(start.map(p=>[p.id,0]));
 const scans:Scan[]=[],dead:number[]=[];
 for(let i=0;i<w.people.length;i++){
  const a=w.people[i];if(!a.alive)continue;const scan:Scan={scanner:i,targets:[],changes:[],dead:[]},changed=new Set<number>();
  for(let j=i+1;j<w.people.length;j++){
   const b=w.people[j];if(!a.alive)break;if(!b.alive||a.money<1||b.money<1)continue;
   const key=i+':'+j,previous=w.pairs[key]??{a:[],b:[]};
   const x=a.kind==='P'?learnedMove(w.youPolicy,previous.a,previous.b):strategy(a.kind,previous.a,previous.b),y=b.kind==='P'?learnedMove(w.youPolicy,previous.b,previous.a):strategy(b.kind,previous.b,previous.a),paid=payout(x,y);
   a.money-=1;b.money-=1;a.money+=paid[0];b.money+=paid[1];income.set(i,income.get(i)!+paid[0]-1);income.set(j,income.get(j)!+paid[1]-1);
   w.pairs[key]={a:[...previous.a,x],b:[...previous.b,y]};scan.targets.push(j);changed.add(i);changed.add(j);
   for(const p of [a,b])if(p.money<=0){p.alive=false;scan.dead.push(p.id);dead.push(p.id)}
  }
  scan.changes=[...changed].map(id=>({id,money:w.people[id].money,alive:w.people[id].alive}));scans.push(scan);
 }
 const fee=start.length?[...income.values()].reduce((s,n)=>s+n,0)/start.length*w.coefficient:0;
 const feeChanges:Change[]=[];
 for(const p of w.people)if(p.alive){p.money-=fee;if(p.money<=0){p.alive=false;dead.push(p.id)}feeChanges.push({id:p.id,money:p.money,alive:p.alive})}
 const decreased=w.people.some(p=>p.alive&&p.money<(startMoney.get(p.id)??p.money)-1e-8);
 w.stable=dead.length===0&&!decreased?input.stable+1:0;w.done=w.stable>=5||!w.people.some(p=>p.alive);
 return {world:w,scans,fee,feeChanges,dead,counts:KINDS.map(k=>w.people.filter(p=>p.alive&&p.kind===k).length),decreased};
}
