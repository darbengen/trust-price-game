export type Move='C'|'X';
export type Kind='A'|'B'|'C'|'D';
export type PersonKey=Kind|'P';
export const KINDS:Kind[]=['A','B','C','D'];
export const ROUNDS=7;
export const payout=(a:Move,b:Move):[number,number]=>a==='C'?(b==='C'?[2,2]:[0,3]):(b==='C'?[3,0]:[1,1]);
export const net=(a:Move,b:Move):[number,number]=>{const p=payout(a,b);return [p[0]-1,p[1]-1]};
