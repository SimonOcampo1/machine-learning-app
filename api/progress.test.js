const { test } = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");
const { verificarToken, _setClavesParaTest, _validarCuerpo } = require("./progress.js");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "test-kid", alg: "RS256", use: "sig" };

const b64u = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

function firmar(payload, { kid = "test-kid", alg = "RS256" } = {}) {
  const cabeza = b64u({ alg, kid, typ: "JWT" });
  const cuerpo = b64u(payload);
  const firma = crypto.sign("RSA-SHA256", Buffer.from(`${cabeza}.${cuerpo}`), privateKey);
  return `${cabeza}.${cuerpo}.${firma.toString("base64url")}`;
}

const CLIENT_ID = "cliente-de-prueba.apps.googleusercontent.com";
const PERMITIDOS = ["david@gmail.com", "abel@gmail.com"];
const futuro = () => Math.floor(Date.now() / 1000) + 3600;

const valido = () => ({
  iss: "https://accounts.google.com", aud: CLIENT_ID, sub: "1234567890",
  email: "david@gmail.com", email_verified: true, exp: futuro()
});

test.before(() => { _setClavesParaTest([jwk]); });

test("acepta un token válido y devuelve el payload", async () => {
  const p = await verificarToken(firmar(valido()), CLIENT_ID, PERMITIDOS);
  assert.strictEqual(p.sub, "1234567890");
});

test("rechaza una firma adulterada", async () => {
  const t = firmar(valido());
  const roto = t.slice(0, -6) + "AAAAAA";
  await assert.rejects(() => verificarToken(roto, CLIENT_ID, PERMITIDOS), /firma/);
});

test("rechaza un token con el payload cambiado después de firmar", async () => {
  const [c, , f] = firmar(valido()).split(".");
  const otro = b64u({ ...valido(), email: "intruso@gmail.com" });
  await assert.rejects(() => verificarToken(`${c}.${otro}.${f}`, CLIENT_ID, PERMITIDOS), /firma/);
});

test("rechaza un token expirado", async () => {
  const t = firmar({ ...valido(), exp: Math.floor(Date.now() / 1000) - 10 });
  await assert.rejects(() => verificarToken(t, CLIENT_ID, PERMITIDOS), /expirado/);
});

test("rechaza otro aud", async () => {
  const t = firmar({ ...valido(), aud: "otra-app.apps.googleusercontent.com" });
  await assert.rejects(() => verificarToken(t, CLIENT_ID, PERMITIDOS), /aud/);
});

test("rechaza otro iss", async () => {
  const t = firmar({ ...valido(), iss: "https://evil.example.com" });
  await assert.rejects(() => verificarToken(t, CLIENT_ID, PERMITIDOS), /iss/);
});

test("rechaza alg none", async () => {
  const cabeza = b64u({ alg: "none", kid: "test-kid", typ: "JWT" });
  const cuerpo = b64u(valido());
  await assert.rejects(() => verificarToken(`${cabeza}.${cuerpo}.`, CLIENT_ID, PERMITIDOS), /alg/);
});

test("rechaza un email fuera de la allowlist", async () => {
  const t = firmar({ ...valido(), email: "cualquiera@gmail.com" });
  await assert.rejects(() => verificarToken(t, CLIENT_ID, PERMITIDOS), /autorizado/);
});

test("rechaza un email sin verificar", async () => {
  const t = firmar({ ...valido(), email_verified: false });
  await assert.rejects(() => verificarToken(t, CLIENT_ID, PERMITIDOS), /autorizado/);
});

test("rechaza un kid desconocido", async () => {
  const t = firmar(valido(), { kid: "kid-que-no-existe" });
  await assert.rejects(() => verificarToken(t, CLIENT_ID, PERMITIDOS), /kid/);
});

test("rechaza basura que no es un JWT", async () => {
  await assert.rejects(() => verificarToken("no-soy-un-token", CLIENT_ID, PERMITIDOS), /formato/);
});

test("_validarCuerpo acepta un estado normal", () => {
  const est = { v: 1, temas: { rl: { leido: true, quiz: true, ejercicios: { e1: 100 } } } };
  assert.strictEqual(_validarCuerpo(est).ok, true);
});

test("_validarCuerpo rechaza lo que no es un estado", () => {
  assert.strictEqual(_validarCuerpo(null).ok, false);
  assert.strictEqual(_validarCuerpo("hola").ok, false);
  assert.strictEqual(_validarCuerpo({ sin: "temas" }).ok, false);
  assert.strictEqual(_validarCuerpo({ v: 1, temas: [] }).ok, false);
});

test("_validarCuerpo rechaza un cuerpo demasiado grande", () => {
  const gordo = { v: 1, temas: {} };
  for (let i = 0; i < 20000; i++) gordo.temas["t" + i] = { leido: true, quiz: true, ejercicios: {} };
  const r = _validarCuerpo(gordo);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.codigo, 413);
});
