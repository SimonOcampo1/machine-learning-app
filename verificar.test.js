const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const assert = require("node:assert");
const { verificar, _chequearTemas, _chequearSvg, _chequearHuerfanos } = require("./verificar.js");

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

// --- _chequearTemas ---

test("_chequearTemas: slug duplicado da error que nombra el slug", () => {
  const temas = [
    { n: 1, slug: "python", archivo: "concept-01-python.html" },
    { n: 2, slug: "python", archivo: "concept-02-numpy.html" }
  ];
  const errores = _chequearTemas(temas);
  assert.ok(errores.some(e => e.includes("python")), `esperaba un error mencionando "python", recibí: ${JSON.stringify(errores)}`);
});

test("_chequearTemas: prefijo de archivo que no coincide con n da error", () => {
  const temas = [{ n: 9, slug: "regresion-lineal", archivo: "concept-10-regresion-lineal.html" }];
  const errores = _chequearTemas(temas);
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("concept-10-regresion-lineal.html"));
});

test("_chequearTemas: nombre de archivo con formato inválido da error", () => {
  const temas = [{ n: 1, slug: "python", archivo: "Concept-1-python.html" }];
  const errores = _chequearTemas(temas);
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("Concept-1-python.html"));
});

test("_chequearTemas: entrada válida no da errores", () => {
  const temas = [
    { n: 1, slug: "python", archivo: "concept-01-python.html" },
    { n: 2, slug: "numpy", archivo: "concept-02-numpy.html" }
  ];
  assert.deepStrictEqual(_chequearTemas(temas), []);
});

// --- _chequearSvg ---

test("_chequearSvg: color hexadecimal en fill da error", () => {
  const html = `<svg><rect fill="#ff0000" /></svg>`;
  const errores = _chequearSvg(html, "concept-01-python.html");
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("#ff0000"));
});

test("_chequearSvg: referencia href a un id no es un falso positivo", () => {
  const html = `<svg><use href="#punto1" /></svg>`;
  assert.deepStrictEqual(_chequearSvg(html, "concept-01-python.html"), []);
});

test("_chequearSvg: url(#id) tampoco es un falso positivo", () => {
  const html = `<svg><rect fill="url(#grad1)" /></svg>`;
  assert.deepStrictEqual(_chequearSvg(html, "concept-01-python.html"), []);
});

// --- _chequearHuerfanos ---

test("_chequearHuerfanos: archivo en disco no declarado da error", () => {
  const errores = _chequearHuerfanos(["concept-99-fantasma.html"], new Set(["concept-01-python.html"]));
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("concept-99-fantasma.html"));
});

test("_chequearHuerfanos: archivo declarado no da error", () => {
  const declarados = new Set(["concept-01-python.html"]);
  assert.deepStrictEqual(_chequearHuerfanos(["concept-01-python.html"], declarados), []);
});

// --- verificar(): temario.json ilegible ---

test("verificar(): temario.json ilegible da un solo error, sin excepción", () => {
  const p = path.join(__dirname, "data/temario.json");
  const original = fs.readFileSync(p, "utf8");
  fs.writeFileSync(p, "{ esto no es json válido", "utf8");
  try {
    const errores = verificar();
    assert.strictEqual(errores.length, 1);
  } finally {
    fs.writeFileSync(p, original, "utf8");
  }
});
