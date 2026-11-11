import { listStatus } from '../match.js';
import { isPlaceholder, renumber } from '../numbering.js';
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

// Mientras se escribe a mano, cada renglón nuevo trae su número; al pegar o salir del campo se corrige la numeración.
function wireNumbering(ta, onChange){
  let prev = ta.value;
  const setValue = (v, caret) => { ta.value = v; ta.setSelectionRange(caret, caret); prev = v; onChange(); };
  const lineAt = pos => {
    const v = ta.value, start = v.lastIndexOf('\n', pos - 1) + 1;
    let end = v.indexOf('\n', pos); if(end < 0) end = v.length;
    return {start, end, text: v.slice(start, end)};
  };
  const prefixFirst = () => {
    if(prev === '' && ta.value !== '' && !/^\s*\d/.test(ta.value)){
      const v = '1. ' + ta.value.trimStart();
      ta.value = v; ta.setSelectionRange(v.length, v.length);
    }
  };

  ta.addEventListener('beforeinput', e => {
    if(ta.selectionStart !== ta.selectionEnd) return;
    const pos = ta.selectionStart, v = ta.value, line = lineAt(pos);
    if(e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph'){
      e.preventDefault();
      if(isPlaceholder(line.text) || !line.text.trim()) return;                 // sin renglones vacíos
      const text = renumber(v.slice(0, pos) + '\n' + v.slice(pos), {placeholder: true});
      const lines = text.split('\n'), row = (v.slice(0, pos).match(/\n/g) || []).length + 1;
      const offset = lines.slice(0, row).reduce((a, l) => a + l.length + 1, 0);
      const prefix = (lines[row] || '').match(/^\d{1,3}\.\s?/);
      setValue(text, row < lines.length ? offset + (prefix ? prefix[0].length : 0) : text.length);
    } else if(e.inputType === 'deleteContentBackward' && isPlaceholder(line.text) && pos === line.end){
      e.preventDefault();                                                       // borra el renglón que solo tiene el número
      if(line.start === 0) setValue('', 0);
      else setValue(v.slice(0, line.start - 1) + v.slice(line.end), line.start - 1);
    }
  });
  ta.addEventListener('input', e => {
    if(e.isComposing) return;
    if(e.inputType !== 'insertFromPaste') prefixFirst();
    prev = ta.value; onChange();
  });
  ta.addEventListener('compositionend', () => { prefixFirst(); prev = ta.value; onChange(); });
  ta.addEventListener('paste', () => setTimeout(() => { const v = renumber(ta.value); setValue(v, v.length); }, 0));
  ta.addEventListener('blur', () => {
    const v = renumber(ta.value);
    if(v !== ta.value){ ta.value = v; prev = v; onChange(); }
  });
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
  wireNumbering($('rawIn'), paintPop);
  paintPop();
  setCmd(navBack([cmd('leer')]));
  $('rawIn').focus();
}
