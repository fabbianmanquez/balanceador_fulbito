import { listStatus } from '../match.js';
import { parseAll, parseList } from '../parser.js';
import { render } from '../router.js';
import { S } from '../state.js';
import { alertBox, head, navBack, setCmd, setPop } from '../ui.js';
import { $, esc } from '../utils.js';

export function renderImportar(st){
  head('', S.mode==='liga' ? 'Liga · pegá la lista' : 'Pegá el mensaje','');
  st.className = 'stage single';
  st.innerHTML =
    '<div class="panel"><div class="phead">LISTA DE JUGADORES'+(S.mode==='liga' ? ' · '+S.liga.teams+' EQUIPOS DE '+S.liga.per : '')+'</div>'+
      '<div class="taWrap"><textarea id="rawIn" class="lined" placeholder="Pegá la lista como venga: 1. Timo / 2 Fabi / 3-Juan / 10Gallo / o separados por coma">'+esc(S.raw)+'</textarea>'+
        '<div class="pop" id="pop" role="status" aria-live="polite" hidden></div></div>'+
      '<div class="menu" style="margin-top:6px"><button class="mbtn" id="doParse">Leer la lista</button></div>'+
    '</div>'+ alertBox();
  $('doParse').addEventListener('click', ()=>{
    S.raw = $('rawIn').value;
    const {names, info} = parseAll(S.raw);
    if(names.length < 4){ S.alert = 'Solo detecté <b>'+names.length+'</b> nombre(s)'; render(); return; }
    S.alert=''; S.draft=names; S.venue=info; S.step='revisar'; render();
  });
  const paintPop = () => setPop($('pop'), listStatus(parseList($('rawIn').value)));
  $('rawIn').addEventListener('input', paintPop);
  paintPop();
  setCmd(navBack());
  $('rawIn').focus();
}
