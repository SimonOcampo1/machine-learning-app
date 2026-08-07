const fs = require("node:fs");
const path = require("node:path");

const RAIZ = __dirname;

function verificar() {
  const errores = [];
  const temario = JSON.parse(fs.readFileSync(path.join(RAIZ, "data/temario.json"), "utf8"));
  const temas = temario.fases.flatMap(f => f.temas);

  // Slugs y números únicos y correlativos
  const slugs = new Set();
  for (const t of temas) {
    if (slugs.has(t.slug)) errores.push(`slug duplicado: ${t.slug}`);
    slugs.add(t.slug);
    if (!/^concept-\d{2}-[a-z0-9-]+\.html$/.test(t.archivo)) {
      errores.push(`nombre de archivo inválido: ${t.archivo}`);
    }
  }

  // Cada tema declarado debe tener su HTML, si ya fue escrito
  for (const t of temas) {
    const p = path.join(RAIZ, t.archivo);
    if (fs.existsSync(p)) {
      const html = fs.readFileSync(p, "utf8");
      // Ningún hexadecimal literal dentro de un <svg>
      for (const svg of html.match(/<svg[\s\S]*?<\/svg>/g) || []) {
        const hex = svg.match(/#[0-9a-fA-F]{3,8}\b/g);
        if (hex) errores.push(`${t.archivo}: color literal en <svg>: ${hex.join(", ")}`);
      }
    }
  }

  // Archivos HTML huérfanos: existen pero no están en el temario
  const declarados = new Set(temas.map(t => t.archivo));
  for (const f of fs.readdirSync(RAIZ)) {
    if (f.startsWith("concept-") && f.endsWith(".html") && !declarados.has(f)) {
      errores.push(`archivo huérfano, no está en temario.json: ${f}`);
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

module.exports = { verificar };
