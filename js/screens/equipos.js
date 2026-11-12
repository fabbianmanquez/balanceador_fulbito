import { balanceLiga, balanceWord, teamsCurrent } from '../balance.js';
import { jerseySvg, levelSvg } from '../icons.js';
import { ACTIONS } from '../router.js';
import { scoreOf } from '../scoring.js';
import { S } from '../state.js';
import { cmd, head, navBack, setCmd } from '../ui.js';
import { $, esc } from '../utils.js';

export function teamDefs(count){
  if(S.mode!=='liga')
    return [{title:'EQUIPO CLARO', side:'claro', emoji:'⚪'}, {title:'EQUIPO OSCURO', side:'oscuro', emoji:'⚫'}];
  return Array.from({length:count},(_,i)=>({title:'EQUIPO '+(i+1), side:'num', emoji:''}));
}

function teamPanel(title,team,side){
  return '<div class="panel"><div class="phead '+side+'">'+esc(title)+'</div><div class="list">'+
    team.slice().sort((a,b)=>scoreOf(b)-scoreOf(a)).map(p=>
      '<div class="row'+(p.isGK?' gk':'')+'" style="cursor:default"><span class="badge'+(p.isGK?' por':'')+'">'+p.label+'</span>'+
      '<span class="nm">'+esc(p.name.trim()||'—')+'</span>'+(p.isGK?'':levelSvg(p.arrow,15))+'</div>').join('')+
  '</div></div>';
}
function pitchPanel(title,team,side){
  const lines = {POR:[],DEF:[],MED:[],DEL:[]};
  team.forEach(p=> (lines[p.label]||lines.MED).push(p));
  const DOT = {DEL:'d-del', MED:'d-med', DEF:'d-def', POR:'d-por'};
  const line = arr => arr.length
    ? '<div class="pline">'+arr.map(p=>
        '<div class="pl"><i class="dot '+DOT[p.label]+'"></i>'+
        '<span class="plate'+(p.isGK?' gk':'')+'">'+esc(p.name.trim()||'—')+'</span></div>').join('')+'</div>'
    : '';
  return '<div class="panel"><div class="thead '+side+'">'+esc(title)+'</div>'+
    '<div class="pitch '+side+'">'+(side==='num' ? '' : jerseySvg(side))+line(lines.DEL)+line(lines.MED)+line(lines.DEF)+line(lines.POR)+'</div></div>';
}

const ORD = {POR:0, DEF:1, MED:2, DEL:3};
function shareText(){
  const {teams} = teamsCurrent(), defs = teamDefs(teams.length);
  const fmt = t => t.slice()
    .sort((a,b)=> (ORD[a.label]-ORD[b.label]) || a.name.localeCompare(b.name))
    .map(p => p.label + '  ' + (p.name.trim() || '—')).join('\n');
  return '⚽ ' + (S.venue || S.cancha.label) + '\n\n' +
    teams.map((t,i)=> (defs[i].emoji ? defs[i].emoji + ' ' : '') + defs[i].title + '\n' + fmt(t)).join('\n\n');
}

export function renderEquipos(st){
  const {teams,c} = teamsCurrent(), defs = teamDefs(teams.length);
  head('EQUIPOS', S.cancha.label, (S.candIdx+1)+' / '+S.cands.length);
  st.className = 'stage' + (teams.length > 2 ? ' multi' : '');
  const draw = S.view==='cancha' ? pitchPanel : teamPanel;
  const share = S.share
    ? '<div class="panel" style="grid-column:1/-1"><div class="phead">TEXTO PARA WHATSAPP</div>'+
        '<textarea id="shareTxt" readonly style="min-height:190px">'+esc(shareText())+'</textarea>'+
        '<div class="menu" style="margin-top:6px"><button class="mbtn" id="copyBtn">Copiar texto</button>'+
          (S.view==='cancha' ? '<button class="mbtn img" id="imgBtn">Enviar imagen por WhatsApp</button>' : '')+'</div>'+
        (S.copied ? '<div class="sbox" style="margin-top:6px"><h4>ESTADO</h4><p class="sm">'+esc(S.copied)+'</p></div>' : '')+
      '</div>'
    : '';
  st.innerHTML = teams.map((t,i)=> draw(defs[i].title, t, defs[i].side)).join('') +
    '<div style="grid-column:1/-1"><div class="sbox"><h4>EQUILIBRIO</h4><p class="sm">'+
      (S.mode==='liga' ? balanceLiga(c.spread) : balanceWord(c.cost))+'</p></div></div>'+
    share;
  if(S.share){
    $('copyBtn').addEventListener('click', ACTIONS.copyShare);
    if($('imgBtn')) $('imgBtn').addEventListener('click', ACTIONS.sendImage);
  }
  setCmd(navBack([
    cmd('vista',{label:S.view==='lista'?'Ver en cancha':'Ver en lista'}),
    cmd('rand',{off:S.cands.length<2}),
    cmd('share',{label:S.share?'Ocultar texto':'Compartir por WhatsApp'})
  ].concat(S.view==='cancha' ? [cmd('img')] : [])));
}
