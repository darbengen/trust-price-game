import {describe,it,expect} from 'vitest';
import {initialWhisperMemory,pickWhisper,type WhisperContext} from './whisper.ts';
import type {Round} from '../core/match.ts';
const r=(player:'C'|'X',npc:'C'|'X'):Round=>({player,npc,gain:[0,0]});
const ctx=(history:Round[],phase:WhisperContext['phase']='revealed'):WhisperContext=>({phase,round:history.length,matchIndex:0,history,gameHistory:history,wallet:20,matchGain:0});
describe('whispers',()=>{
 it('never reveals an unchosen move',()=>{const c=ctx([r('C','X')],'before');expect(pickWhisper(c,initialWhisperMemory())).toBeNull()});
 it('prioritizes first deception over a trusting target',()=>{expect(pickWhisper(ctx([r('X','C')]),initialWhisperMemory())?.event).toBe('firstCheat')});
 it('honors cooldown for ordinary events and bypasses it for mandatory events',()=>{const m={...initialWhisperMemory(),lastMatch:0,lastRound:1,count:1};expect(pickWhisper(ctx([r('C','C'),r('C','C')]),m)).toBeNull();expect(pickWhisper(ctx([r('C','C'),r('C','X')]),m)?.event).toBe('firstBetrayed')});
 it('never repeats a line and seeded runs are repeatable',()=>{const c={...ctx([],'enter'),round:0};let m=initialWhisperMemory(42),lines:string[]=[];for(let i=0;i<3;i++){const result=pickWhisper(c,m)!;lines.push(result.text);m=result.memory}expect(new Set(lines).size).toBe(3);expect(pickWhisper(c,m)).toBeNull();expect(pickWhisper(c,initialWhisperMemory(42))?.text).toBe(lines[0])});
 it('allows final round independently of opponent choice',()=>{expect(pickWhisper({...ctx([],'roundStart'),round:7},initialWhisperMemory())?.event).toBe('lastRound')});
});
