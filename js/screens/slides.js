import { ARROW_TXT, MAX_GK } from '../config.js';
import { levelSvg } from '../icons.js';
import { render } from '../router.js';
import { gkTotal } from '../scoring.js';
import { S } from '../state.js';
import { cmd, head, navBack, setCmd } from '../ui.js';
import { esc } from '../utils.js';

export function renderSlides(st){
  const i = S.slideIdx, p = S.players[i];
  const gk = gkTotal(), gkFull = gk >= MAX_GK && !p.isGK;
  head('ARMAR', p.name, '');
  st.className = 'stage single';
  st.innerHTML =
    '<div class="panel slide"><div class="slidename">'+esc(p.name)+'</div><div class="menu">'+
      '<button class="mbtn'+(p.isGK?' on':'')+'" data-gk="1"'+(gkFull?' disabled':'')+'>'+
        '<span class="lead"><span class="badge por">POR</span></span>Arquero fijo</button>'+
      [5,4,3,2,1,6,7].map(v=>'<button class="mbtn'+((p.set && !p.isGK && p.arrow===v)?' on':'')+'" data-v="'+v+'">'+
        '<span class="lead">'+levelSvg(v,20)+'</span>'+ARROW_TXT[v]+'</button>').join('')+
    '</div>'+
    '<div class="dots">'+S.players.map((x,j)=>'<span class="dot'+(j===i?' cur':(x.set?' done':''))+'"></span>').join('')+'</div>'+
    '</div>'+
    (gkFull ? '<div class="alert">Tope de <b>'+MAX_GK+'</b> arqueros alcanzado</div>' : '');
  st.querySelectorAll('[data-v]').forEach(b=> b.addEventListener('click',()=>{
    p.isGK=false; p.arrow=+b.dataset.v; p.set=true; nextSlide();
  }));
  st.querySelectorAll('[data-gk]').forEach(b=> b.addEventListener('click',()=>{
    if(gkFull) return; p.isGK=true; p.set=true; nextSlide();
  }));
  setCmd(navBack([cmd('plantel',{off:!S.players.every(x=>x.set)})]));
}
function nextSlide(){
  if(S.slideIdx < S.players.length-1){ S.slideIdx++; render(); }
  else { S.editing=false; S.step='carga'; S.sel=0; render(); }
}
