import { LIGA_MAX_PER, LIGA_MAX_TEAMS, LIGA_MIN_PER, LIGA_MIN_TEAMS } from '../config.js';
import { render } from '../router.js';
import { S } from '../state.js';
import { cmd, head, navBack, setCmd } from '../ui.js';

export function renderFormato(st){
  const L = S.liga, total = L.teams * L.per;
  head('LIGA','Formato liga','');
  st.className = 'stage single';
  const row = (key,label,min,max) =>
    '<div class="strow"><label>'+label+'</label><div class="stepper">'+
      '<button class="stbtn" data-k="'+key+'" data-d="-1" aria-label="Menos"'+(L[key]<=min?' disabled':'')+'>−</button>'+
      '<div class="stval">'+L[key]+'</div>'+
      '<button class="stbtn" data-k="'+key+'" data-d="1" aria-label="Más"'+(L[key]>=max?' disabled':'')+'>+</button>'+
    '</div></div>';
  const presets = [[3,4],[3,5],[4,4],[4,5]];
  st.innerHTML =
    '<div class="panel"><div class="phead">ARMÁ EL FORMATO</div>'+
      row('teams','Equipos',LIGA_MIN_TEAMS,LIGA_MAX_TEAMS)+row('per','Jugadores por equipo',LIGA_MIN_PER,LIGA_MAX_PER)+
      '<div class="sbox" style="margin-top:8px"><h4>FORMATO</h4><p class="sm">'+L.teams+' equipos de '+L.per+' jugadores</p></div>'+
      '<div class="sbox"><h4>TOTAL A ANOTAR</h4><p>'+total+'</p></div>'+
    '</div>'+
    '<div class="panel"><div class="phead">ATAJOS</div><div class="menu">'+
      presets.map(([t,pp])=>'<button class="mbtn'+(L.teams===t&&L.per===pp?' on':'')+'" data-t="'+t+'" data-p="'+pp+'">'+
        t+' equipos de '+pp+'</button>').join('')+
    '</div></div>';
  st.querySelectorAll('.stbtn').forEach(b=> b.addEventListener('click',()=>{
    const k = b.dataset.k, lim = k==='teams' ? [LIGA_MIN_TEAMS,LIGA_MAX_TEAMS] : [LIGA_MIN_PER,LIGA_MAX_PER];
    L[k] = Math.max(lim[0], Math.min(lim[1], L[k] + (+b.dataset.d))); render();
  }));
  st.querySelectorAll('[data-t]').forEach(b=> b.addEventListener('click',()=>{
    L.teams = +b.dataset.t; L.per = +b.dataset.p; render();
  }));
  setCmd(navBack([cmd('formato')]));
}
