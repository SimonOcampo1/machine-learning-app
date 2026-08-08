const { test } = require("node:test");
const assert = require("node:assert");
const handler = require("../../api/config.js");

/* Respuesta mínima con la forma que usa Vercel: encadenable y con captura de
   lo que se devolvió. */
function resFalso() {
  const r = { codigo: null, cuerpo: null, headers: {} };
  r.status = (c) => { r.codigo = c; return r; };
  r.json = (o) => { r.cuerpo = o; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  return r;
}

const conEnv = (valor, fn) => {
  const antes = process.env.GOOGLE_CLIENT_ID;
  if (valor === undefined) delete process.env.GOOGLE_CLIENT_ID;
  else process.env.GOOGLE_CLIENT_ID = valor;
  try { fn(); } finally {
    if (antes === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = antes;
  }
};

test("config devuelve el client id cuando está configurado", () => {
  conEnv("abc.apps.googleusercontent.com", () => {
    const res = resFalso();
    handler({ method: "GET" }, res);
    assert.strictEqual(res.codigo, 200);
    assert.deepStrictEqual(res.cuerpo, { clientId: "abc.apps.googleusercontent.com" });
  });
});

/* Sin la variable NO es un error: el sitio funciona completo contra
   localStorage y "no hay login configurado" es un estado válido. Un 500 acá
   haría que el front lo trate como caída y llenaría la consola. */
test("sin la variable devuelve 200 con objeto vacío, no un error", () => {
  conEnv(undefined, () => {
    const res = resFalso();
    handler({ method: "GET" }, res);
    assert.strictEqual(res.codigo, 200);
    assert.deepStrictEqual(res.cuerpo, {});
  });
});

test("una variable vacía se trata igual que ausente", () => {
  conEnv("", () => {
    const res = resFalso();
    handler({ method: "GET" }, res);
    assert.deepStrictEqual(res.cuerpo, {});
  });
});

/* El endpoint no expone NADA más que el client id. Es el chequeo que impide
   que alguien le agregue un día un campo con el token de Redis al lado. */
test("no expone ninguna otra clave", () => {
  conEnv("abc.apps.googleusercontent.com", () => {
    const res = resFalso();
    handler({ method: "GET" }, res);
    assert.deepStrictEqual(Object.keys(res.cuerpo), ["clientId"]);
  });
});

test("rechaza métodos que no sean GET", () => {
  const res = resFalso();
  handler({ method: "POST" }, res);
  assert.strictEqual(res.codigo, 405);
  assert.strictEqual(res.headers.Allow, "GET");
});
