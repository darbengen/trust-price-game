import type {Kind,Move} from '../core/rules.ts';
import type {MatchResult} from '../core/match.ts';
export interface TradePresenter {
 enter(npc:Kind):Promise<void>;
 askChoice(round:number):Promise<Move>;
 playResult(round:number,you:Move,them:Move,gain:[number,number]):Promise<void>;
 showWhisper(text:string):void;
 exit(summary:MatchResult):Promise<void>;
}
