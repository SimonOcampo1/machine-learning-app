const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const assert = require("node:assert");
const { _chequearEscrito, verificar, _chequearTemas, _chequearSvg, _chequearHuerfanos, _chequearNav, _chequearIds, _chequearEnlaces } = require("./verificar.js");

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

// --- _chequearNav ---

test("_chequearNav detecta la marca 'on' en el link equivocado", () => {
  const html = `<a href="index.html" class="nav-link on">Inicio</a>
                <a href="temas.html" class="nav-link">Temas</a>`;
  const errNav = _chequearNav(html, "temas.html");
  assert.strictEqual(errNav.length, 1);
  assert.match(errNav[0], /index\.html/, "el mensaje debe nombrar el link mal marcado");
  assert.strictEqual(_chequearNav(html, "index.html").length, 0);
});

test("_chequearNav detecta la ausencia total de nav", () => {
  const errSinNav = _chequearNav("<p>nada</p>", "index.html");
  assert.strictEqual(errSinNav.length, 1);
  assert.match(errSinNav[0], /navegaci/i, "el mensaje debe decir que falta la navegacion");
});

test("_chequearNav detecta que falta la marca 'on' en el propio link", () => {
  const html = `<a href="index.html" class="nav-link">Inicio</a>
                <a href="temas.html" class="nav-link">Temas</a>`;
  const errores = _chequearNav(html, "index.html");
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("falta"));
});

test("_chequearNav no marca error en una página que no forma parte de la nav (sin link a sí misma)", () => {
  const html = `<a href="index.html" class="nav-link">Inicio</a>
                <a href="temas.html" class="nav-link">Temas</a>`;
  assert.deepStrictEqual(_chequearNav(html, "concept-09-regresion-lineal.html"), []);
});

test("_chequearNav detecta más de un link marcado 'on'", () => {
  const html = `<a href="index.html" class="nav-link on">Inicio</a>
                <a href="temas.html" class="nav-link on">Temas</a>`;
  const errores = _chequearNav(html, "index.html");
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("más de un link"));
});

// --- _chequearIds ---

test("_chequearIds detecta ids de ejercicio duplicados", () => {
  const js = `Ejercicios.montar("#e", [{tipo:"mcq", id:"a1"},{tipo:"num", id:"a1"}], "t");`;
  const errores = _chequearIds(js);
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("a1"));
});

test("_chequearIds no marca ids distintos", () => {
  const js = `Ejercicios.montar("#e", [{tipo:"mcq", id:"a1"},{tipo:"num", id:"a2"}], "t");`;
  assert.strictEqual(_chequearIds(js).length, 0);
});

// --- _chequearEnlaces ---

test("_chequearEnlaces: enlace a un archivo que no existe ni está declarado da error", () => {
  const html = `<a href="concept-99-fantasma.html">x</a>`;
  const errores = _chequearEnlaces(
    html, "index.html",
    new Set(["index.html"]),
    new Set(["concept-01-python.html"])
  );
  assert.strictEqual(errores.length, 1);
  assert.ok(errores[0].includes("concept-99-fantasma.html"));
});

test("_chequearEnlaces: enlace a un tema declarado pero todavía sin escribir no es un error", () => {
  const html = `<a href="concept-10-gradiente.html">x</a>`;
  const errores = _chequearEnlaces(
    html, "temas.html",
    new Set(["temas.html"]),
    new Set(["concept-10-gradiente.html"])
  );
  assert.deepStrictEqual(errores, []);
});

test("_chequearEnlaces: enlace a un archivo existente en disco no es un error", () => {
  const html = `<a href="index.html">x</a>`;
  const errores = _chequearEnlaces(
    html, "temas.html",
    new Set(["index.html", "temas.html"]),
    new Set()
  );
  assert.deepStrictEqual(errores, []);
});

test("_chequearEscrito: escrito:true sin archivo en disco da error que lo nombra", () => {
  const errs = _chequearEscrito(
    [{ slug: "knn", archivo: "concept-14-knn.html", escrito: true }],
    new Set()
  );
  assert.strictEqual(errs.length, 1);
  assert.match(errs[0], /concept-14-knn\.html/);
  assert.match(errs[0], /no existe/);
});

test("_chequearEscrito: archivo en disco sin escrito:true da error que lo nombra", () => {
  const errs = _chequearEscrito(
    [{ slug: "knn", archivo: "concept-14-knn.html" }],
    new Set(["concept-14-knn.html"])
  );
  assert.strictEqual(errs.length, 1);
  assert.match(errs[0], /escrito:true/);
});

test("_chequearEscrito: los dos casos coherentes no dan error", () => {
  const errs = _chequearEscrito(
    [
      { slug: "a", archivo: "concept-01-a.html", escrito: true },
      { slug: "b", archivo: "concept-02-b.html" }
    ],
    new Set(["concept-01-a.html"])
  );
  assert.deepStrictEqual(errs, []);
});

test("_chequearNav normaliza el prefijo ./ al buscar el link propio", () => {
  const html = `<a href="./index.html" class="nav-link on">Inicio</a>
                <a href="temas.html" class="nav-link">Temas</a>`;
  assert.deepStrictEqual(_chequearNav(html, "index.html"), []);
});
