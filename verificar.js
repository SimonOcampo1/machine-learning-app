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
/* El invariante que sostiene toda la Etapa 5: `escrito: true` y la existencia
   del archivo tienen que ir juntos. Si se separan, se rompen en silencio tres
   cosas a la vez — el roadmap del home, el indice de temas y la navegacion
   prev/next de la pagina vecina. Son los dos errores que se van a cometer 23
   veces al escribir el resto de los temas. */
function _chequearEscrito(temas, existentes) {
  const errores = [];
  for (const t of temas) {
    const enDisco = existentes.has(t.archivo);
    if (t.escrito === true && !enDisco) {
      errores.push(`${t.slug}: marcado escrito:true pero ${t.archivo} no existe`);
    }
    if (t.escrito !== true && enDisco) {
      errores.push(`${t.slug}: ${t.archivo} existe pero falta escrito:true en temario.json`);
    }
  }
  return errores;
}

/* Todo tema escrito tiene que declarar cuántos ejercicios corregibles tiene.
   Sin el campo, `Progreso.estadoTema` lo lee como "tema sin escribir" y el tema
   nunca llega a "completo" por más que se resuelvan todos los ejercicios — en
   silencio, que es lo peor. Antes esto vivía en un registro manual en index.js
   y era el paso más fácil de olvidar de los cuatro que pide agregar un tema. */
function _chequearEjercicios(temas) {
  const errores = [];
  for (const t of temas) {
    if (t.escrito !== true) continue;
    if (typeof t.ejercicios !== "number" || !Number.isInteger(t.ejercicios) || t.ejercicios < 0) {
      errores.push(`${t.slug}: escrito:true pero le falta "ejercicios": <entero> en temario.json`);
    }
  }
  return errores;
}

/* La anotación entre llaves es la firma tipográfica del sistema (ver DESIGN.md).
   Va en el HTML y no en un `::before` porque es parte del texto y se lee en voz
   alta — lo cual la hace fácil de olvidar al copiar la plantilla. */
function _chequearEyebrow(html, archivo) {
  const errores = [];
  for (const [, contenido] of html.matchAll(/<p class="eyebrow">([\s\S]*?)<\/p>/g)) {
    const txt = contenido.replace(/<[^>]*>/g, "").trim();
    if (!/^\{\s.*\s\}$/.test(txt)) {
      errores.push(`${archivo}: .eyebrow sin las llaves de la firma: "${txt}"`);
    }
  }
  return errores;
}

/* La notación matemática vive en `data-tex` y la compone KaTeX; el contenido
   del elemento es el mismo en Unicode y es lo que queda si el CDN no responde.
   Ese respaldo es también lo que hace que un LaTeX roto sea INVISIBLE: la
   página sigue mostrando el Unicode correcto y nadie se entera de que la
   fórmula nunca se compuso. Estos son los dos errores que se cometen tipeando
   LaTeX a mano y que se pueden detectar sin traerse KaTeX como dependencia:
   llaves desbalanceadas y un `data-tex` vacío. */
function _chequearTex(html, archivo) {
  const errores = [];
  for (const [, crudo] of html.matchAll(/data-tex="([^"]*)"/g)) {
    const tex = crudo.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    if (!tex.trim()) {
      errores.push(`${archivo}: data-tex vacío`);
      continue;
    }
    let nivel = 0;
    for (let i = 0; i < tex.length; i++) {
      if (tex[i - 1] === "\\") continue;   // \{ y \} son llaves literales
      if (tex[i] === "{") nivel++;
      if (tex[i] === "}") nivel--;
      if (nivel < 0) break;
    }
    if (nivel !== 0) errores.push(`${archivo}: llaves desbalanceadas en LaTeX: ${tex}`);
  }
  return errores;
}

/* Un elemento con `data-tex` tiene que traer además su respaldo en Unicode. Si
   queda vacío, el día que KaTeX no cargue el lector ve un hueco en lugar de la
   fórmula — que es exactamente el modo de falla que el diseño `data-tex` viene
   a evitar. Sin este chequeo, un respaldo olvidado no se nota nunca, porque en
   condiciones normales KaTeX lo tapa. */
function _chequearRespaldoTex(html, archivo) {
  const errores = [];
  for (const [, contenido] of html.matchAll(/data-tex="[^"]*"[^>]*>([\s\S]*?)<\/(?:span|div)>/g)) {
    if (!contenido.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()) {
      errores.push(`${archivo}: data-tex sin respaldo en Unicode`);
    }
  }
  return errores;
}

function _chequearNav(html, archivo) {
  const errores = [];
  const links = [...html.matchAll(/<a\s+href="([^"]+)"\s+class="nav-link([^"]*)"/g)];
  if (!links.length) return [`${archivo}: no tiene bloque de navegación`];
  // Token exacto, no substring: una clase como "nav-link icon" no debe contar
  // como marcada. El chequeo cuida 24 paginas, conviene que no de falsos positivos.
  const marcados = links.filter(([, , extra]) => extra.trim().split(/\s+/).includes("on"));
  // Se normaliza el prefijo "./" igual que en _chequearEnlaces: sin esto una
  // nav escrita como "./index.html" apagaria este chequeo en silencio.
  const norm = (h) => h.replace(/^\.\//, "");
  const esPropioDeLaNav = links.some(([, href]) => norm(href) === archivo);
  if (marcados.length > 1) {
    errores.push(`${archivo}: más de un link de nav marcado 'on'`);
  } else if (marcados.length === 1 && norm(marcados[0][1]) !== archivo) {
    errores.push(`${archivo}: marca 'on' en el link a ${norm(marcados[0][1])}`);
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
  const errores = [..._chequearTemas(temas), ..._chequearEjercicios(temas)];

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
  errores.push(..._chequearEscrito(temas, existentes));

  for (const archivo of existentes) {
    if (archivo === "muestra.html") continue;
    const html = fs.readFileSync(path.join(RAIZ, archivo), "utf8");
    errores.push(..._chequearNav(html, archivo));
    errores.push(..._chequearEyebrow(html, archivo));
    errores.push(..._chequearEnlaces(html, archivo, existentes, declarados));
    errores.push(..._chequearTex(html, archivo));
    errores.push(..._chequearRespaldoTex(html, archivo));
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

module.exports = { verificar, _chequearEscrito, _chequearTemas, _chequearSvg, _chequearHuerfanos, _chequearNav, _chequearIds, _chequearEnlaces, _chequearEjercicios, _chequearEyebrow, _chequearTex, _chequearRespaldoTex };
