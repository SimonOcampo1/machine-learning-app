const { test } = require("node:test");
const assert = require("node:assert");
const E = require("./ejercicios.js");

const mcq = { tipo: "mcq", id: "m1", q: "¿?", opts: ["a", "b", "c", "d"], c: 2, expl: "porque sí" };

test("mcq correcto da 100", () => {
  const r = E.corregir(mcq, 2);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.puntaje, 100);
});

test("mcq incorrecto da 0 y explica", () => {
  const r = E.corregir(mcq, 0);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.puntaje, 0);
  assert.match(r.msg, /porque sí/);
});

const num = {
  tipo: "num", id: "n1", q: "¿?", resp: 2.35, tol: 0.01, expl: "se calcula así",
  trampas: [{ val: 3.35, msg: "Sumaste el intercepto de más." }]
};

test("numérico dentro de tolerancia da 100", () => {
  assert.strictEqual(E.corregir(num, 2.35).puntaje, 100);
  assert.strictEqual(E.corregir(num, 2.3549).puntaje, 100);
});

test("numérico fuera de tolerancia da 0", () => {
  assert.strictEqual(E.corregir(num, 2.5).puntaje, 0);
});

test("numérico diagnostica la trampa conocida", () => {
  const r = E.corregir(num, 3.35);
  assert.strictEqual(r.ok, false);
  assert.match(r.msg, /intercepto de más/);
});

test("numérico rechaza entrada no numérica sin romperse", () => {
  const r = E.corregir(num, NaN);
  assert.strictEqual(r.ok, false);
  assert.match(r.msg, /número/i);
});

test("la tolerancia es relativa para valores grandes", () => {
  const grande = { tipo: "num", id: "n2", q: "¿?", resp: 100000, tol: 0.01, expl: "" };
  assert.strictEqual(E.corregir(grande, 100500).puntaje, 100); // 0.5% < 1%
  assert.strictEqual(E.corregir(grande, 105000).puntaje, 0);   // 5%   > 1%
});

test("la tolerancia funciona cuando la respuesta es cero", () => {
  const cero = { tipo: "num", id: "n3", q: "¿?", resp: 0, tol: 0.01, expl: "" };
  assert.strictEqual(E.corregir(cero, 0).puntaje, 100);
  assert.strictEqual(E.corregir(cero, 0.005).puntaje, 100);
  assert.strictEqual(E.corregir(cero, 1).puntaje, 0);
});
