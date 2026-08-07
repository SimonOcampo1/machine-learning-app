const { test } = require("node:test");
const assert = require("node:assert");
const { verificar } = require("./verificar.js");

test("el temario tiene 6 fases y 24 temas con slugs únicos", () => {
  const t = require("./data/temario.json");
  assert.strictEqual(t.fases.length, 6);
  const temas = t.fases.flatMap(f => f.temas);
  assert.strictEqual(temas.length, 24);
  assert.strictEqual(new Set(temas.map(x => x.slug)).size, 24);
  assert.deepStrictEqual(temas.map(x => x.n), Array.from({ length: 24 }, (_, i) => i + 1));
});

test("verificar() devuelve un array", () => {
  assert.ok(Array.isArray(verificar()));
});
