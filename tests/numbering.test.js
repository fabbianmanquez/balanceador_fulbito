import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renumber, isPlaceholder } from '../js/numbering.js';
import { parseList } from '../js/parser.js';

describe('renumber', () => {
  it('corrige una lista con numeros salteados', () => {
    assert.equal(renumber('1 facu\n3 raul\n4 augusto'), '1. facu\n2. raul\n3. augusto');
  });

  it('corrige numeros repetidos o desordenados', () => {
    assert.equal(renumber('1 ana\n1 beto\n2 caro'), '1. ana\n2. beto\n3. caro');
    assert.equal(renumber('5. Timo\n2. Fabi\n9. Juan'), '1. Timo\n2. Fabi\n3. Juan');
  });

  it('acepta distintos estilos de numeracion', () => {
    assert.equal(renumber('1) facu\n3) raul'), '1. facu\n2. raul');
    assert.equal(renumber('1-Timo\n10Gallo'), '1. Timo\n2. Gallo');
  });

  it('agrega el indice a una lista vertical sin numeros', () => {
    assert.equal(renumber('Timo\nFabi\nJuan'), '1. Timo\n2. Fabi\n3. Juan');
  });

  it('no toca los datos de la cancha ni los titulos', () => {
    assert.equal(renumber('Cancha 5 18hs\n1. Timo\n3. Fabi'), 'Cancha 5 18hs\n1. Timo\n2. Fabi');
    assert.equal(renumber('Lista de jugadores\n1 Timo\n2 Fabi'), 'Lista de jugadores\n1. Timo\n2. Fabi');
    assert.equal(renumber('Sábado 12/11\nTimo\nFabi'), 'Sábado 12/11\n1. Timo\n2. Fabi');
  });

  it('no modifica una lista en horizontal', () => {
    assert.equal(renumber('Timo, Fabi, Juan, Gallo'), 'Timo, Fabi, Juan, Gallo');
    assert.equal(renumber('1 Timo 2 Fabi 3 Juan 4 Gallo'), '1 Timo 2 Fabi 3 Juan 4 Gallo');
    assert.equal(renumber('Timo Fabi Juan'), 'Timo Fabi Juan');
  });

  it('cuenta como un solo jugador un nombre de dos palabras', () => {
    assert.equal(renumber('1 amigo fabi\n3 Juan'), '1. amigo fabi\n2. Juan');
  });

  it('es idempotente', () => {
    const una = renumber('1 facu\n3 raul\n4 augusto');
    assert.equal(renumber(una), una);
  });

  it('no cambia los nombres que se leen de la lista', () => {
    const texto = '1 facu\n3 raul\n4 augusto\nCancha 3 19hs';
    assert.deepEqual(parseList(renumber(texto)), parseList(texto));
  });

  it('completa el proximo indice con un renglon vacio al final', () => {
    assert.equal(renumber('1. Timo\n', {placeholder: true}), '1. Timo\n2. ');
    assert.equal(renumber('Timo\nFabi\n', {placeholder: true}), '1. Timo\n2. Fabi\n3. ');
    assert.equal(renumber('\n', {placeholder: true}), '\n');
  });

  it('conserva el ultimo numero vacio y descarta los del medio', () => {
    assert.equal(renumber('1. Timo\n2. '), '1. Timo\n2. ');
    assert.equal(renumber('1. Timo\n2. \n3. Fabi'), '1. Timo\n2. Fabi');
  });

  it('reconoce un renglon que solo trae el numero', () => {
    assert.equal(isPlaceholder('3. '), true);
    assert.equal(isPlaceholder('3'), true);
    assert.equal(isPlaceholder('3. Timo'), false);
    assert.equal(isPlaceholder(''), false);
  });
});
