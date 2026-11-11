/* Puntaje de cada jugador. */

import { S } from './state.js';

export const scoreOf = p => p.isGK ? 3 : p.arrow >= 6 ? (p.rv || 2) : p.arrow;
export const gkTotal = () => S.players.filter(p=>p.isGK).length;
