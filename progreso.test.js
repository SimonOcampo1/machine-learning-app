const { test } = require("node:test");
const assert = require("node:assert");
const P = require("./progreso.js");

test("fusionar toma el máximo puntaje por ejercicio", () => {
  const a = { v: 1, temas: { rl: { leido: true, quiz: false, ejercicios: { e1: 100, e2: 40 } } } };
  const b = { v: 1, temas: { rl: { leido: false, quiz: true, ejercicios: { e2: 80, e3: 60 } } } };
  const r = P.fusionar(a, b);
  assert.deepStrictEqual(r.temas.rl.ejercicios, { e1: 100, e2: 80, e3: 60 });
  assert.strictEqual(r.temas.rl.leido, true);
  assert.strictEqual(r.temas.rl.quiz, true);
});

test("fusionar es conmutativa en los puntajes", () => {
  const a = { v: 1, temas: { rl: { leido: false, quiz: false, ejercicios: { e1: 30 } } } };
  const b = { v: 1, temas: { rl: { leido: false, quiz: false, ejercicios: { e1: 90 } } } };
  assert.deepStrictEqual(P.fusionar(a, b).temas.rl, P.fusionar(b, a).temas.rl);
});

test("fusionar tolera lados vacíos, nulos y sin temas", () => {
  const a = { v: 1, temas: { rl: { leido: true, quiz: true, ejercicios: { e1: 50 } } } };
  assert.deepStrictEqual(P.fusionar(a, null).temas.rl, a.temas.rl);
  assert.deepStrictEqual(P.fusionar(null, a).temas.rl, a.temas.rl);
  assert.deepStrictEqual(P.fusionar(null, null).temas, {});
  assert.deepStrictEqual(P.fusionar({}, {}).temas, {});
});

test("fusionar es idempotente", () => {
  const a = { v: 1, temas: { rl: { leido: true, quiz: true, ejercicios: { e1: 70 } } } };
  assert.deepStrictEqual(P.fusionar(a, a).temas, a.temas);
});

test("fusionar une temas que solo existen de un lado", () => {
  const a = { v: 1, temas: { rl: { leido: true, quiz: false, ejercicios: {} } } };
  const b = { v: 1, temas: { knn: { leido: false, quiz: true, ejercicios: { k1: 20 } } } };
  const r = P.fusionar(a, b);
  assert.deepStrictEqual(Object.keys(r.temas).sort(), ["knn", "rl"]);
});

test("estadoTema devuelve sin-empezar, en-progreso o completa", () => {
  const vacio = P.vacio();
  assert.strictEqual(P.estadoTema(vacio, "rl", 3), "sin-empezar");

  const parcial = { v: 1, temas: { rl: { leido: true, quiz: false, ejercicios: { e1: 100 } } } };
  assert.strictEqual(P.estadoTema(parcial, "rl", 3), "en-progreso");

  const full = { v: 1, temas: { rl: { leido: true, quiz: true, ejercicios: { e1: 100, e2: 60, e3: 80 } } } };
  assert.strictEqual(P.estadoTema(full, "rl", 3), "completa");
});

test("estadoTema no marca completa si falta el quiz", () => {
  const sinQuiz = { v: 1, temas: { rl: { leido: true, quiz: false, ejercicios: { e1: 100, e2: 60 } } } };
  assert.strictEqual(P.estadoTema(sinQuiz, "rl", 2), "en-progreso");
});

test("estadoTema ignora ejercicios con puntaje cero", () => {
  const cero = { v: 1, temas: { rl: { leido: true, quiz: true, ejercicios: { e1: 100, e2: 0 } } } };
  assert.strictEqual(P.estadoTema(cero, "rl", 2), "en-progreso");
});

test("porcentaje cuenta temas completos sobre el total del temario", () => {
  const temario = { fases: [{ n: 0, temas: [{ slug: "a" }, { slug: "b" }, { slug: "c" }, { slug: "d" }] }] };
  const totales = { a: 1, b: 1, c: 1, d: 1 };
  const est = {
    v: 1, temas: {
      a: { leido: true, quiz: true, ejercicios: { x: 100 } },
      b: { leido: true, quiz: false, ejercicios: { x: 100 } }
    }
  };
  assert.strictEqual(P.porcentaje(est, temario, totales), 25);
});

test("porcentaje devuelve 0 si el temario no tiene temas", () => {
  const temarioVacio = { fases: [] };
  assert.strictEqual(P.porcentaje(P.vacio(), temarioVacio, {}), 0);
});

test("estadoTema marca completa un tema sin ejercicios corregibles si leido y quiz están en true", () => {
  const sinEjercicios = { v: 1, temas: { teoria: { leido: true, quiz: true, ejercicios: {} } } };
  assert.strictEqual(P.estadoTema(sinEjercicios, "teoria", 0), "completa");
});

test("estadoTema con totalEjercicios undefined (tema todavía no escrito) da sin-empezar aunque leido y quiz estén en true", () => {
  const leidoYQuiz = { v: 1, temas: { fantasma: { leido: true, quiz: true, ejercicios: {} } } };
  assert.strictEqual(P.estadoTema(leidoYQuiz, "fantasma", undefined), "sin-empezar");
});

test("porcentaje no cuenta como completo un slug ausente de totalesPorSlug aunque tenga leido y quiz", () => {
  const temario = { fases: [{ n: 0, temas: [{ slug: "a" }, { slug: "fantasma" }] }] };
  const totales = { a: 1 };
  const est = {
    v: 1, temas: {
      a: { leido: true, quiz: true, ejercicios: { x: 100 } },
      fantasma: { leido: true, quiz: true, ejercicios: {} }
    }
  };
  assert.strictEqual(P.porcentaje(est, temario, totales), 50);
});

test("_estadoValido rechaza temas como array y acepta objetos planos", () => {
  assert.strictEqual(P._estadoValido({ v: 1, temas: {} }), true);
  assert.strictEqual(P._estadoValido(null), false);
  assert.strictEqual(P._estadoValido("texto"), false);
  assert.strictEqual(P._estadoValido({}), false);
  assert.strictEqual(P._estadoValido({ temas: [] }), false);
});
