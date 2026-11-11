import { listStatus } from '../match.js';
import { parseAll, parseList } from '../parser.js';
import { render } from '../router.js';
import { S } from '../state.js';
import { alertBox, cmd, head, navBack, setCmd, setPop } from '../ui.js';
import { $, esc } from '../utils.js';

export function readList(){
  const ta = $('rawIn');
  if(ta) S.raw = ta.value;
  const {names, info} = parseAll(S.raw);
  if(names.length < 4){ S.alert = 'Solo detecté <b>'+names.length+'</b> nombre(s)'; render(); return; }
  S.alert=''; S.draft=names; S.venue=info; S.step='revisar'; render();
}

export function renderImportar(st){
  head('', S.mode==='liga' ? 'Liga · pegá la lista o anotalos directamente' : 'Pegá el mensaje o anotalos directamente','');
  st.className = 'stage single';
  st.innerHTML =
    '<div class="panel"><div class="phead">LISTA DE JUGADORES'+(S.mode==='liga' ? ' · '+S.liga.teams+' EQUIPOS DE '+S.liga.per : '')+'</div>'+
      '<div class="taWrap"><textarea id="rawIn" class="lined" placeholder="Pegá la lista como venga o escribila directamente: 1. Timo / 2 Fabi / 3-Juan / 10Gallo / o separados por coma">'+esc(S.raw)+'</textarea>'+
        '<div class="pop" id="pop" role="status" aria-live="polite" hidden></div></div>'+
    '</div>'+ alertBox();
  const paintPop = () => setPop($('pop'), listStatus(parseList($('rawIn').value)));
  $('rawIn').addEventListener('input', paintPop);
  paintPop();
  setCmd(navBack([cmd('leer')]));
  $('rawIn').focus();
}
