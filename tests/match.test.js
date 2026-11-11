import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchFor, canchaFor, plusOne, perTeamText, listStatus } from '../js/match.js';
import { S } from '../js/state.js';

const nombres = n => Array.from({length: n}, (_, i) => 'Jugador' + String.fromCharCode(97 + (i % 26)) + i);

describe('modalidad segun cantidad de jugadores', () => {
  it('reconoce F5, F6, F7, F8, F9 y F11', () => {
    S.mode = 'partido';
    [10, 12, 14, 16, 18, 22].forEach(n => assert.equal(matchFor(n).kind, 'exact', 'n=' + n));
  });

  it('acepta un jugador de mas y lo marca como +1', () => {
    S.mode = 'partido';
    const m = matchFor(11);
    assert.equal(m.kind, 'plus');
    assert.equal(m.c.id, 5);
    assert.equal(m.label, 'Fútbol 5 +1');
    assert.equal(plusOne(13).id, 6);
  });

  it('rechaza cantidades que no son una modalidad', () => {
    S.mode = 'partido';
    [4, 8, 9, 20, 21, 25].forEach(n => assert.equal(matchFor(n).ok, false, 'n=' + n));
    assert.equal(canchaFor(11), null);
  });

  it('en liga exige exactamente equipos x jugadores por equipo', () => {
    S.mode = 'liga'; S.liga = {teams: 3, per: 4};
    assert.equal(matchFor(12).ok, true);
    assert.equal(matchFor(11).ok, false);
    assert.equal(matchFor(13).ok, false);
    S.mode = 'partido';
  });

  it('muestra como se reparten los jugadores por equipo', () => {
    S.mode = 'partido';
    assert.equal(perTeamText(10), '5');
    assert.equal(perTeamText(11), '6 / 5');
  });
});

describe('estado de la lista en vivo', () => {
  it('avisa cuando la cantidad es valida o falta alguien', () => {
    S.mode = 'partido';
    assert.equal(listStatus(nombres(10)).kind, 'ok');
    assert.match(listStatus(nombres(9)).html, /falta/);
    assert.equal(listStatus(nombres(9)).kind, 'warn');
  });

  it('indica el +1', () => {
    S.mode = 'partido';
    assert.match(listStatus(nombres(11)).html, /Fútbol 5 \+1/);
  });

  it('marca como invalidante un nombre repetido', () => {
    S.mode = 'partido';
    const st = listStatus(['Timo', 'Fabi', 'timo', 'Juan', 'Gallo']);
    assert.equal(st.kind, 'bad');
  });

  it('sin jugadores no muestra nada', () => {
    assert.equal(listStatus([]), null);
  });
});
