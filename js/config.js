/* Constantes y parámetros del algoritmo. */

/* ============================================================
   ARMADOR DE EQUIPOS
   Escala interna (nunca visible en pantalla):
     abajo=1 | diagonal abajo=2 | recta=3 | diagonal arriba=4 | arriba=5
     arquero fijo (POR) = 3 y su flecha no se aplica
   ============================================================ */
export const GK_HANDICAP = 1;
export const LIGA_MIN_TEAMS = 3;
export const LIGA_MAX_TEAMS = 8;
export const LIGA_MIN_PER = 4;
export const LIGA_MAX_PER = 11;
export const MAX_GK      = 2;
export const TOL         = 2;
export const W_SUMA      = 3;
export const W_DIST      = 1;
export const MAX_COMBOS  = 250000;

export const CANCHAS = [
  {id:5,label:'Fútbol 5',n:10},{id:6,label:'Fútbol 6',n:12},{id:7,label:'Fútbol 7',n:14},
  {id:8,label:'Fútbol 8',n:16},{id:9,label:'Fútbol 9',n:18},{id:11,label:'Fútbol 11',n:22},
];
export const ARROW_COL = {1:'var(--a1)',2:'var(--a2)',3:'var(--a3)',4:'var(--a4)',5:'var(--a5)',7:'#a875f0'};
export const ARROW_ROT = {1:180,2:135,3:90,4:45,5:0};
export const ARROW_TXT = {1:'Hace lo que puede',2:'Irregular',3:'Regular',4:'Picante',5:'Sobrado',6:'Lesionado',7:'Random'};
export const LEVELS = [1,2,3,4,5,6,7];   // 6 = Lesionado (al azar entre Regular, Irregular y Hace lo que puede), 7 = Random (al azar entre Picante y Hace lo que puede)
