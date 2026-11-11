/* Imagen de la vista en cancha para compartir. */

import { balanceLiga, balanceWord, teamsCurrent } from './balance.js';
import { teamDefs } from './screens/equipos.js';
import { S } from './state.js';

// ---------- imagen de la vista en cancha (para mandar por WhatsApp) ----------
function loadImage(src){
  return new Promise(resolve=>{
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderTeamsImage(){
  try{ await document.fonts.load('700 30px "Chakra Petch"'); }catch{}
  const logo = await loadImage('assets/img/logo.svg');
  const FONT = '"Chakra Petch","Arial Narrow",Arial,sans-serif';
  const {teams,c} = teamsCurrent(), defs = teamDefs(teams.length);
  const cols = teams.length <= 3 ? 1 : 2;                    // pocas letras chicas al verla en el celular
  const colW = cols === 1 ? 1000 : 700, gap = 36, pad = 44, headH = 78;
  const pitchH = teams.length === 2 ? 700 : (cols === 1 ? 640 : 600);
  const titleH = 150, footH = 70, rows = Math.ceil(teams.length/cols);
  const W = pad*2 + cols*colW + (cols-1)*gap;
  const H = titleH + rows*(headH + 8 + pitchH) + (rows-1)*gap + footH + pad/2;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const lin = (x0,y0,x1,y1,stops) => { const gr = g.createLinearGradient(x0,y0,x1,y1); stops.forEach(([o,col])=>gr.addColorStop(o,col)); return gr; };
  const rrect = (x,y,w,h,r) => { g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r);
    g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); };
  const spaced = (txt,sp) => { try{ g.letterSpacing = sp+'px'; }catch{} return txt; };

  g.fillStyle = lin(0,0,0,H,[[0,'#20365c'],[1,'#0d1c33']]); g.fillRect(0,0,W,H);

  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#fff'; g.font = '700 50px '+FONT; spaced('',3);
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
  const title = (S.venue || S.cancha.label).toUpperCase();
  const logoH = 126, logoW = Math.round(logoH*0.9);          // el logo ocupa el costado izquierdo
  let tfs = 50; while(tfs > 24 && g.measureText(title).width > W - (pad + logoW + 20)*2){ tfs -= 2; g.font = '700 '+tfs+'px '+FONT; }
  g.fillText(title, W/2, 68);
  if(logo) g.drawImage(logo, pad, 12, logoW, logoH);
  g.shadowColor = 'transparent';
  g.fillStyle = '#9fb3cf'; g.font = '600 26px '+FONT; spaced('',3);
  g.fillText(S.venue ? S.cancha.label.toUpperCase() : (S.mode==='liga' ? 'FORMATO LIGA' : 'PARTIDO'), W/2, 112);

  const ROLE = {DEL:['#ff9288','#c4241b'], MED:['#8be879','#2c9a1f'], DEF:['#8fb4ff','#2352b8'], POR:['#fff09a','#d7a60c']};

  teams.forEach((team,ti)=>{
    const col = ti % cols, row = Math.floor(ti/cols);
    const x = pad + col*(colW+gap), y = titleH + row*(headH + 8 + pitchH + gap);
    const side = defs[ti].side;

    // barra del equipo
    g.fillStyle = lin(0,y,0,y+headH,[[0,'#2b3138'],[1,'#0b0f14']]); g.fillRect(x,y,colW,headH);
    g.lineWidth = 3; g.strokeStyle = '#05101f'; g.strokeRect(x,y,colW,headH);
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.35)'; g.strokeRect(x+3,y+3,colW-6,headH-6);
    let tx = x + 28;
    if(side !== 'num'){
      const sw = g.createRadialGradient(tx+10,y+headH/2-6,2,tx+14,y+headH/2,18);
      if(side==='claro'){ sw.addColorStop(0,'#fff'); sw.addColorStop(1,'#c3cbd4'); } else { sw.addColorStop(0,'#56616d'); sw.addColorStop(1,'#090c10'); }
      g.beginPath(); g.arc(tx+16, y+headH/2, 17, 0, Math.PI*2); g.fillStyle = sw; g.fill();
      g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); tx += 52;
    }
    g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '700 32px '+FONT; spaced('',4);
    g.fillText(defs[ti].title, tx, y+headH/2+2);
    spaced('',0);

    // cancha
    const py = y + headH + 8;
    g.fillStyle = lin(0,py,0,py+pitchH,[[0,'#171c22'],[1,'#0d1116']]); g.fillRect(x,py,colW,pitchH);
    g.save(); g.beginPath(); g.rect(x,py,colW,pitchH); g.clip();
    g.beginPath(); g.moveTo(x+colW*.07,py); g.lineTo(x+colW*.93,py); g.lineTo(x+colW,py+pitchH); g.lineTo(x,py+pitchH); g.closePath();
    g.fillStyle = lin(0,py,0,py+pitchH,[[0,'#434c56'],[1,'#2a3139']]); g.fill();
    g.save(); g.clip();
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 3;
    g.beginPath(); g.arc(x+colW/2, py-pitchH*.04, colW*.11, 0, Math.PI*2); g.stroke();
    const bx = x+colW*.2, bw = colW*.6, bh = pitchH*.3;
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(bx,py+pitchH); g.lineTo(bx,py+pitchH-bh); g.lineTo(bx+bw,py+pitchH-bh); g.lineTo(bx+bw,py+pitchH); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x+colW/2-bw*.21, py+pitchH-bh*.42, bw*.42, bh*.42);
    g.restore(); g.restore();
    g.lineWidth = 3; g.strokeStyle = '#05101f'; g.strokeRect(x,py,colW,pitchH);

    // jugadores
    const lines = {POR:[],DEF:[],MED:[],DEL:[]};
    team.forEach(p=> (lines[p.label]||lines.MED).push(p));
    const groups = ['DEL','MED','DEF','POR'].filter(k=>lines[k].length);
    const top = py + 44, ih = pitchH - 44 - 36;
    groups.forEach((k,gi)=>{
      const arr = lines[k], cy = top + ih*(gi+.5)/groups.length;
      let fs = cols === 1 ? 30 : 24;
      const label = p => (p.name.trim()||'—').toUpperCase();
      const widths = fs => arr.map(p=>{ g.font = '700 '+fs+'px '+FONT; return Math.min(colW*.4, g.measureText(label(p)).width + 40); });
      let ws = widths(fs); const avail = colW*.94;
      while(fs > 14 && ws.reduce((a,b)=>a+b,0) + 16*(arr.length+1) > avail){ fs -= 2; ws = widths(fs); }
      const gapx = (avail - ws.reduce((a,b)=>a+b,0))/(arr.length+1);
      let cx = x + colW*.03 + gapx;
      arr.forEach((p,i)=>{
        const w = ws[i], h = fs + 20, mx = cx + w/2;
        // punto de posicion
        const dy = cy - h/2 - 4;
        const dr = g.createRadialGradient(mx-3,dy-3,1,mx,dy,10);
        dr.addColorStop(0,ROLE[k][0]); dr.addColorStop(1,ROLE[k][1]);
        g.beginPath(); g.arc(mx, dy-9, 10, 0, Math.PI*2); g.fillStyle = dr; g.fill();
        g.lineWidth = 2; g.strokeStyle = '#05101f'; g.stroke();
        // chapa
        const ty = cy - h/2 + 6;
        g.save(); g.shadowColor = 'rgba(0,0,0,.65)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
        rrect(cx, ty, w, h, 5);
        let fill, ink = '#121820', border = null;
        if(p.isGK){ fill = lin(0,ty,0,ty+h,[[0,'#3d86ff'],[1,'#0a44d8']]); ink = '#fff'; border = '#03246b'; }
        else if(side==='oscuro'){ fill = lin(0,ty,0,ty+h,[[0,'#3b434d'],[1,'#10151b']]); ink = '#fff'; border = 'rgba(255,255,255,.5)'; }
        else fill = lin(0,ty,0,ty+h,[[0,'#fff'],[1,'#cdd3da']]);
        g.fillStyle = fill; g.fill(); g.restore();
        if(border){ rrect(cx,ty,w,h,5); g.lineWidth = 2; g.strokeStyle = border; g.stroke(); }
        g.save(); rrect(cx,ty,w,h,5); g.clip();
        g.textAlign = 'center'; g.font = '700 '+fs+'px '+FONT; g.fillStyle = ink; spaced('',0.5);
        let txt = label(p); while(txt.length > 3 && g.measureText(txt).width > w-20) txt = txt.slice(0,-2)+'…';
        g.fillText(txt, mx, ty+h/2+1); spaced('',0);
        g.restore();
        cx += w + gapx;
      });
    });
  });

  g.textAlign = 'center'; g.fillStyle = '#9fb3cf'; g.font = '600 24px '+FONT; spaced('',3);
  g.fillText('PICADITO APP  ·  EQUILIBRIO: '+(S.mode==='liga' ? balanceLiga(c.spread) : balanceWord(c.cost)), W/2, H - footH/2 - 6);
  return new Promise(res=> cv.toBlob(res,'image/png'));
}
