import type {Move} from './rules.ts';
export const CONDITIONS=['CC','CX','XC','XX'] as const;
export interface LearnedPolicy {opening:Move;reply:[Move,Move,Move,Move]}
export function learnYou(matches:{mine:Move[];theirs:Move[]}[]):LearnedPolicy{
 const trust=[0,0,0,0],total=[0,0,0,0];let first=0,firstN=0,allTrust=0,allN=0;
 for(const {mine,theirs} of matches){if(!mine.length)continue;first+=mine[0]==='C'?1:0;firstN++;for(let t=1;t<mine.length;t++){const k=CONDITIONS.indexOf((mine[t-1]+theirs[t-1]) as typeof CONDITIONS[number]);if(k<0)throw Error('Invalid pair history');total[k]++;allN++;if(mine[t]==='C'){trust[k]++;allTrust++}}}
 const fallback:Move=allTrust*2>=allN?'C':'X';return {opening:first*2>=firstN?'C':'X',reply:CONDITIONS.map((_,k)=>total[k]?(trust[k]*2>=total[k]?'C':'X'):fallback) as LearnedPolicy['reply']};
}
export function learnedMove(policy:LearnedPolicy,mine:readonly Move[],theirs:readonly Move[]):Move{if(!mine.length)return policy.opening;return policy.reply[CONDITIONS.indexOf((mine.at(-1)!+theirs.at(-1)!) as typeof CONDITIONS[number])]}
