import { CANCHAS } from '../config.js';
import { listStatus, matchFor, perTeamText } from '../match.js';
import { dupInfo, nameKey, suggestName } from '../parser.js';
import { render } from '../router.js';
import { S } from '../state.js';
import { cmd, head, navBack, setCmd, setPop } from '../ui.js';
import { $, esc } from '../utils.js';

export function renderRevisar(st){
  const n = S.draft.length, m = matchFor(n);
  head('REVISIÓN', m.ok ? m.label : 'Ajustá la lista', n + ' NOMBRES');
  st.className = 'stage';
  const {dup, later} = dupInfo(S.draft);
  const taken = new Set(S.draft.map(nameKey));
  const sug = {};
  S.draft.forEach((nm,i)=>{ if(later.has(i)) sug[i] = suggestName(nm, taken); });
  let warn = '';
  const warned = new Set();
  [...later].forEach(i=>{
    const k = nameKey(S.draft[i]);
    if(warned.has(k)) return;
    warned.add(k);
    warn += '<div class="alert">Nombre repetido: <b>'+esc(S.draft[i].trim())+'</b>. No se puede armar con dos iguales. '+
      'Tocá el nombre para editarlo (te traigo <b>'+esc(sug[i])+'</b>) y confirmá con Enter</div>';
  });
  if(m.kind==='plus'){
    warn += '<div class="alert">Son <b>'+n+'</b> en vez de <b>'+m.c.n+'</b> para un F'+m.c.id+': te voy a pedir confirmación al armar el plantel</div>';
  } else if(m.kind==='liga' && !m.ok){
    const d = m.total - n;
    warn += '<div class="alert">'+S.liga.teams+' equipos de '+S.liga.per+': '+(d>0 ? 'falta'+(d>1?'n':'')+' <b>'+d+'</b>' : 'sobra'+(d<-1?'n':'')+' <b>'+(-d)+'</b>')+'</div>';
  } else if(!m.ok){
    const near = CANCHAS.reduce((a,b)=> Math.abs(b.n-n) < Math.abs(a.n-n) ? b : a);
    const d = n - near.n;
    warn += '<div class="alert">'+near.label+': '+(d>0 ? 'sobra'+(d>1?'n':'')+' <b>'+d+'</b>' : 'falta'+(d<-1?'n':'')+' <b>'+(-d)+'</b>')+'</div>';
  }
  st.innerHTML =
    '<div class="panel"><div class="phead">NOMBRES DETECTADOS</div><div class="list">'+
      S.draft.map((nm,i)=>{
        const isDup = dup.has(nameKey(nm));
        return '<div class="row'+(isDup?' dup':'')+'" style="cursor:default">'+
        (isDup ? '<input type="text" class="nm-edit" data-edit="'+i+'" value="'+esc(nm)+'" maxlength="24" '+
                   'autocomplete="off" aria-label="Editar nombre repetido">'
               : '<span class="nm">'+esc(nm)+'</span>')+
        (isDup ? '<span class="badge rep">REPETIDO</span>' : '')+
        (later.has(i) ? '<button class="sug" data-sug="'+i+'">Usar '+esc(sug[i])+'</button>' : '')+
        '<button class="del" data-del="'+i+'" aria-label="Quitar">×</button></div>';
      }).join('')+
    '</div></div>'+
    '<div class="panel"><div class="phead">AGREGAR</div>'+
      '<input type="text" id="addIn" maxlength="18" placeholder="Nombre y Enter" autocomplete="off">'+
      '<div class="pop inline" id="pop" role="status" aria-live="polite" hidden></div>'+
      (S.venue ? '<div class="sbox" style="margin-top:6px"><h4>CANCHA Y HORA</h4><p class="sm">'+esc(S.venue)+'</p></div>' : '')+
      '<div class="sbox" style="margin-top:6px"><h4>MODALIDAD</h4><p class="sm">'+(m.ok?m.label:'—')+'</p></div>'+
      '<div class="sbox"><h4>POR EQUIPO</h4><p>'+(m.ok?perTeamText(n):'—')+'</p></div>'+
    '</div>'+ warn;
  st.querySelectorAll('[data-edit]').forEach(inp=>{
    const i = +inp.dataset.edit, orig = S.draft[i];
    let dirty = false;
    inp.addEventListener('focus', ()=>{
      if(sug[i]) inp.value = sug[i];
      inp.select();
    });
    inp.addEventListener('input', ()=>{ dirty = true; });
    inp.addEventListener('keydown', e=>{
      if(e.key==='Enter'){
        const v = inp.value.trim();
        if(v){ S.draft[i] = v; render(); }
      } else if(e.key==='Escape'){ inp.blur(); }
    });
    inp.addEventListener('blur', ()=>{
      const v = inp.value.trim();
      if(dirty && v && v !== orig){ S.draft[i] = v; render(); }
      else inp.value = orig;
    });
  });
  st.querySelectorAll('[data-sug]').forEach(b=> b.addEventListener('click',()=>{ S.draft[+b.dataset.sug] = sug[+b.dataset.sug]; render(); }));
  st.querySelectorAll('[data-del]').forEach(b=> b.addEventListener('click',()=>{ S.draft.splice(+b.dataset.del,1); render(); }));
  const paintPop = () => {
    const v = $('addIn').value.trim();
    if(!v){ setPop($('pop'), listStatus(S.draft)); return; }
    if(S.draft.some(x=>nameKey(x)===nameKey(v)))
      setPop($('pop'), {kind:'bad', html:'<b>'+esc(v)+'</b> ya está en la lista'});
    else setPop($('pop'), listStatus(S.draft.concat(v)));
  };
  $('addIn').addEventListener('input', paintPop);
  paintPop();
  $('addIn').addEventListener('keydown', e=>{
    if(e.key==='Enter' && e.target.value.trim()){ S.draft.push(e.target.value.trim()); render(); $('addIn').focus(); }
  });
  setCmd(navBack([cmd('nivel',{off:!m.ok || dup.size>0})]));
}
