/* Mide el contraste WCAG de los tokens de color y falla si alguno no llega a
   su piso. Reemplaza al script efímero de navegador que se usaba antes: los
   tintes se calculan en OKLab con la misma fórmula que `color-mix(in oklab)`,
   así que el número de acá es el que va a pintar el navegador.

   Correr: node contraste.js       (sale 1 si alguna fila no llega)
   Regenerar la tabla de docs/contraste.md: node contraste.js --markdown */

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
};

/* sRGB con gamma → lineal. Es la misma curva que pide WCAG para la luminancia
   y que pide OKLab de entrada, así que se comparte. */
const aLineal = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const aGamma = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function aOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function desdeOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/* Equivalente de `color-mix(in oklab, a p%, b)`. Ambos colores son opacos, así
   que el premultiplicado por alfa que manda la spec se reduce a un lerp. */
function mezclar(a, b, p) {
  const ca = aOklab(hex(a).map(aLineal));
  const cb = aOklab(hex(b).map(aLineal));
  const m = ca.map((v, i) => v * p + cb[i] * (1 - p));
  const rgb = desdeOklab(m).map((v) => Math.min(1, Math.max(0, aGamma(v))));
  return "#" + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}

const luminancia = (h) => {
  const [r, g, b] = hex(h).map(aLineal);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ── Los tokens, tal como los declara shared.css ─────────────────────────── */
const CANVAS = "#0e100f";
const PANEL = "#191919";
const CREAM = "#fffce1";
/* Dos grises, y el motivo por el que son dos: `--s50` es el apagado de GSAP,
   pero da 4.16:1 sobre el panel — no llega a AA. Como acá el texto secundario
   vive tanto en el canvas como dentro de las tarjetas, el token de TEXTO es el
   claro (`--s75`) y `--s50` queda para trazos y rellenos, donde el piso es 3. */
const S75 = "#bbbaa6";
const S50 = "#7c7c6f";

const FASES = [
  [0, "Piso", "#00bae2"],
  [1, "Aprender de los datos", "#9d95ff"],
  [2, "Regresión", "#0ae448"],
  [3, "Clasificación", "#ff8709"],
  [4, "Árboles y no supervisado", "#fec5fb"],
  [5, "Redes neuronales", "#abff84"],
];

/* El mismo 10% que usa `--fase-tint`. Si se toca en shared.css, se toca acá. */
const TINTE = 0.10;

const filas = [
  ["--cream sobre canvas", CREAM, CANVAS, 7],
  ["--cream sobre panel", CREAM, PANEL, 7],
  ["--ink-mute (s75) sobre canvas", S75, CANVAS, 4.5],
  ["--ink-mute (s75) sobre panel", S75, PANEL, 4.5],
  // Piso 3: `--s50` solo pinta trazos y rellenos de SVG, nunca texto.
  ["--s50 (no-texto) sobre canvas", S50, CANVAS, 3],
  ["--s50 (no-texto) sobre panel", S50, PANEL, 3],
];

for (const [n, nombre, color] of FASES) {
  // El acento se usa en texto chico (labels de fase, estados), así que el piso
  // es 4.5, no 3. Que además pasen 7 es margen, no requisito.
  filas.push([`fase ${n} · ${nombre}`, color, CANVAS, 4.5]);
}

for (const [n, , color] of FASES) {
  const tinte = mezclar(color, CANVAS, TINTE);
  filas.push([`--cream sobre tinte de fase ${n} (${tinte})`, CREAM, tinte, 7]);
}

/* ── Salida ─────────────────────────────────────────────────────────────── */
const medidas = filas.map(([nombre, a, b, piso]) => {
  const r = contraste(a, b);
  return { nombre, piso, ratio: r, pasa: r >= piso };
});

const fallan = medidas.filter((m) => !m.pasa);

if (process.argv.includes("--markdown")) {
  console.log("| Par | Piso | Medido | |");
  console.log("|---|---|---|---|");
  for (const m of medidas) {
    console.log(`| \`${m.nombre}\` | ${m.piso}:1 | ${m.ratio.toFixed(2)}:1 | ${m.pasa ? "✅" : "❌"} |`);
  }
} else {
  for (const m of medidas) {
    console.log(`${m.pasa ? "ok  " : "FALLA"} ${m.ratio.toFixed(2).padStart(6)}:1  (piso ${m.piso})  ${m.nombre}`);
  }
  console.log(`\n${medidas.length - fallan.length}/${medidas.length} pasan.`);
}

if (fallan.length) process.exit(1);
