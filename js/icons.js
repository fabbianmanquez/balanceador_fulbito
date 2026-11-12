/* Iconos SVG y marcadores de nivel. */

import { ARROW_COL, ARROW_ROT } from './config.js';

const LESIONADO_SRC = 'assets/img/lesionado.png';
export function levelSvg(v,size){
  size = size || 16;
  if(v===6) return '<img class="arw lic" src="'+LESIONADO_SRC+'" width="'+size+'" height="'+size+'" alt="Lesionado">';
  if(v===7) return '<svg class="arw" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true">'+
    '<g transform="translate(12.4 0) scale(1.32 1) translate(-12.4 0)"><path d="M7.6 8.6 C7.6 5.3 9.9 3 12.4 3 C15.3 3 17.2 5 17.2 7.7 C17.2 9.9 16 10.9 14.8 11.8 C13.9 12.5 13.5 13 13.5 14 '+
    'L13.5 14.9 L9.9 14.9 L9.9 13.9 C9.9 12 10.6 10.9 11.9 9.9 C12.8 9.2 13.2 8.8 13.2 8.1 C13.2 7.5 12.8 7.1 12.2 7.1 '+
    'C11.5 7.1 11.2 7.6 11.2 8.6 Z M9.9 17 H13.6 V20.6 H9.9 Z" fill="'+ARROW_COL[7]+'" stroke="#05101f" '+
    'stroke-width="1.1" stroke-linejoin="round"/></g></svg>';
  return arrowSvg(v,size);
}
function arrowSvg(v,size){
  size = size || 16;
  return '<svg class="arw" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true" '+
    'style="transform:rotate('+ARROW_ROT[v]+'deg)"><path d="M12 2 L20 12 L15.2 12 L15.2 22 L8.8 22 L8.8 12 L4 12 Z" '+
    'fill="'+ARROW_COL[v]+'" stroke="#05101f" stroke-width="1.4" stroke-linejoin="round"/></svg>';
}

/* ---- iconos: un solo trazo geometrico para toda la app ---- */
const IC = {
  back:   '<path d="M15 5 L8 12 L15 19"/>',
  home:   '<path d="M3.5 11.5 L12 4.5 L20.5 11.5"/><path d="M6 10.5 V19.5 H18 V10.5"/>',
  check:  '<path d="M4.5 12.5 L9.5 17.5 L19.5 6.5"/>',
  levels: '<path d="M3.5 20h17"/><path d="M6.5 20V12"/><path d="M12 20V5"/><path d="M17.5 20v-5.5"/>',
  ball:   '<circle cx="12" cy="12" r="8.2"/><path d="M12 6.6 L16.1 9.6 L14.5 14.4 H9.5 L7.9 9.6 Z"/>',
  trash:  '<path d="M4.5 7h15"/><path d="M9.5 7V4.5h5V7"/><path d="M6.8 7l1 12.5h8.4l1-12.5"/>',
  pencil: '<path d="M4 20l1-4.4L15.8 4.8l3.4 3.4L8.4 19 4 20z"/><path d="M14 6.6l3.4 3.4"/>',
  swap:   '<path d="M4 9h13"/><path d="M13.5 5.5 17 9l-3.5 3.5"/><path d="M20 15H7"/><path d="M10.5 11.5 7 15l3.5 3.5"/>',
  shuffle:'<path d="M19.2 12a7.2 7.2 0 1 1-2.3-5.3"/><path d="M19.6 4.2v4.4h-4.4"/>',
  chat:   '<path d="M4 6h16v10.5h-9.5L6 20v-3.5H4z"/><path d="M8 10h8"/><path d="M8 13h5"/>',
  copy:   '<rect x="4" y="4" width="11" height="13" rx="1.5"/><path d="M8 20h11V8"/>',
  image:  '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4.5 3.5 3L15.5 13 20 17"/>',
  chevL:  '<path d="M14.5 5 L8 12 L14.5 19"/>',
  chevR:  '<path d="M9.5 5 L16 12 L9.5 19"/>',
  sndOn:  '<path d="M4 9.5h4L13 5v14L8 14.5H4z"/><path d="M16 9.2a4.4 4.4 0 0 1 0 5.6"/><path d="M18.6 6.6a8 8 0 0 1 0 10.8"/>',
  sndOff: '<path d="M4 9.5h4L13 5v14L8 14.5H4z"/><path d="M16.4 9.6l5.2 4.8"/><path d="M21.6 9.6l-5.2 4.8"/>'
};
export const ic = (n, size) =>
  '<svg viewBox="0 0 24 24" width="'+(size||15)+'" height="'+(size||15)+'" fill="none" '+
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '+
  'aria-hidden="true">'+IC[n]+'</svg>';

// Remera minimalista para identificar al equipo (claro / oscuro) en la cancha
export const JERSEY_PATH = 'M8 3 3 6.5 5 10 7 9v12h10V9l2 1 2-3.5L16 3c-.5 1.5-2.2 2.3-4 2.3S8.5 4.5 8 3Z';
export const jerseySvg = side =>
  '<svg class="jersey '+side+'" viewBox="0 0 24 24" aria-hidden="true"><path d="'+JERSEY_PATH+'" stroke-linejoin="round"/></svg>';
