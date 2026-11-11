/* Acciones de la barra de comandos. */

import { applyLabels, buildCandidates } from './balance.js';
import { commitName, focusName } from './screens/carga.js';
import { readList } from './screens/importar.js';
import { renderTeamsImage } from './image.js';
import { matchFor } from './match.js';
import { dupInfo } from './parser.js';
import { ACTIONS, BACK, render } from './router.js';
import { S } from './state.js';
import { askModal, toast } from './ui.js';
import { $ } from './utils.js';

// ---------- acciones ----------
Object.assign(ACTIONS, {
  home(){ S.step='inicio'; S.alert=''; S.raw=''; S.draft=[]; S.players=[]; S.venue=''; render(); },
  formatoOk(){ S.step='importar'; render(); },
  readList(){ readList(); },
  back(){
    S.alert='';
    if(S.step==='slides'){
      if(S.slideIdx>0){ S.slideIdx--; render(); }
      else { S.step='revisar'; render(); }
      return;
    }
    if(S.step==='carga'){
      const full = S.players.every(x=>x.name.trim());
      if(S.editing && full){ commitName(); S.editing=false; render(); return; }
      S.step='slides'; S.slideIdx=S.players.length-1;
      S.editing=false; render(); return;
    }
    S.step = (S.step==='importar' && S.mode==='liga') ? 'formato' : (BACK[S.step] || 'inicio');
    if(S.step==='carga') S.editing=false;
    render();
  },
  startSlides(){
    if(dupInfo(S.draft).dup.size) return;
    const n = S.draft.length, m = matchFor(n);
    if(!m.ok) return;
    const go = () => {
      S.cancha = {label:m.label, n};
      S.players = S.draft.map(nm=>({name:nm, arrow:3, isGK:false, set:false, label:'DEF'}));
      S.slideIdx = 0; S.step='slides'; render();
    };
    if(m.kind==='plus')
      askModal({text:'Son '+n+' en vez de '+m.c.n+' para un F'+m.c.id+', ¿van a jugar '+n+'?', yes:'Sí, jugamos '+n, no:'No, revisar'}, go);
    else go();
  },
  finishSlides(){ S.step='carga'; S.editing=false; S.sel=0; render(); },
  editOff(){ commitName(); S.editing=false; render(); },
  clearAll(){ if(confirm('¿Vaciar todos los nombres?')){
    S.players.forEach(p=>{ p.name=''; p.isGK=false; p.arrow=3; }); S.sel=0; render(); focusName(); } },
  armar(){ commitName(); buildCandidates(); S.share=false; S.copied=''; S.step='equipos'; render(); },
  toggleShare(){ S.share = !S.share; S.copied=''; render(); },
  copyShare(){
    const ta = $('shareTxt');
    if(!ta) return;
    ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length);
    const done = ok => { S.copied = ok ? 'Copiado' : 'Texto seleccionado: copiá a mano'; render(); };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(ta.value).then(()=>done(true)).catch(()=>{
        let ok=false; try{ ok = document.execCommand('copy'); }catch{}
        done(ok);
      });
    } else {
      let ok=false; try{ ok = document.execCommand('copy'); }catch{}
      done(ok);
    }
  },
  async sendImage(){
    if(S.busy) return;
    S.busy = true;
    try{
      const blob = await renderTeamsImage();
      if(!blob){ toast('No pude armar la imagen.'); return; }
      const file = new File([blob], 'equipos.png', {type:'image/png'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        try{ await navigator.share({files:[file]}); return; }
        catch(e){ if(e && e.name === 'AbortError') return; }
      }
      try{
        await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
        toast('Imagen copiada: pegala en WhatsApp con Ctrl+V (Cmd+V en Mac).');
        return;
      }catch{}
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'equipos.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
      toast('Imagen descargada: adjuntala en WhatsApp.');
    } finally { S.busy = false; }
  },
  toggleView(){ S.view = S.view==='lista'?'cancha':'lista'; render(); },
  reroll(){
    if(S.cands.length<2) return;
    if(S.players.some(p=>!p.isGK && p.arrow>=6)){       // con Lesionado o Random se vuelve a sortear el valor
      buildCandidates();
      S.candIdx = Math.floor(Math.random()*Math.min(6, S.cands.length));
    } else {
      let i; do { i = Math.floor(Math.random()*S.cands.length); } while(i===S.candIdx);
      S.candIdx = i;
    }
    S.copied=''; applyLabels(); render();
  }
});
