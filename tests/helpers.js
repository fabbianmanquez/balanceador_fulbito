import { S } from '../js/state.js';

export const rnd = n => Math.floor(Math.random() * n);

// Jugadores de prueba: los primeros `gk` son arqueros; con `special`, algunos son Lesionado o Random.
export function makePlayers(n, gk = 0, special = false){
  return Array.from({length: n}, (_, i) => {
    let arrow = 1 + rnd(5);
    if(special && Math.random() < 0.25) arrow = 6 + rnd(2);
    return {name: 'P' + i, arrow, isGK: i < gk, set: true, label: 'DEF'};
  });
}

export function setup({mode = 'partido', players, liga} = {}){
  S.mode = mode;
  S.players = players;
  S.cands = [];
  S.candIdx = 0;
  if(liga) S.liga = liga;
}
