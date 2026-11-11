/* Navegación entre pantallas. */

import { S } from './state.js';
import { $ } from './utils.js';

export const BACK = {importar:'inicio', formato:'inicio', revisar:'importar', equipos:'carga'};

// Registros que completan main.js (evitan dependencias circulares entre pantallas y acciones).
export const SCREENS = {};
export const ACTIONS = {};

export function render(){
  SCREENS[S.step]($('stage'));
}
