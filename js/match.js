/* Modalidad según la cantidad de jugadores y estado de la lista en vivo. */

import { CANCHAS } from './config.js';
import { dupInfo } from './parser.js';
import { S } from './state.js';
import { esc } from './utils.js';

export function listStatus(names, extra){
  const n = names.length;
  if(!n) return null;
  const {dup, later} = dupInfo(names);
  const plural = n===1 ? 'jugador' : 'jugadores';
  if(dup.size){
    const i = [...later][0];
    return {kind:'bad', html:'<b>'+n+'</b> '+plural+' · nombre repetido: <b>'+esc(names[i].trim())+'</b>'};
  }
  if(S.mode==='liga'){
    const L = S.liga, t = L.teams * L.per, d = t - n, fm = L.teams+' equipos de '+L.per;
    if(!d) return {kind:'ok', html:'<b>'+n+'</b> jugadores · <b>'+fm+'</b> ✓'};
    return {kind:'warn', html:'<b>'+n+'</b> '+plural+' · '+fm+': '+
      (d>0 ? 'falta'+(d>1?'n':'')+' <b>'+d+'</b>' : 'sobra'+(d<-1?'n':'')+' <b>'+(-d)+'</b>')};
  }
  if(n < 4) return {kind:'warn', html:'<b>'+n+'</b> '+plural+' · cargá al menos 4'};
  const c = canchaFor(n);
  if(c) return {kind:'ok', html:'<b>'+n+'</b> jugadores · <b>'+c.label+'</b> ✓'};
  const po = plusOne(n);
  if(po){
    const hi = CANCHAS.find(x=>x.n>n);
    return {kind:'warn', html:'<b>'+n+'</b> jugadores · <b>'+po.label+' +1</b>'+(hi ? ' · o '+hi.label+': falta <b>'+(hi.n-n)+'</b>' : '')};
  }
  const lo = CANCHAS.filter(x=>x.n<n).pop(), hi = CANCHAS.find(x=>x.n>n);
  const parts = [];
  if(lo) parts.push(lo.label+': sobra'+(n-lo.n>1?'n':'')+' <b>'+(n-lo.n)+'</b>');
  if(hi) parts.push(hi.label+': falta'+(hi.n-n>1?'n':'')+' <b>'+(hi.n-n)+'</b>');
  return {kind:'warn', html:'<b>'+n+'</b> jugadores · '+parts.join(' · ')};
}

export const canchaFor = n => CANCHAS.find(c => c.n === n) || null;
export const plusOne = n => CANCHAS.find(c => c.n + 1 === n) || null;
export function matchFor(n){
  if(S.mode==='liga'){
    const t = S.liga.teams * S.liga.per;
    return {ok:n===t, kind:'liga', label:'Liga '+S.liga.teams+'×'+S.liga.per, total:t};
  }
  const c = canchaFor(n);
  if(c) return {ok:true, kind:'exact', c, label:c.label};
  const po = plusOne(n);
  if(po) return {ok:true, kind:'plus', c:po, label:po.label+' +1'};
  return {ok:false, kind:'none'};
}
export function perTeamText(n){
  if(S.mode==='liga') return String(S.liga.per);
  return n % 2 ? ((n+1)/2)+' / '+((n-1)/2) : String(n/2);
}
