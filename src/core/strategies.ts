import type {Kind,Move} from './rules.ts';
export function strategy(kind:Kind,mine:readonly Move[],theirs:readonly Move[]):Move{
 if(kind==='A')return 'C';if(kind==='B')return 'X';if(kind==='C')return theirs.at(-1)??'C';
 if(theirs.includes('X'))return 'X';const r=mine.length+1;return r<=2||r%2===0?'C':'X';
}
