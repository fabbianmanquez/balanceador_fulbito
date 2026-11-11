/* Lectura de la lista pegada: nombres, datos de cancha y nombres repetidos. */

// ---------- parser ----------
// Datos del partido (cancha, hora, fecha, precio): nunca son jugadores.
export const META_KW = /\b(cancha|campo|complejo|predio|lugar|horario|fecha)\b/i;
export const TIME_RE = /\b(?:[01]?\d|2[0-3])[:.][0-5]\d\b|\b(?:[01]?\d|2[0-3])\s*(?:hs|hrs?|h|horas?)\b/i;
export const DATE_RE = /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/;
export const isMeta = s => META_KW.test(s) || TIME_RE.test(s) || DATE_RE.test(s) || /\$\s*\d/.test(s);

// Texto de cancha/hora que viene en la lista: se recuerda para el mensaje de WhatsApp.
export function cleanInfo(x){
  const v = x.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'')
    .replace(/\$\s*\d[\d.,]*/g,'')                               // el precio no se comparte
    .replace(/\s+/g,' ').replace(/^[\s\-–—:·•|,;]+|[\s\-–—:·•|,;]+$/g,'');
  if(!/\p{L}/u.test(v) || v.length < 3 || /^(cancha|campo|complejo|predio|lugar|horario|fecha)$/i.test(v)) return '';
  return v.slice(0,60);
}

export function parseAll(text){
  let t = String(text).replace(/\r/g,'').replace(/[*_`~]/g,'');   // negritas de whatsapp
  const info = [];
  const keep = x => { const v = cleanInfo(x); if(v && !info.includes(v)) info.push(v); };

  // Linea con cancha/hora/fecha => no es jugador: se omite entera y se recuerda como dato del
  // partido. Si trae separadores (lista en horizontal), se conserva y se descartan solo los items de datos.
  t = t.split('\n').filter(l => {
    if(!isMeta(l) || /[,;•|]/.test(l)) return true;
    keep(l); return false;
  }).join('\n');

  // Toda numeracion ("1. Timo", "1 Timo", "1-Timo", "10Gallo") pasa a ser un corte de item.
  const multi = /[\n,;]/.test(t);
  const numRe = multi
    ? /(^|[\n,;•·|\/]|[ \t](?=[\(\[]?\d{1,3}[\)\].\-–:]))[ \t]*[\(\[]?\d{1,3}[\)\].\-–:]*[ \t]*(?=\p{L})/gu
    : /(^|\s)[ \t]*[\(\[]?\d{1,3}[\)\].\-–:]*[ \t]*(?=\p{L})/gu;
  t = t.replace(numRe, '\n');

  const junk = /^(lista|jugadores?|equipos?|anotados?|confirmados?|suplentes|van|faltan|cancha|f[uú]tbol|futsal|partido|hola|buenas|resumen|total|hs|hrs|s[aá]bado|domingo|lunes|martes|mi[eé]rcoles|jueves|viernes)$/i;
  const conn = /^(de|del|la|el|los|las)$/i;
  const clean = w => w.replace(/[^\p{L}\p{N}'.\-]/gu,'').replace(/^[\d.\-–']+|[\d.\-–']+$/gu,'');

  // Un item (renglon o trozo entre separadores) de 1-2 palabras es UN jugador ("amigo fabi").
  // Con 3 o mas palabras sueltas es una lista en horizontal: cada palabra es un jugador
  // ("amigo de fabi" se mantiene junto por el conector).
  const items = s => {
    const ws = s.split(/\s+/).map(clean).filter(w => /\p{L}/u.test(w) && !junk.test(w));
    while(ws.length && conn.test(ws[0])) ws.shift();
    while(ws.length && conn.test(ws[ws.length-1])) ws.pop();
    if(ws.length <= 2) return ws.length ? [ws.join(' ')] : [];
    const out = [];
    for(let i=0; i<ws.length; i++){
      if(conn.test(ws[i]) && out.length && i+1 < ws.length) out[out.length-1] += ' '+ws[i]+' '+ws[++i];
      else out.push(ws[i]);
    }
    return out;
  };

  const tokens = t.split(/[\n\t,;•·|\/]+|\s[-–—]\s/)
    .filter(seg => { if(!isMeta(seg)) return true; keep(seg); return false; })
    .flatMap(items)
    .filter(w => w.length >= 2 && w.length <= 24);

  return {names:tokens, info:info.join(' · ')};
}
export const parseList = text => parseAll(text).names;

// Nombres repetidos: invalidan la lista hasta que se cambien.
export const nameKey = s => s.trim().toLowerCase();
export function dupInfo(names){
  const first = new Set(), dup = new Set(), later = new Set();
  names.forEach((nm,i)=>{
    const k = nameKey(nm);
    if(first.has(k)){ dup.add(k); later.add(i); } else first.add(k);
  });
  return {dup, later};
}
export function suggestName(base, taken){
  for(let i=2;;i++){ const s = base+' '+i; if(!taken.has(nameKey(s))){ taken.add(nameKey(s)); return s; } }
}
