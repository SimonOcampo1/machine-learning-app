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

const parsons = {
  tipo: "parsons", id: "p1", q: "Armá el bucle",
  lineas: ["for i in range(n):", "    grad = derivada(w)", "    w -= lr * grad"],
  distractores: ["    w += lr * grad"],
  expl: "El gradiente apunta hacia arriba, por eso se resta."
};

test("parsons correcto da 100", () => {
  assert.strictEqual(E.corregir(parsons, parsons.lineas.slice()).puntaje, 100);
});

test("parsons con orden equivocado da parcial y no 100", () => {
  const r = E.corregir(parsons, ["    grad = derivada(w)", "for i in range(n):", "    w -= lr * grad"]);
  assert.strictEqual(r.ok, false);
  assert.ok(r.puntaje > 0 && r.puntaje < 100, `puntaje fuera de rango: ${r.puntaje}`);
});

test("parsons distingue la indentación", () => {
  const r = E.corregir(parsons, ["for i in range(n):", "grad = derivada(w)", "    w -= lr * grad"]);
  assert.strictEqual(r.ok, false);
  assert.match(r.msg, /indent/i);
});

test("parsons con un distractor usado no da 100", () => {
  const r = E.corregir(parsons, ["for i in range(n):", "    grad = derivada(w)", "    w += lr * grad"]);
  assert.strictEqual(r.ok, false);
});

test("parsons con cantidad de líneas equivocada no rompe", () => {
  const r = E.corregir(parsons, ["for i in range(n):"]);
  assert.strictEqual(r.ok, false);
  assert.ok(Number.isFinite(r.puntaje));
});

test("mezclar no deja líneas de largo parecido en orden alfabético sin mezclar", () => {
  const lineas = ["    aaa()", "    bbb()", "    ccc()"];
  const r = E.mezclar([...lineas], "p1", lineas);
  assert.notDeepStrictEqual(r, lineas);
});

test("mezclar es determinística: mismo id y mismo pool dan mismo resultado", () => {
  const r1 = E.mezclar([...parsons.lineas, ...parsons.distractores], parsons.id, parsons.lineas);
  const r2 = E.mezclar([...parsons.lineas, ...parsons.distractores], parsons.id, parsons.lineas);
  assert.deepStrictEqual(r1, r2);
});

test("mezclar da resultados distintos para ids distintos", () => {
  const pool = ["a1()", "b2()", "c3()", "d4()", "e5()"];
  const r1 = E.mezclar([...pool], "p1", pool);
  const r2 = E.mezclar([...pool], "p2", pool);
  assert.notDeepStrictEqual(r1, r2);
});

test("mezclar no pierde ni inventa elementos", () => {
  const pool = [...parsons.lineas, ...parsons.distractores];
  const r = E.mezclar([...pool], parsons.id, parsons.lineas);
  assert.deepStrictEqual([...r].sort(), [...pool].sort());
});

test("mezclar con un solo elemento no rompe", () => {
  const r = E.mezclar(["única()"], "p1", ["única()"]);
  assert.deepStrictEqual(r, ["única()"]);
});
