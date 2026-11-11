import { ARROW_TXT, LEVELS, MAX_GK } from '../config.js';
import { levelSvg } from '../icons.js';
import { perTeamText } from '../match.js';
import { render } from '../router.js';
import { gkTotal } from '../scoring.js';
import { S } from '../state.js';
import { cmd, head, navBack, setCmd } from '../ui.js';
import { $, esc } from '../utils.js';

export function renderCarga(st){
  const loaded = S.players.filter(x=>x.name.trim()).length;
  const full = loaded === S.players.length;
  const editing = !full || S.editing;
  const p = S.players[S.sel];
  const gkFull = gkTotal() >= MAX_GK && !p.isGK;
  head('PLANTEL', S.cancha.label, loaded+' / '+S.players.length);
  st.className = 'stage';

  const tag = editing ? 'button' : 'div';
  const listHtml =
    '<div class="panel"><div class="phead">JUGADORES</div><div class="list">'+
      S.players.map((x,i)=>'<'+tag+' class="row'+((editing&&i===S.sel)?' sel':'')+(x.name.trim()?'':' empty')+'"'+
        (editing ? ' data-i="'+i+'"' : ' style="cursor:default"')+'>'+
        (x.isGK ? '<span class="badge por">POR</span>' : '')+
        '<span class="nm">'+esc(x.name.trim()||'Sin nombre')+'</span>'+
        (x.isGK?'':levelSvg(x.arrow,15))+'</'+tag+'>').join('')+
    '</div></div>';

  const editHtml =
    '<div class="panel"><div class="phead">'+(p.isGK?'ARQUERO FIJO':'JUGADOR DE CAMPO')+'</div>'+
      '<input type="text" id="nameIn" maxlength="18" placeholder="Nombre" value="'+esc(p.name)+'" autocomplete="off">'+
      '<div class="arrows">'+LEVELS.map(v=>
        '<button data-v="'+v+'" aria-label="'+ARROW_TXT[v]+'" title="'+ARROW_TXT[v]+'"'+
        ((!p.isGK && p.arrow===v)?' class="on"':'')+(p.isGK?' disabled':'')+'>'+levelSvg(v,22)+'</button>').join('')+'</div>'+
      '<div class="sbox" style="margin-top:8px"><h4>NIVEL</h4><p class="sm">'+(p.isGK?'—':ARROW_TXT[p.arrow])+'</p></div>'+
      '<div class="menu"><button class="mbtn" data-togglegk="1"'+(gkFull?' disabled':'')+'>'+
        (p.isGK?'Quitar arquero fijo':'Marcar arquero fijo')+'</button></div>'+
    '</div>';

  const summaryHtml =
    '<div class="panel"><div class="phead">RESUMEN</div>'+
      '<div class="sbox"><h4>MODALIDAD</h4><p class="sm">'+esc(S.cancha.label)+'</p></div>'+
      (S.mode==='liga' ? '<div class="sbox"><h4>EQUIPOS</h4><p>'+S.liga.teams+'</p></div>' : '')+
      '<div class="sbox"><h4>POR EQUIPO</h4><p>'+perTeamText(S.players.length)+'</p></div>'+
      '<div class="sbox"><h4>ARQUEROS FIJOS</h4><p>'+gkTotal()+'</p></div>'+
      '<div class="menu"><button class="mbtn" id="editOn">Editar jugadores</button></div>'+
    '</div>';

  st.innerHTML = listHtml + (editing ? editHtml : summaryHtml);

  if(editing){
    st.querySelectorAll('[data-i]').forEach(b=> b.addEventListener('click',()=>{ commitName(); S.sel=+b.dataset.i; render(); focusName(); }));
    st.querySelectorAll('.arrows button').forEach(b=> b.addEventListener('click',()=>{ commitName(); S.players[S.sel].arrow=+b.dataset.v; render(); focusName(); }));
    st.querySelectorAll('[data-togglegk]').forEach(b=> b.addEventListener('click',()=>{ commitName(); p.isGK=!p.isGK; render(); focusName(); }));
    const inp = $('nameIn');
    inp.addEventListener('input', e=> S.players[S.sel].name = e.target.value);
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){ commitName(); if(S.sel<S.players.length-1) S.sel++; render(); focusName(); } });
  } else {
    $('editOn').addEventListener('click', ()=>{ S.editing=true; S.sel=0; render(); focusName(); });
  }

  const extra = editing
    ? [cmd('vaciar')].concat(full ? [cmd('editOff')] : [])
    : [];
  setCmd(navBack(extra.concat([cmd('armar',{off:!full})])));
}
export function commitName(){ const i=$('nameIn'); if(i) S.players[S.sel].name = i.value; }
export function focusName(){ const i=$('nameIn'); if(i){ i.focus(); i.setSelectionRange(i.value.length,i.value.length); } }
