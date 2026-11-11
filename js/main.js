/* Punto de entrada. */

import './actions.js';
import { renderCarga } from './screens/carga.js';
import { renderEquipos } from './screens/equipos.js';
import { renderFormato } from './screens/formato.js';
import { ic } from './icons.js';
import { initIdle } from './idle.js';
import { renderImportar } from './screens/importar.js';
import { renderInicio, SLIDES } from './screens/menu.js';
import { renderRevisar } from './screens/revisar.js';
import { ACTIONS, render, SCREENS } from './router.js';
import { renderSlides } from './screens/slides.js';
import { beep, initSound } from './sound.js';
import { S } from './state.js';
import { $ } from './utils.js';

document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && S.step!=='inicio'){ beep('back'); ACTIONS.back(); return; }
  if(S.step==='inicio' && (e.key==='ArrowLeft' || e.key==='ArrowRight')){
    const n = S.slide + (e.key==='ArrowRight' ? 1 : -1);
    if(n>=0 && n<SLIDES.length){ S.slide=n; beep('slide'); render(); }
  }
});

$('sndBtn').innerHTML = ic('sndOn',15);
document.getElementById('sndBtn').addEventListener('click', function(){
  S.sound = !S.sound;
  this.innerHTML = ic(S.sound ? 'sndOn' : 'sndOff', 15);
  this.title = S.sound ? 'Sonido activado' : 'Sonido silenciado';
  if(S.sound) beep('move');
});

Object.assign(SCREENS, {
  inicio: renderInicio, formato: renderFormato, importar: renderImportar, revisar: renderRevisar,
  slides: renderSlides, carga: renderCarga, equipos: renderEquipos
});
initSound();
initIdle();
render();
