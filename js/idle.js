/* Reinicio por inactividad. */

import { ACTIONS } from './router.js';
import { S } from './state.js';
import { toast } from './ui.js';

// ---------- inactividad: a los 10 minutos sin tocar nada se vuelve al menu con todo vacio ----------
const IDLE_MS = 10 * 60 * 1000;
let lastActive = Date.now();

function checkIdle(){
  if(Date.now() - lastActive < IDLE_MS || S.step === 'inicio') return;
  document.querySelectorAll('.modal-ov').forEach(m=>m.remove());
  Object.assign(S, {mode:'partido', liga:{teams:3, per:4}, cancha:null, cands:[], candIdx:0, view:'lista',
    editing:false, share:false, copied:'', slide:0, sel:0, slideIdx:0});
  ACTIONS.home();
  toast('Se reinició la app por 10 minutos sin actividad.');
}

export function initIdle(){
  ['pointerdown','keydown','input','touchstart'].forEach(ev=> document.addEventListener(ev, ()=>{ lastActive = Date.now(); }, true));
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) checkIdle(); });
  setInterval(checkIdle, 30000);
}
