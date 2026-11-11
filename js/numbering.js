/* Índice numérico de la lista: se completa solo al escribir y se corrige al pegar. */

import { isMeta, parseList } from './parser.js';

const NUM = /^\s*[\(\[]?\d{1,3}\s*[\)\]\.\-–:]*\s*/;
const ONLY_NUM = /^\s*[\(\[]?\d{1,3}\s*[\)\]\.\-–:]*\s*$/;

export const isPlaceholder = line => ONLY_NUM.test(line);

// Deja una lista vertical numerada 1, 2, 3... sin saltos ni repetidos, sin importar los números que traiga.
// Los renglones que no son jugadores (cancha, hora, títulos) no se tocan, y una lista en horizontal tampoco.
// Con placeholder, un último renglón vacío se completa con el próximo número ("4. ").
export function renumber(text, {placeholder = false} = {}){
  const lines = String(text).replace(/\r/g,'').split('\n');
  const rows = lines.map((line, i) => {
    if(isPlaceholder(line)) return {type:'ph', last:i === lines.length - 1};
    if(!line.trim()) return {type:'blank', line};
    if(isMeta(line)) return {type:'other', line};
    const body = line.replace(NUM, '');
    const names = parseList(body);
    if(names.length > 1) return {type:'multi'};
    if(names.length === 1) return {type:'item', body: body.trim()};
    return {type:'other', line};
  });
  if(rows.some(r => r.type === 'multi')) return String(text);

  let n = 0;
  const out = [];
  rows.forEach((r, i) => {
    if(r.type === 'item') out.push((++n) + '. ' + r.body);
    else if(r.type === 'ph'){ if(r.last) out.push((++n) + '. '); }          // los vacíos del medio se descartan
    else if(r.type === 'blank' && placeholder && n > 0 && i === rows.length - 1) out.push((++n) + '. ');
    else out.push(r.line);
  });
  return out.join('\n');
}
