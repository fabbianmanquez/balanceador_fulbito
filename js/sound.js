/* Sonidos de la interfaz. */

import { S } from './state.js';

/* ---- sonido de interfaz -------------------------------------
   'confirm' confirm.mp3     (enter / avanzar)
   'back'    back.wav        (volver / borrar)
   'slide'   back.wav x1.5   (carrusel del menu)
   'move'    back.wav x2     (filas, flechas de nivel, + y -)
   Si un archivo no carga, suena un blip sintetizado con Web Audio.
   ------------------------------------------------------------ */
const SOUND_FILES = {
  confirm: 'assets/sfx/confirm.mp3',
  back:    'assets/sfx/back.wav'
};
const SOUND_VOL = 0.55;
// effect navigate.wav acelerado: mas rapido = mas agudo y mas corto
const SOUND_RATES = {slide:1.5, move:2};
const BUF = {};
let sfxTried = false;

function loadSounds(){
  if(sfxTried) return; sfxTried = true;
  const ac = actx(); if(!ac) return;
  Object.keys(SOUND_FILES).forEach(k=>{
    fetch(SOUND_FILES[k])
      .then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error('404')))
      .then(b => ac.decodeAudioData(b))
      .then(buf => { BUF[k] = buf; })
      .catch(()=>{});   // sin archivo, queda el sonido sintetizado
  });
}
function playFile(kind, rate){
  const ac = actx(); if(!ac || !BUF[kind]) return false;
  const src = ac.createBufferSource(), g = ac.createGain();
  src.buffer = BUF[kind];
  if(rate) src.playbackRate.value = rate;
  g.gain.value = SOUND_VOL;
  src.connect(g).connect(ac.destination);
  src.start(0);
  return true;
}

let AC = null;
function actx(){
  if(!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); }catch{ return null; } }
  if(AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(ac, t0, {freq, to, type, dur, vol, delay}){
  const o = ac.createOscillator(), g = ac.createGain();
  const t = t0 + (delay || 0);
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, t);
  if(to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
export function beep(kind){
  if(!S.sound) return;
  const ac = actx(); if(!ac) return;
  loadSounds();
  if(SOUND_RATES[kind]){                      // 'slide' y 'move': el sonido de "volver" a otro tono
    if(playFile('back', SOUND_RATES[kind])) return;
  } else if(playFile(kind)) return;
  const t = ac.currentTime;
  if(kind === 'confirm'){
    tone(ac,t,{freq:360,type:'triangle',dur:0.16,vol:0.16});
    tone(ac,t,{freq:1500,type:'square',dur:0.07,vol:0.05,delay:0.01});
  } else if(kind === 'back'){
    tone(ac,t,{freq:340,to:190,type:'square',dur:0.13,vol:0.11});
  } else {
    tone(ac,t,{freq:1500,type:'square',dur:0.045,vol:0.07});
  }
}

export function initSound(){
  document.addEventListener('click', e=>{
    const b = e.target.closest('button');
    if(!b || b.disabled || b.id === 'sndBtn') return;
    const act = b.dataset.act;
    if(act === 'back' || act === 'home' || act === 'clearAll' || b.classList.contains('del') || b.hasAttribute('data-no')) beep('back');
    else if(b.classList.contains('cnav') || b.parentElement && b.parentElement.classList.contains('cdots')) return;
    else if(b.classList.contains('cmd') || b.classList.contains('mbtn') || b.classList.contains('card') || b.classList.contains('sug')) beep('confirm');
    else beep('move');
  }, true);
  document.addEventListener('pointerdown', loadSounds, {once:true, capture:true});
  document.addEventListener('keydown', loadSounds, {once:true, capture:true});
  document.addEventListener('keydown', e=>{
    if(e.key==='Enter' && e.target.matches && e.target.matches('input[type=text]')) beep('confirm');
  });
}
