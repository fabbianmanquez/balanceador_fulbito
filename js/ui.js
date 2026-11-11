/* Piezas de interfaz reutilizables: barra, comandos, globos y carteles. */

import { ic } from './icons.js';
import { ACTIONS } from './router.js';
import { beep } from './sound.js';
import { S } from './state.js';
import { $, esc } from './utils.js';

export function setPop(el, st){
  if(!st){ el.hidden = true; return; }
  const was = el.dataset.kind;
  el.hidden = false;
  el.className = el.className.replace(/\b(ok|warn|bad)\b/g,'').trim() + ' ' + st.kind;
  el.innerHTML = st.html;
  if(was !== st.kind){ el.style.animation='none'; void el.offsetWidth; el.style.animation=''; }
  el.dataset.kind = st.kind;
}

export function askModal(o, onYes){
  const ov = document.createElement('div');
  ov.className = 'modal-ov'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true');
  ov.innerHTML = '<div class="modal"><div class="phead">'+esc(o.title||'ATENCIÓN')+'</div><p>'+esc(o.text)+'</p>'+
    '<div class="menu"><button class="mbtn" data-yes="1">'+esc(o.yes||'Sí')+'</button>'+
    '<button class="mbtn" data-no="1">'+esc(o.no||'No')+'</button></div></div>';
  const close = () => { ov.remove(); window.removeEventListener('keydown', onKey, true); };
  const onKey = e => { if(e.key==='Escape'){ e.stopImmediatePropagation(); e.preventDefault(); beep('back'); close(); } };
  ov.addEventListener('click', e=>{ if(e.target===ov) close(); });
  ov.querySelector('[data-no]').addEventListener('click', close);
  ov.querySelector('[data-yes]').addEventListener('click', ()=>{ close(); onYes(); });
  window.addEventListener('keydown', onKey, true);
  document.body.appendChild(ov);
  ov.querySelector('[data-yes]').focus();
}

export function head(tag,title,count){
  $('tag').textContent = tag;
  $('tag').parentElement.hidden = !tag;
  $('title').textContent = title;
  $('count').innerHTML = count || '&nbsp;';
}
// "Volver atrás" y "Menú principal" viven en la barra superior; los comandos que avanzan
// (marcados con next) van al final de la barra de abajo, en la esquina derecha.
export function setCmd(items){
  const isNav = it => it.act==='back' || it.act==='home';
  const rest = items.filter(it=>!isNav(it));
  const ordered = rest.filter(it=>!it.next).concat(rest.filter(it=>it.next));
  $('backBtn').hidden = !items.some(it=>it.act==='back');
  $('homeBtn').classList.toggle('static', !items.some(it=>it.act==='home'));
  $('cmdbar').innerHTML = ordered.map(it=>
    '<button class="cmd '+it.tone+(it.next?' next':'')+'" data-act="'+it.act+'" title="'+esc(it.label)+'"'+
      (it.off?' disabled':'')+'><span class="k">'+it.icon+'</span>'+esc(it.label)+'</button>').join('');
  $('cmdbar').querySelectorAll('button').forEach(b=>
    b.addEventListener('click', ()=> ACTIONS[b.dataset.act] && ACTIONS[b.dataset.act]()));
}
export function initNav(){
  ['backBtn','homeBtn'].forEach(id=>
    $(id).addEventListener('click', ()=> ACTIONS[$(id).dataset.act]()));
}

const CMD = {
  back:   {act:'back',        tone:'t-back',  icon:ic('back'),    label:'Volver atrás'},
  home:   {act:'home',        tone:'t-home',  icon:ic('home'),    label:'Menú principal'},
  leer:   {act:'readList',    tone:'t-go',    icon:ic('check'),   label:'Leer la lista',  next:true},
  nivel:  {act:'startSlides', tone:'t-go',    icon:ic('levels'),  label:'Armar plantel',  next:true},
  plantel:{act:'finishSlides',tone:'t-go',    icon:ic('check'),   label:'Ir al plantel',  next:true},
  armar:  {act:'armar',       tone:'t-go',    icon:ic('ball'),    label:'Armar equipos',  next:true},
  formato:{act:'formatoOk',   tone:'t-go',    icon:ic('check'),   label:'Continuar',      next:true},
  vaciar: {act:'clearAll',    tone:'t-del',   icon:ic('trash'),   label:'Vaciar plantel'},
  editOff:{act:'editOff',     tone:'t-edit',  icon:ic('pencil'),  label:'Terminar edición'},
  vista:  {act:'toggleView',  tone:'t-alt',   icon:ic('swap'),    label:'Cambiar vista'},
  rand:   {act:'reroll',      tone:'t-rand',  icon:ic('shuffle'), label:'Volver a mezclar equipos'},
  share:  {act:'toggleShare', tone:'t-share', icon:ic('chat'),    label:'Compartir por WhatsApp', next:true},
  img:    {act:'sendImage',   tone:'t-img',   icon:ic('image'),   label:'Enviar imagen por WhatsApp'},
  copiar: {act:'copyShare',   tone:'t-share', icon:ic('copy'),    label:'Copiar texto'}
};
export const cmd = (key, over) => Object.assign({}, CMD[key], over||{});
export const navBack = extra => {
  const acts = extra || [];
  return acts.concat([cmd('back'), cmd('home')]);
};
export const alertBox = () => S.alert ? '<div class="alert">'+S.alert+'</div>' : '';

export function toast(text){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role','status'); t.textContent = text;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 7000);
}
