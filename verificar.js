const fs = require("node:fs");
const path = require("node:path");

const RAIZ = __dirname;

// Slugs y números únicos, formato de archivo válido, y prefijo de archivo == n
function _chequearTemas(temas) {
  const errores = [];
  const slugs = new Set();
  for (const t of temas) {
    if (slugs.has(t.slug)) errores.push(`slug duplicado: ${t.slug}`);
    slugs.add(t.slug);

    if (!/^concept-\d{2}-[a-z0-9-]+\.html$/.test(t.archivo)) {
      errores.push(`nombre de archivo inválido: ${t.archivo}`);
      continue;
    }
    const prefijo = t.archivo.match(/^concept-(\d{2})-/)[1];
    const esperado = String(t.n).padStart(2, "0");
    if (prefijo !== esperado) {
      errores.push(`prefijo de archivo (${prefijo}) no coincide con n (${t.n}): ${t.archivo}`);
    }
  }
  return errores;
}

// Ningún hexadecimal literal en contexto de color dentro de un <svg>
// (excluye referencias como href="#id" o url(#id), que no son colores)
function _chequearSvg(html, archivo) {
  const errores = [];
  for (const svg of html.match(/<svg[\s\S]*?<\/svg>/g) || []) {
    const hex = svg.match(/(?:fill|stroke|stop-color|flood-color|lighting-color|color)\s*[:=]\s*["']?\s*#[0-9a-fA-F]{3,8}/g);
    if (hex) errores.push(`${archivo}: color literal en <svg>: ${hex.join(", ")}`);
  }
  return errores;
}

// Archivos HTML que existen en disco pero no están declarados en el temario
function _chequearHuerfanos(archivosEnDisco, declarados) {
  const errores = [];
  for (const f of archivosEnDisco) {
    if (f.startsWith("concept-") && f.endsWith(".html") && !declarados.has(f)) {
      errores.push(`archivo huérfano, no está en temario.json: ${f}`);
    }
  }
  return errores;
}

function verificar() {
  let temario;
  try {
    temario = JSON.parse(fs.readFileSync(path.join(RAIZ, "data/temario.json"), "utf8"));
  } catch (e) {
    return [`no se pudo leer data/temario.json: ${e.message}`];
  }

  const temas = temario.fases.flatMap(f => f.temas);
  const errores = [..._chequearTemas(temas)];

  // Cada tema declarado debe tener su HTML, si ya fue escrito
  for (const t of temas) {
    const p = path.join(RAIZ, t.archivo);
    if (fs.existsSync(p)) {
      const html = fs.readFileSync(p, "utf8");
      errores.push(..._chequearSvg(html, t.archivo));
    }
  }

  const declarados = new Set(temas.map(t => t.archivo));
  errores.push(..._chequearHuerfanos(fs.readdirSync(RAIZ), declarados));

  return errores;
}

if (require.main === module) {
  const errores = verificar();
  if (errores.length) {
    console.error(`✗ ${errores.length} problema(s):`);
    for (const e of errores) console.error("  - " + e);
    process.exit(1);
  }
  console.log("✓ verificación OK");
}

module.exports = { verificar, _chequearTemas, _chequearSvg, _chequearHuerfanos };
