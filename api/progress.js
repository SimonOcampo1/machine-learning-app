const crypto = require("node:crypto");

const CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISS_VALIDOS = ["accounts.google.com", "https://accounts.google.com"];

let cacheClaves = { claves: null, vence: 0 };

/* Solo para tests: inyecta claves y saltea la red. */
function _setClavesParaTest(claves) {
  cacheClaves = { claves, vence: Date.now() + 3600e3 };
}

async function clavesGoogle() {
  if (cacheClaves.claves && Date.now() < cacheClaves.vence) return cacheClaves.claves;
  const r = await fetch(CERTS_URL);
  if (!r.ok) throw new Error("no se pudieron traer las claves de Google");
  const m = /max-age=(\d+)/.exec(r.headers.get("cache-control") || "");
  const { keys } = await r.json();
  cacheClaves = { claves: keys, vence: Date.now() + (m ? Number(m[1]) : 3600) * 1000 };
  return keys;
}

const desdeB64u = (s) => Buffer.from(s, "base64url");

async function verificarToken(token, clientId, allowlist) {
  const partes = String(token || "").split(".");
  if (partes.length !== 3) throw new Error("formato de token inválido");
  const [c64, p64, f64] = partes;

  let cabeza;
  try { cabeza = JSON.parse(desdeB64u(c64).toString("utf8")); }
  catch { throw new Error("formato de token inválido"); }

  // Se chequea antes que nada: un alg "none" con firma vacía no debe llegar ni a mirarse.
  if (cabeza.alg !== "RS256") throw new Error(`alg no soportado: ${cabeza.alg}`);

  const jwk = (await clavesGoogle()).find(k => k.kid === cabeza.kid);
  if (!jwk) throw new Error("kid desconocido");

  const publica = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const firmaOk = crypto.verify(
    "RSA-SHA256", Buffer.from(`${c64}.${p64}`), publica, desdeB64u(f64)
  );
  if (!firmaOk) throw new Error("firma inválida");

  let payload;
  try { payload = JSON.parse(desdeB64u(p64).toString("utf8")); }
  catch { throw new Error("formato de token inválido"); }

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) throw new Error("token expirado");
  if (payload.aud !== clientId) throw new Error("aud incorrecto");
  if (!ISS_VALIDOS.includes(payload.iss)) throw new Error("iss incorrecto");
  if (!payload.email_verified || !allowlist.includes(payload.email)) {
    throw new Error("usuario no autorizado");
  }
  return payload;
}

/*
 * Handler de Vercel. La Tarea 14 completa la lectura/escritura en Redis;
 * acá solo queda cableada la verificación del token contra las variables
 * de entorno del proyecto.
 */
async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "falta el token" });
      return;
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const allowlist = (process.env.EMAILS_PERMITIDOS || "").split(",").map(e => e.trim()).filter(Boolean);
    await verificarToken(token, clientId, allowlist);
    res.status(501).json({ error: "todavía no implementado (Tarea 14)" });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

module.exports = { verificarToken, _setClavesParaTest, handler };
