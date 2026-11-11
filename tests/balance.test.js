import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCandidates, applyLabels, teamsCurrent, costOf } from '../js/balance.js';
import { scoreOf } from '../js/scoring.js';
import { CANCHAS } from '../js/config.js';
import { S } from '../js/state.js';
import { makePlayers, setup, rnd } from './helpers.js';

function revisar(tag, esperados){
  const { teams } = teamsCurrent();
  const ids = teams.flat().map(p => p.name);
  assert.equal(ids.length, S.players.length, tag + ': cantidad total');
  assert.equal(new Set(ids).size, ids.length, tag + ': jugador repetido');
  assert.deepEqual(teams.map(t => t.length).sort((a, b) => a - b), esperados.slice().sort((a, b) => a - b), tag + ': tamaños');
  teams.forEach(t => t.forEach(p => {
    assert.ok(['POR', 'DEF', 'MED', 'DEL'].includes(p.label), tag + ': etiqueta');
    assert.equal(p.isGK, p.label === 'POR', tag + ': POR consistente');
  }));
  return teams;
}

describe('puntajes', () => {
  it('Lesionado sortea entre Hace lo que puede, Irregular y Regular (1 a 3)', () => {
    const visto = new Set();
    for(let i = 0; i < 300; i++){
      setup({ players: [{ name: 'A', arrow: 6, isGK: false, set: true, label: 'DEF' }, ...makePlayers(9)] });
      buildCandidates();
      visto.add(scoreOf(S.players[0]));
    }
    assert.deepEqual([...visto].sort(), [1, 2, 3]);
  });

  it('Random sortea de Hace lo que puede a Picante (1 a 4)', () => {
    const visto = new Set();
    for(let i = 0; i < 400; i++){
      setup({ players: [{ name: 'A', arrow: 7, isGK: false, set: true, label: 'DEF' }, ...makePlayers(9)] });
      buildCandidates();
      visto.add(scoreOf(S.players[0]));
    }
    assert.deepEqual([...visto].sort(), [1, 2, 3, 4]);
  });

  it('el arquero siempre vale 3', () => {
    assert.equal(scoreOf({ isGK: true, arrow: 5 }), 3);
  });
});

describe('partido normal', () => {
  it('arma equipos parejos en todas las modalidades, con y sin arqueros', () => {
    for(const base of CANCHAS){
      for(const gk of [0, 1, 2]){
        setup({ players: makePlayers(base.n, gk, true) });
        buildCandidates();
        assert.ok(S.cands.length > 0, 'sin candidatos n=' + base.n);
        for(let ci = 0; ci < S.cands.length; ci++){
          S.candIdx = ci; applyLabels();
          const teams = revisar(`n=${base.n} gk=${gk} #${ci}`, [base.n / 2, base.n / 2]);
          if(gk === 2) assert.deepEqual(teams.map(t => t.filter(p => p.isGK).length), [1, 1], 'arqueros juntos');
        }
      }
    }
  });

  it('con un jugador de mas (F+1) reparte N/2 redondeado hacia arriba y hacia abajo', () => {
    for(const base of CANCHAS){
      const n = base.n + 1;
      for(const gk of [0, 1, 2]){
        setup({ players: makePlayers(n, gk, true) });
        buildCandidates();
        for(let ci = 0; ci < S.cands.length; ci++){
          S.candIdx = ci; applyLabels();
          revisar(`F+1 n=${n} gk=${gk} #${ci}`, [(n - 1) / 2, (n + 1) / 2]);
        }
      }
    }
  });

  it('el equipo con el jugador extra no cae siempre del mismo lado', () => {
    let claroMasGrande = 0;
    const corridas = 200;
    for(let i = 0; i < corridas; i++){
      setup({ players: makePlayers(11, rnd(3)) });
      buildCandidates();
      const { teams } = teamsCurrent();
      if(teams[0].length > teams[1].length) claroMasGrande++;
    }
    assert.ok(claroMasGrande > corridas * 0.25 && claroMasGrande < corridas * 0.75, 'sesgo: ' + claroMasGrande + '/' + corridas);
  });

  it('el mejor reparto coincide con el optimo exacto (incluyendo F5+1)', () => {
    const brute = players => {
      const n = players.length, idx = [...Array(n).keys()], gk = idx.filter(i => players[i].isGK);
      const tamanos = n % 2 ? [(n - 1) / 2, (n + 1) / 2] : [n / 2];
      const forzadoA = gk.length ? gk[0] : idx.find(i => !players[i].isGK);
      let mejor = Infinity;
      for(let mask = 0; mask < (1 << n); mask++){
        let k = 0; for(let i = 0; i < n; i++) if(mask >> i & 1) k++;
        if(!tamanos.includes(k) || !(mask >> forzadoA & 1)) continue;
        if(gk.length >= 2 && (mask >> gk[1] & 1)) continue;
        const A = [], B = [];
        for(let i = 0; i < n; i++) ((mask >> i & 1) ? A : B).push(players[i]);
        mejor = Math.min(mejor, costOf(A, B).cost);
      }
      return mejor;
    };
    for(let rep = 0; rep < 40; rep++){
      const n = [10, 11, 12, 13][rep % 4];
      setup({ players: makePlayers(n, rnd(3), rep % 3 === 0) });
      buildCandidates();
      assert.ok(S.cands[0].cost <= brute(S.players) + 1e-9, 'no es optimo n=' + n);
    }
  });

  it('con un jugador de mas, los promedios de los equipos quedan cerca', () => {
    for(let i = 0; i < 100; i++){
      setup({ players: makePlayers(11, rnd(3)) });
      buildCandidates();
      const { teams } = teamsCurrent();
      const prom = t => t.reduce((x, p) => x + scoreOf(p), 0) / t.length;
      assert.ok(Math.abs(prom(teams[0]) - prom(teams[1])) <= 0.8);
    }
  });
});

describe('formato liga', () => {
  it('reparte equipos de igual tamaño en todos los formatos', () => {
    for(let teams = 3; teams <= 8; teams++){
      for(const per of [4, 5, 7, 11]){
        for(const gk of [0, 1, 2]){
          setup({ mode: 'liga', liga: { teams, per }, players: makePlayers(teams * per, gk, per % 2 === 0) });
          buildCandidates();
          assert.ok(S.cands.length > 0, `sin candidatos ${teams}x${per}`);
          for(let ci = 0; ci < Math.min(S.cands.length, 4); ci++){
            S.candIdx = ci; applyLabels();
            const eq = revisar(`liga ${teams}x${per} gk=${gk} #${ci}`, Array(teams).fill(per));
            if(gk <= teams) assert.ok(eq.every(t => t.filter(p => p.isGK).length <= 1), 'dos arqueros en un equipo');
          }
        }
      }
    }
    S.mode = 'partido';
  });

  it('deja las sumas de puntos casi iguales', () => {
    let excesos = 0;
    const corridas = 80;
    for(let i = 0; i < corridas; i++){
      const teams = 3 + rnd(4), per = 4 + rnd(5);
      setup({ mode: 'liga', liga: { teams, per }, players: makePlayers(teams * per) });
      buildCandidates();
      const total = S.players.reduce((x, p) => x + scoreOf(p), 0);
      const minimo = total % teams ? 1 : 0;
      if(S.cands[0].spread > minimo + 1) excesos++;
    }
    S.mode = 'partido';
    assert.ok(excesos <= 3, 'ligas fuera del minimo +1: ' + excesos);
  });
});
