import { ic } from '../icons.js';
import { render } from '../router.js';
import { beep } from '../sound.js';
import { S } from '../state.js';
import { head, setCmd } from '../ui.js';
import { $ } from '../utils.js';

const artPl = (cls,name,gk) => '<div class="pl"><i class="dot '+cls+'"></i><span class="plate'+(gk?' gk':'')+'">'+name+'</span></div>';
function artPitch(){
  const line = a => '<div class="ap-line">'+a.join('')+'</div>';
  return '<div class="apitch"><div class="ap-hd">TU PLANTEL</div><div class="ap-field">'+
    line([artPl('d-del','GALLO'), artPl('d-del','MATI')])+
    line([artPl('d-med','FABI'), artPl('d-med','TIMO'), artPl('d-med','LUCHO')])+
    line([artPl('d-def','NACHO'), artPl('d-def','PEPE')])+
    line([artPl('d-por','JUAN',true)])+
  '</div></div>';
}
const ART_TEAMS = [
  ['Aston Birra',      '#d9342b','#f2c227', 4,1,1],
  ['Casados FC',       '#2f6fe0','#ffffff', 4,0,2],
  ['Solteros FC',      '#1c1f26','#e8e8e8', 3,2,1],
  ['Inter Milanesa',   '#2f9e3a','#f2c227', 3,1,2],
  ['Sporting Asado',   '#e8842a','#1c1f26', 2,2,2],
  ['Deportivo Fernet', '#6a3fc4','#ffffff', 2,1,3],
  ['Real Parrilla',    '#c4252b','#ffffff', 1,1,4],
  ['Atlético Choripán','#2aa7c9','#1c1f26', 0,2,4]
];
function artTabla(){
  const rows = ART_TEAMS.map((t,i)=>{
    const [n,c1,c2,g,e,pe] = t, pj = g+e+pe, pt = g*3+e;
    return '<div class="at-tr'+(i===0?' first':'')+'"><span class="at-pos">'+(i+1)+'</span>'+
      '<span class="at-name"><i class="at-crest" style="background:linear-gradient(90deg,'+c1+' 0 50%,'+c2+' 50% 100%)"></i>'+n+'</span>'+
      '<b>'+pt+'</b><b>'+pj+'</b><b>'+g+'</b><b>'+e+'</b><b>'+pe+'</b></div>';
  }).join('');
  return '<div class="atabla"><div class="at-tt">TABLA DE POSICIONES</div>'+
    '<div class="at-th"><span></span><span>Equipo</span><b>Pt</b><b>PJ</b><b>G</b><b>E</b><b>P</b></div>'+
    '<div class="at-body">'+rows+'</div></div>';
}
export const SLIDES = [
  { go:'importar', cls:'gold', img:'', art:'ART_LISTA',
    titulo:'IMPORTAR LISTA',
    texto:'Acá pegás la lista directamente y armás los dos equipos que van a jugar.' },
  { go:'liga',     cls:'blue', img:'', art:'ART_LIGA',
    titulo:'FORMATO LIGA',
    texto:'Si son muchos y juegan 3 equipos o más en un mismo turno, usá esta opción.' }
];
const ARTS = {ART_LISTA: artPitch, ART_LIGA: artTabla};

export function renderInicio(st){
  head('MENÚ','Elegí cómo armar los equipos','');
  st.className = 'stage single';
  st.innerHTML =
    '<div class="brand"><img src="assets/img/logo.svg" alt="" width="50" height="55"><span>PICADITO APP</span></div>'+
    '<div class="carousel">'+
      '<button class="cnav prev" id="cprev" aria-label="Anterior">'+ic('chevL',20)+'</button>'+
      '<button class="cnav next" id="cnext" aria-label="Siguiente">'+ic('chevR',20)+'</button>'+
      '<div class="track" id="track">'+
        SLIDES.map(sl =>
          '<div class="cslide"><button class="card '+sl.cls+'" data-go="'+sl.go+'">'+
            '<div class="art">'+ ARTS[sl.art]() +
              (sl.img ? '<img src="'+sl.img+'" alt="" onerror="this.style.display=\'none\'">' : '')+
            '</div>'+
            '<div class="band"><h3>'+sl.titulo+'</h3><p>'+sl.texto+'</p></div>'+
          '</button></div>').join('')+
      '</div>'+
    '</div>'+
    '<div class="cdots">'+ SLIDES.map((_,i)=>
      '<button class="'+(i===S.slide?'on':'')+'" data-dot="'+i+'" aria-label="Ir a la opción '+(i+1)+'"></button>').join('')+
    '</div>';

  const track = $('track');
  const paint = () => {
    track.style.transform = 'translateX(-'+(S.slide*100)+'%)';
    st.querySelectorAll('[data-dot]').forEach((d,i)=> d.classList.toggle('on', i===S.slide));
  };
  const goTo = i => {
    const n = Math.max(0, Math.min(SLIDES.length-1, i));
    if(n !== S.slide){ S.slide = n; beep('slide'); }
    paint();
  };
  paint();

  $('cprev').addEventListener('click', ()=> goTo(S.slide-1));
  $('cnext').addEventListener('click', ()=> goTo(S.slide+1));
  st.querySelectorAll('[data-dot]').forEach(d=> d.addEventListener('click', ()=> goTo(+d.dataset.dot)));

  // arrastre con dedo o mouse
  let x0=null, dx=0, w=1, moved=false;
  const down = x => { x0=x; dx=0; moved=false; w=track.getBoundingClientRect().width||1; track.classList.add('dragging'); };
  const move = x => {
    if(x0===null) return;
    dx = x - x0;
    if(Math.abs(dx) > 8) moved = true;
    track.style.transform = 'translateX(calc(-'+(S.slide*100)+'% + '+dx+'px))';
  };
  const up = () => {
    if(x0===null) return;
    track.classList.remove('dragging');
    const umbral = Math.min(70, w*0.18);
    if(dx <= -umbral) goTo(S.slide+1);
    else if(dx >= umbral) goTo(S.slide-1);
    else paint();
    x0=null;
  };
  track.addEventListener('touchstart', e=> down(e.touches[0].clientX), {passive:true});
  track.addEventListener('touchmove',  e=> move(e.touches[0].clientX), {passive:true});
  track.addEventListener('touchend', up);
  track.addEventListener('mousedown', e=>{ e.preventDefault(); down(e.clientX); });
  window.addEventListener('mousemove', move2);
  window.addEventListener('mouseup', up2);
  function move2(e){ if(x0!==null) move(e.clientX); }
  function up2(){ if(x0!==null) up(); }

  st.querySelectorAll('[data-go]').forEach(b=> b.addEventListener('click', e=>{
    if(moved){ e.preventDefault(); return; }   // no abrir si venias arrastrando
    S.mode = b.dataset.go === 'liga' ? 'liga' : 'partido';
    S.alert=''; S.step = S.mode==='liga' ? 'formato' : 'importar'; render();
  }));

  setCmd([]);
}
