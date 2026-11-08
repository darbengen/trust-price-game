import {describe,it,expect} from 'vitest';
import {net,payout,KINDS,type Move} from '../rules.ts';
import {strategy} from '../strategies.ts';
import {matrix,leaderboard,type MatchResult} from '../match.ts';
import {createWorld,runCycle} from '../world.ts';
describe('seven-round trades',()=>{
 it('conserves deposits separately from profit',()=>{expect(payout('C','C')).toEqual([2,2]);expect(net('C','X')).toEqual([-1,2]);expect(payout('X','X')).toEqual([1,1]);expect(net('X','X')).toEqual([0,0])});
 it('matches every supplied payoff',()=>expect(matrix).toEqual({A:{A:7,B:-7,C:7,D:1},B:{A:14,B:0,C:2,D:2},C:{A:7,B:-1,C:7,D:2},D:{A:10,B:-1,C:5,D:2}}));
 it('D alternates indefinitely and retaliation belongs to one opponent',()=>{const mine:Move[]=[],theirs:Move[]=[];for(let i=0;i<10;i++){mine.push(strategy('D',mine,theirs));theirs.push('C')}expect(mine).toEqual(['C','C','X','C','X','C','X','C','X','C']);expect(strategy('D',['C'],['X'])).toBe('X');expect(strategy('D',[],[])).toBe('C')});
 it('uses actual player results and tied ranks',()=>{const results:MatchResult[]=KINDS.map(kind=>{const mine:Move[]=[],other:Move[]=[];const r:MatchResult={kind,rounds:[],gains:[0,0]};for(let i=0;i<7;i++){const npc=strategy(kind,other,mine),gain=net('C',npc);mine.push('C');other.push(npc);r.rounds.push({player:'C',npc,gain});r.gains[0]+=gain[0];r.gains[1]+=gain[1]}return r});expect(results.map(r=>r.gains[0])).toEqual([7,-7,7,1]);const board=leaderboard(results);expect(board.totals).toEqual({P:28,A:28,B:52,C:35,D:44});expect(board.ranks.P).toBe(board.ranks.A);expect(()=>leaderboard(results.slice(0,3))).toThrow()});
});
describe('deterministic world',()=>{
 it('replays scans without mutating its input; retains separate pair histories',()=>{const w=createWorld(),r=runCycle(w);expect(w.cycle).toBe(0);expect(w.people.every(p=>p.money===20)).toBe(true);expect(Object.keys(w.pairs)).toHaveLength(0);const r2=runCycle(r.world);expect(r2.world.pairs['0:25'].a).toHaveLength(2);expect(r2.world.pairs['0:25'].b).toEqual(['X','X']);expect(r2.world.pairs['0:50'].b).toEqual(['C','C']);const replay=w.people.map(p=>({...p}));for(const s of r.scans)for(const c of s.changes)Object.assign(replay[c.id],c);for(const c of r.feeChanges)Object.assign(replay[c.id],c);expect(replay).toEqual(r.world.people)});
 it('cannot trade with less than one coin',()=>{const w=createWorld();w.people[0].money=.5;const r=runCycle(w);expect(r.scans.find(s=>s.scanner===0)!.targets).toHaveLength(0);expect(Object.keys(r.world.pairs).some(k=>k.startsWith('0:'))).toBe(false)});
 it('matches every milestone and the 1000-cycle long run',()=>{let w=createWorld(),c100:number[]=[],before=0;for(let i=1;i<=1000;i++){const r=runCycle(w);w=r.world;if(i===3)expect(r.counts).toEqual([0,25,25,25]);if(i===21)expect(r.counts).toEqual([0,0,25,0]);if(i===26){expect(w.done).toBe(true);expect(w.stable).toBe(5)}if(i===99)before=w.people[50].money;if(i===100){c100=r.counts;expect(w.people[50].money-before).toBeCloseTo(4.8)}if(i===1000)expect(r.counts).toEqual(c100)}expect(c100).toEqual([0,0,25,0])},30000);
 it.each([.7,.9])('retains C with coefficient %s',(coefficient)=>{let w=createWorld(coefficient);for(let i=0;i<200&&!w.done;i++)w=runCycle(w).world;expect(KINDS.map(k=>w.people.filter(p=>p.alive&&p.kind===k).length)).toEqual([0,0,25,0]);expect(w.done).toBe(true)});
});
