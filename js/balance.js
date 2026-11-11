/* Armado y balance de equipos. */

import { GK_HANDICAP, MAX_COMBOS, TOL, W_DIST, W_SUMA } from './config.js';
import { gkTotal, scoreOf } from './scoring.js';
import { S } from './state.js';
import { shuffle } from './utils.js';

// ---------- algoritmo ----------
export function costOf(A,B){
  let sA=0,sB=0; const cA=[0,0,0,0,0,0], cB=[0,0,0,0,0,0];
  for(const p of A){ const v=scoreOf(p); sA+=v; cA[v]++; }
  for(const p of B){ const v=scoreOf(p); sB+=v; cB[v]++; }
  const nA=A.length, nB=B.length, m=(nA+nB)/2;          // con tamanos iguales se reduce a |sA-sB|
  const target = (gkTotal()===1) ? -GK_HANDICAP : 0;
  const dSum = Math.abs((sA*nB - sB*nA)*m/(nA*nB) - target);
  let dDist = 0;
  for(let v=1; v<=5; v++) dDist += Math.abs(cA[v]*m/nA - cB[v]*m/nB);
  return { cost: W_SUMA*dSum + W_DIST*dDist };
}
export function* combinations(pool,k){
  const n = pool.length;
  if(k>n || k<0) return;
  const idx = Array.from({length:k},(_,i)=>i);
  while(true){
    yield idx.map(i=>pool[i]);
    let i = k-1;
    while(i>=0 && idx[i] === i+n-k) i--;
    if(i<0) return;
    idx[i]++;
    for(let j=i+1;j<k;j++) idx[j] = idx[j-1]+1;
  }
}
export function nCk(n,k){ let r=1; for(let i=1;i<=k;i++) r = r*(n-k+i)/i; return r; }

export function buildCandidates(){
  S.players.forEach(p=>{                                           // se sortea el puntaje de Lesionado y Random
    if(p.arrow===6) p.rv = 1 + Math.floor(Math.random()*3);        // 1 a 3: Hace lo que puede, Irregular o Regular
    else if(p.arrow===7) p.rv = 1 + Math.floor(Math.random()*4);   // 1 a 4: de Hace lo que puede a Picante
  });
  if(S.mode==='liga'){ buildLiga(); applyLabels(); return; }
  const P = S.players, n = P.length;
  const gkIdx = [], free = [];
  P.forEach((p,i)=> p.isGK ? gkIdx.push(i) : free.push(i));
  const forcedA = [];
  if(gkIdx.length >= 1) forcedA.push(gkIdx[0]);
  const gk2 = gkIdx.length >= 2 ? gkIdx[1] : -1;
  if(forcedA.length === 0 && free.length) forcedA.push(free.shift());
  const pool = free.filter(i => i !== gk2);
  const sizes = n % 2 ? [(n-1)/2, (n+1)/2] : [n/2];       // con un jugador de mas, el equipo A puede ser el chico o el grande

  let best = Infinity, cands = [];
  sizes.forEach(sizeA=>{
    const needA = sizeA - forcedA.length;
    if(needA < 0 || needA > pool.length) return;
    const evaluate = pick => {
      const setA = new Set(forcedA.concat(pick));
      const A=[],B=[],ia=[],ib=[];
      P.forEach((p,i)=>{ if(setA.has(i)){ A.push(p); ia.push(i); } else { B.push(p); ib.push(i); } });
      const m = costOf(A,B);
      if(m.cost < best){ best = m.cost; cands = cands.filter(c=>c.cost <= best+TOL); }
      if(m.cost <= best+TOL && cands.length < 600) cands.push({cost:m.cost, t:[ia,ib]});
    };
    if(nCk(pool.length, needA) <= MAX_COMBOS){ for(const pick of combinations(pool,needA)) evaluate(pick); }
    else { for(let t=0;t<120000;t++) evaluate(shuffle(pool.slice()).slice(0,needA)); }
  });

  const seen = new Set();
  cands = cands.filter(c=>{ const k=c.t[0].join(','); if(seen.has(k)) return false; seen.add(k); return true; });
  cands.sort((x,y)=>x.cost-y.cost);
  cands.forEach(c=>{ if(Math.random() < 0.5) c.t = [c.t[1], c.t[0]]; });   // el equipo con un jugador de mas (y el arquero) no queda siempre en el mismo lado
  S.cands = cands.slice(0,40); S.candIdx = 0;
  applyLabels();
}

// Formato liga: k equipos de igual tamano. Reparto goloso por puntaje + mejora por intercambios.
export function buildLiga(){
  const P = S.players, k = S.liga.teams, per = S.liga.per;
  const gk = [], oth = [];
  P.forEach((p,i)=> p.isGK ? gk.push(i) : oth.push(i));
  const sc = i => scoreOf(P[i]);
  const stats = teams => {
    const sums = teams.map(t=>t.reduce((a,i)=>a+sc(i),0));
    const cnt = teams.map(t=>{ const c=[0,0,0,0,0,0]; t.forEach(i=>c[sc(i)]++); return c; });
    const spread = Math.max(...sums) - Math.min(...sums);
    let dist = 0;
    for(let v=1; v<=5; v++){ const col = cnt.map(c=>c[v]); dist += Math.max(...col) - Math.min(...col); }
    return {cost: W_SUMA*spread + W_DIST*dist, spread};
  };
  const make = () => {
    const teams = Array.from({length:k},()=>[]);
    shuffle(gk.slice()).forEach((i,j)=> teams[j%k].push(i));                // un arquero por equipo
    const order = shuffle(oth.slice()).sort((a,b)=>sc(b)-sc(a));
    const sum = t => t.reduce((a,i)=>a+sc(i),0);
    order.forEach(i=>{
      let bi = -1, bs = Infinity;
      teams.forEach((t,ti)=>{ if(t.length < per){ const v = sum(t) + Math.random()*0.5; if(v < bs){ bs = v; bi = ti; } } });
      teams[bi].push(i);
    });
    return teams;
  };
  const improve = teams => {
    let cur = stats(teams).cost;
    for(let it=0; it<500; it++){
      const a = Math.floor(Math.random()*k); let b = Math.floor(Math.random()*(k-1)); if(b >= a) b++;
      const ia = Math.floor(Math.random()*per), ib = Math.floor(Math.random()*per);
      const x = teams[a][ia], y = teams[b][ib];
      if(P[x].isGK !== P[y].isGK) continue;
      teams[a][ia] = y; teams[b][ib] = x;
      const c = stats(teams).cost;
      if(c <= cur) cur = c; else { teams[a][ia] = x; teams[b][ib] = y; }
    }
    return cur;
  };
  const seen = new Set(); let cands = [];
  for(let r=0; r<80; r++){
    const t = make(); const cost = improve(t);
    const canon = t.map(x=>x.slice().sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]);
    const key = canon.map(x=>x.join(',')).join('|');
    if(seen.has(key)) continue;
    seen.add(key);
    cands.push({cost, spread:stats(canon).spread, t:shuffle(canon.slice())});   // el orden al azar reparte los colores
  }
  cands.sort((x,y)=>x.cost-y.cost);
  S.cands = cands.slice(0,40); S.candIdx = 0;
}
export function teamsCurrent(){
  const c = S.cands[S.candIdx];
  return {teams: c.t.map(arr=>arr.map(i=>S.players[i])), c};
}
export function labelsFor(k){
  let def = Math.max(1, Math.round(k*0.4));
  let del = Math.max(1, Math.round(k*0.25));
  if(def+del > k){ del = 1; def = Math.max(1, k-2); }
  return {def, med: Math.max(0, k-def-del)};
}
export function applyLabels(){
  if(!S.cands.length) return;
  teamsCurrent().teams.forEach(team=>{
    const out = shuffle(team.filter(p=>!p.isGK));
    const {def,med} = labelsFor(out.length);
    out.forEach((p,i)=> p.label = i<def ? 'DEF' : (i<def+med ? 'MED' : 'DEL'));
    team.filter(p=>p.isGK).forEach(p=> p.label='POR');
  });
}
export const balanceWord = c => c<=1 ? 'MUY PAREJO' : c<=4 ? 'PAREJO' : c<=8 ? 'ACEPTABLE' : 'DESPAREJO';
export const balanceLiga = sp => sp<=1 ? 'MUY PAREJO' : sp<=2 ? 'PAREJO' : sp<=4 ? 'ACEPTABLE' : 'DESPAREJO';
