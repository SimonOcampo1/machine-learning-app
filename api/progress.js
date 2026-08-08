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

/* `allowlist` vacía significa ABIERTO, no "nadie pasa".
   El sitio nació como un regalo para dos personas y la lista de mails era el
   portero. Pero el progreso ya se guarda por usuario —la clave de Redis es el
   `sub` de Google, no un blob compartido— así que abrirlo no toca nada de la
   arquitectura: nadie puede leer ni pisar el progreso de otro, y todos los
   chequeos que importan (firma RS256 contra las claves de Google, `aud`,
   `iss`, `exp`, `email_verified`) siguen igual de puestos.
   Se deja como interruptor y no se borra el código: `EMAILS_PERMITIDOS` vacío
   abre, con mails adentro cierra. Si algún día aparece abuso, se cierra desde
   las variables de entorno sin volver a desplegar. */
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
  // `email_verified` NO es opcional aunque el sitio esté abierto: sin él,
  // cualquiera que controle un dominio propio puede pedirle a Google un token
  // con el mail de otra persona, y el `sub` iría atado a esa impostura.
  if (!payload.email_verified) throw new Error("email sin verificar");
  if (allowlist.length && !allowlist.includes(payload.email)) {
    throw new Error("usuario no autorizado");
  }
  return payload;
}

const LIMITE_BYTES = 64 * 1024;

function _validarCuerpo(cuerpo) {
  if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
    return { ok: false, codigo: 400, msg: "cuerpo inválido" };
  }
  if (!cuerpo.temas || typeof cuerpo.temas !== "object" || Array.isArray(cuerpo.temas)) {
    return { ok: false, codigo: 400, msg: "falta el objeto temas" };
  }
  if (Buffer.byteLength(JSON.stringify(cuerpo), "utf8") > LIMITE_BYTES) {
    return { ok: false, codigo: 413, msg: "el progreso excede 64 KB" };
  }
  return { ok: true };
}

/* Upstash por REST: sin cliente de Redis, solo fetch. */
function configRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("faltan las variables de entorno de Redis");
  return { url: url.replace(/\/$/, ""), token };
}

async function redisGet(clave) {
  const { url, token } = configRedis();
  const r = await fetch(`${url}/get/${encodeURIComponent(clave)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error(`Redis GET falló: ${r.status}`);
  const { result } = await r.json();
  return result ? JSON.parse(result) : null;
}

/* Un año, renovado en cada escritura. Con el sitio abierto, cada persona que
   entre una vez y no vuelva deja un registro de hasta 64 KB para siempre; el
   TTL hace que esos registros se limpien solos y que el almacenamiento crezca
   con los usuarios ACTIVOS y no con los que pasaron. Para alguien que estudia
   de verdad es invisible: cualquier ejercicio resuelto lo empuja otro año. */
const TTL_SEGUNDOS = 365 * 24 * 3600;

async function redisSet(clave, valor) {
  const { url, token } = configRedis();
  const r = await fetch(`${url}/set/${encodeURIComponent(clave)}?EX=${TTL_SEGUNDOS}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body: JSON.stringify(valor)
  });
  if (!r.ok) throw new Error(`Redis SET falló: ${r.status}`);
}

async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  // Sin `EMAILS_PERMITIDOS` el sitio queda abierto a cualquier cuenta de Google
  // verificada, que es el modo por defecto. Lo único que sigue siendo
  // obligatorio es el client id: sin él no hay contra qué validar el `aud` y
  // serviría cualquier token de cualquier app, que sí es un agujero.
  const permitidos = (process.env.EMAILS_PERMITIDOS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!clientId) {
    return res.status(500).json({ error: "servidor mal configurado" });
  }

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "falta el token" });

  let usuario;
  try {
    usuario = await verificarToken(token, clientId, permitidos);
  } catch (e) {
    // Sin detalle al cliente: no le decimos a un atacante qué chequeo falló.
    console.warn("token rechazado:", e.message);
    return res.status(401).json({ error: "no autorizado" });
  }

  const clave = `ml:progress:${usuario.sub}`;

  try {
    if (req.method === "GET") {
      const datos = await redisGet(clave);
      return datos ? res.status(200).json(datos) : res.status(204).end();
    }

    if (req.method === "POST") {
      let cuerpo;
      try {
        cuerpo = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      } catch {
        // Un cuerpo ilegible es error del cliente, no del almacenamiento.
        // Sin esta guarda caía en el catch de abajo y se reportaba un 500.
        return res.status(400).json({ error: "cuerpo JSON inválido" });
      }
      const v = _validarCuerpo(cuerpo);
      if (!v.ok) return res.status(v.codigo).json({ error: v.msg });
      await redisSet(clave, cuerpo);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "método no permitido" });
  } catch (e) {
    console.error("error del almacenamiento:", e);
    return res.status(500).json({ error: "no se pudo acceder al almacenamiento" });
  }
}

module.exports = handler;
module.exports.verificarToken = verificarToken;
module.exports._setClavesParaTest = _setClavesParaTest;
module.exports._validarCuerpo = _validarCuerpo;
