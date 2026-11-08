import {text as T,signed} from '../content.zh.ts';
import type {Kind,Move} from '../core/rules.ts';
import type {MatchResult,Round} from '../core/match.ts';
import type {TradePresenter} from './tradePresenter.ts';

type Hooks={delay:(seconds:number)=>Promise<void>;wallets:()=>[number,number];onReveal:(you:Move,them:Move,gain:[number,number])=>void;onPayout:()=>void;whisper:(text:string)=>void};
export class Trade2DPresenter implements TradePresenter {
 private kind:Kind='A';private history:Round[]=[];private pending?:{you:Move;them:Move};private chooser?: (move:Move)=>void;private automatic=false;
 constructor(private ui:HTMLElement,private hooks:Hooks){}
 async enter(npc:Kind){this.kind=npc;this.render();await this.hooks.delay(.15)}
 setAutomatic(value:boolean){this.automatic=value}
 askChoice(_round:number){return new Promise<Move>(resolve=>{this.chooser=resolve;this.render()})}
 choose(move:Move){if(!this.chooser)return;const choose=this.chooser;this.chooser=undefined;choose(move);this.render()}
 async playResult(_round:number,you:Move,them:Move,gain:[number,number]){const t=this.automatic?.075:.2;this.render();await this.hooks.delay(t);this.pending={you,them};this.render();this.hooks.onReveal(you,them,gain);await this.hooks.delay(this.automatic?.12:.3);this.hooks.onPayout();this.render(gain);await this.hooks.delay(this.automatic?.105:.3);this.history.push({player:you,npc:them,gain});this.pending=undefined}
 showWhisper(text:string){this.hooks.whisper(text)}
 async exit(summary:MatchResult){this.ui.innerHTML=`<div class="fast-overlay"><div class="fast-summary">${T.you} ${signed(summary.gains[0])}　·　${summary.kind} ${signed(summary.gains[1])}</div></div>`;await this.hooks.delay(1.5);this.ui.querySelector('.fast-overlay')?.classList.add('fast-out');await this.hooks.delay(.3)}
 private render(gain?:[number,number]){const w=this.hooks.wallets(),i=this.history.length;const dots=(side:'player'|'npc')=>Array.from({length:7},(_,n)=>{const move=n<i?this.history[n][side]:n===i&&this.pending?(side==='player'?this.pending.you:this.pending.them):undefined;return `<i class="fast-dot ${move==='C'?'trust':move==='X'?'cheat':''}"></i>`}).join('');this.ui.innerHTML=`<div class="fast-overlay"><div class="fast-panel"><div class="fast-label">${T.with} ${this.kind} ${T.trade} · 第 ${Math.min(i+1,7)}/7 ${T.round}</div><div class="fast-buttons"><button data-fast="C" class="fast-trust" ${this.chooser?'':'disabled'}>${T.trust} <small>1</small></button><button data-fast="X" class="fast-cheat" ${this.chooser?'':'disabled'}>${T.cheat} <small>2</small></button></div><div class="fast-wallet">${T.you} ◉ ${w[0]} ${gain?`<em>${signed(gain[0])}</em>`:''}　 ${this.kind} ◉ ${w[1]} ${gain?`<em>${signed(gain[1])}</em>`:''}</div><div class="fast-history"><span>${T.you}</span>${dots('player')}<span>${this.kind}</span>${dots('npc')}</div><div class="fast-hint">${T.fastHint}</div></div></div>`;this.ui.querySelectorAll<HTMLButtonElement>('[data-fast]').forEach(b=>b.onclick=()=>this.choose(b.dataset.fast as Move))}
}
