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

// Bloque de navegación presente, y la marca 'on' en el link que corresponde
// al archivo actual. Una página que no forma parte de la nav (ej. una
// página de tema, que no tiene link a sí misma en Inicio/Temas) no debe
// tener ningún link marcado.
function _chequearNav(html, archivo) {
  const errores = [];
  const links = [...html.matchAll(/<a\s+href="([^"]+)"\s+class="nav-link([^"]*)"/g)];
  if (!links.length) return [`${archivo}: no tiene bloque de navegación`];
  // Token exacto, no substring: una clase como "nav-link icon" no debe contar
  // como marcada. El chequeo cuida 24 paginas, conviene que no de falsos positivos.
  const marcados = links.filter(([, , extra]) => extra.trim().split(/\s+/).includes("on"));
  const esPropioDeLaNav = links.some(([, href]) => href === archivo);
  if (marcados.length > 1) {
    errores.push(`${archivo}: más de un link de nav marcado 'on'`);
  } else if (marcados.length === 1 && marcados[0][1] !== archivo) {
    errores.push(`${archivo}: marca 'on' en el link a ${marcados[0][1]}`);
  } else if (marcados.length === 0 && esPropioDeLaNav) {
    errores.push(`${archivo}: le falta la marca 'on' en su propio link`);
  }
  return errores;
}

// Ids de ejercicio duplicados dentro de un mismo archivo JS
function _chequearIds(js) {
  const ids = [...js.matchAll(/\bid:\s*["']([^"']+)["']/g)].map(m => m[1]);
  const vistos = new Set();
  const dup = new Set();
  for (const id of ids) { if (vistos.has(id)) dup.add(id); vistos.add(id); }
  return [...dup].map(id => `id de ejercicio duplicado: ${id}`);
}

// Enlaces a .html que no existen en disco ni están declarados en el temario.
// Un tema declarado pero todavía sin escribir no es un enlace roto, es un
// tema pendiente: distinguirlo es lo que mantiene el chequeo útil durante
// toda la Etapa 5, cuando faltan 23 archivos por escribir.
function _chequearEnlaces(html, archivo, existentes, declarados) {
  const errores = [];
  for (const [, crudo] of html.matchAll(/href="([^"#?:]+\.html)[^"]*"/g)) {
    const href = crudo.replace(/^\.\//, ""); // "./index.html" es el mismo archivo que "index.html"
    if (existentes.has(href)) continue;
    if (declarados.has(href)) continue;
    errores.push(`${archivo}: enlace roto a ${href}`);
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

  const archivosEnDisco = fs.readdirSync(RAIZ);
  const declarados = new Set(temas.map(t => t.archivo));
  errores.push(..._chequearHuerfanos(archivosEnDisco, declarados));

  // Nav e enlaces: todas las páginas de la raíz, salvo muestra.html
  // (kitchen sink del design system: no está en la nav ni es una página de tema)
  const existentes = new Set(archivosEnDisco.filter(f => f.endsWith(".html")));
  for (const archivo of existentes) {
    if (archivo === "muestra.html") continue;
    const html = fs.readFileSync(path.join(RAIZ, archivo), "utf8");
    errores.push(..._chequearNav(html, archivo));
    errores.push(..._chequearEnlaces(html, archivo, existentes, declarados));
  }

  // Ids de ejercicio duplicados en cada archivo JS (salvo los de test)
  for (const archivo of archivosEnDisco) {
    if (archivo.endsWith(".js") && !archivo.endsWith(".test.js")) {
      const js = fs.readFileSync(path.join(RAIZ, archivo), "utf8");
      errores.push(..._chequearIds(js));
    }
  }

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

module.exports = { verificar, _chequearTemas, _chequearSvg, _chequearHuerfanos, _chequearNav, _chequearIds, _chequearEnlaces };
