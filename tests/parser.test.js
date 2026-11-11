import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseAll, parseList, dupInfo, suggestName } from '../js/parser.js';

const NOMBRES = ['Timo', 'Fabi', 'Juan', 'Gallo'];

describe('parseList', () => {
  it('lee una lista vertical numerada', () => {
    assert.deepEqual(parseList('1. Timo\n2. Fabi\n3. Juan\n4. Gallo'), NOMBRES);
  });

  it('lee una lista vertical simple', () => {
    assert.deepEqual(parseList('Timo\nFabi\nJuan\nGallo'), NOMBRES);
  });

  it('lee una lista horizontal separada por espacios, comas o guiones', () => {
    assert.deepEqual(parseList('Timo Fabi Juan Gallo'), NOMBRES);
    assert.deepEqual(parseList('Timo, Fabi, Juan, Gallo'), NOMBRES);
    assert.deepEqual(parseList('Timo - Fabi - Juan - Gallo'), NOMBRES);
  });

  it('lee una lista horizontal numerada', () => {
    assert.deepEqual(parseList('1 Timo 2 Fabi 3 Juan 4 Gallo'), NOMBRES);
  });

  it('mezcla filas horizontales y verticales', () => {
    const lista = 'Timo Fabi Juan\nGallo\nPepe, Nacho\nLucho - Tomi\n8.Mati 9)Santi';
    assert.equal(parseList(lista).length, 10);
  });

  it('una linea de una o dos palabras es un solo jugador', () => {
    assert.deepEqual(parseList('Timo\namigo fabi\nJuan\nGallo'), ['Timo', 'amigo fabi', 'Juan', 'Gallo']);
  });

  it('respeta los conectores en nombres compuestos', () => {
    assert.deepEqual(parseList('Timo amigo de fabi Juan'), ['Timo', 'amigo de fabi', 'Juan']);
  });

  it('ignora emojis y numeracion pegada', () => {
    assert.deepEqual(parseList('1-Timo ⚽\n2)Fabi\n10Gallo\n⚽Pepe'), ['Timo', 'Fabi', 'Gallo', 'Pepe']);
  });

  it('no toma los datos de la cancha como jugadores', () => {
    assert.deepEqual(parseList('Cancha 5 18hs\nTimo\nFabi\nJuan\nGallo'), NOMBRES);
    assert.deepEqual(parseList('cancha tal 18\nTimo\nFabi\nJuan\nGallo'), NOMBRES);
    assert.deepEqual(parseList('Cancha 3 18:30, Timo, Fabi, Juan, Gallo'), NOMBRES);
    assert.deepEqual(parseList('Sábado 12/11\nCancha $8000\nTimo\nFabi\nJuan\nGallo'), NOMBRES);
  });
});

describe('parseAll', () => {
  it('recuerda cancha y hora, sin precio ni emojis', () => {
    const { names, info } = parseAll('⚽ Sábado 12/11\nCancha Los Pinos 18hs\nCancha $8000\nTimo\nFabi\nJuan\nGallo');
    assert.deepEqual(names, NOMBRES);
    assert.equal(info, 'Sábado 12/11 · Cancha Los Pinos 18hs');
  });

  it('sin datos del partido devuelve info vacia', () => {
    assert.equal(parseAll('Timo\nFabi\nJuan\nGallo').info, '');
  });
});

describe('nombres repetidos', () => {
  it('detecta repetidos sin distinguir mayusculas', () => {
    const { dup, later } = dupInfo(['Timo', 'Fabi', 'timo', 'TIMO']);
    assert.deepEqual([...dup], ['timo']);
    assert.deepEqual([...later], [2, 3]);
  });

  it('sugiere un nombre libre', () => {
    const taken = new Set(['juan', 'juan 2']);
    assert.equal(suggestName('Juan', taken), 'Juan 3');
  });
});
