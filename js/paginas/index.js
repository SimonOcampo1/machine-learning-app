const CLIENT_ID = "REEMPLAZAR_CON_EL_CLIENT_ID.apps.googleusercontent.com";

/* Cuántos ejercicios corregibles tiene cada tema sale de `data/temario.json`,
   del campo `ejercicios` de cada tema. Antes vivía en un registro manual acá
   arriba, y olvidarlo hacía que el tema nunca llegara a "completo", en
   silencio. Ahora la única fuente es el temario y `verificar.js` exige el
   campo en todo tema con `escrito: true`.
   Un tema sin el campo pasa `undefined` a `Progreso.estadoTema`, que lo lee
   como "tema sin escribir" — que es exactamente lo que es. */
const totalesDe = (temario) => Object.fromEntries(
  temario.fases.flatMap(f => f.temas)
    .filter(t => typeof t.ejercicios === "number")
    .map(t => [t.slug, t.ejercicios])
);

/* Un solo `elem` en vez de `innerHTML`. El temario es del repo, así que no era
   un XSS, pero un `&` o un `<` en el título de un tema futuro rompía el markup
   sin avisar. Quedan 23 títulos por escribir. */
function elem(tag, clase, texto) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

const ROTULO = {
  "completa": "✓ completo",
  "en-progreso": "en progreso",
  "sin-empezar": "sin empezar"
};

/* La entrada escalonada corre una sola vez. `pintarRoadmap` se vuelve a llamar
   en cada `progreso-actualizado`, y sin esto cada sincronización dejaría un
   ScrollTrigger nuevo por fase, acumulándose. */
let animado = false;

async function pintarRoadmap() {
  let temario;
  try {
    temario = await fetch("data/temario.json").then(r => r.json());
  } catch {
    // Una pagina vacia sin explicacion es el peor fallo posible: los usuarios
    // del sitio no programan y no tienen como saber que paso.
    const cont = document.getElementById("roadmap");
    if (cont) {
      cont.replaceChildren(elem("p", "aviso-error",
        "No se pudo cargar el temario. Si abriste el archivo directamente, probá servirlo con `npx serve` — el navegador bloquea la lectura de datos con file://."));
    }
    return;
  }
  const totales = totalesDe(temario);
  const estado = Progreso.leer();
  const cont = document.getElementById("roadmap");
  cont.replaceChildren();

  for (const fase of temario.fases) {
    const bloque = elem("div", `rm-phase fase-${fase.n}`);

    const meta = elem("div", "rm-phase-meta");
    meta.append(
      elem("p", "eyebrow", `{ Fase ${fase.n} }`),
      elem("div", "rm-phase-n", String(fase.n).padStart(2, "0")),
      elem("h2", null, fase.nombre),
      elem("p", "rm-phase-hint", fase.hint)
    );

    const grilla = elem("div", "rm-cards");

    for (const tema of fase.temas) {
      const est = Progreso.estadoTema(estado, tema.slug, totales[tema.slug]);
      const existe = tema.escrito === true;

      const a = elem("a", `rm-card ${est === "completa" ? "completa" : est === "en-progreso" ? "en-progreso" : ""}`.trim());
      if (existe) a.href = tema.archivo;
      else a.classList.add("proximamente");

      a.append(
        elem("div", "rm-card-n", String(tema.n).padStart(2, "0")),
        elem("div", "rm-card-t", tema.titulo),
        elem("span", "rm-card-estado", existe ? ROTULO[est] : "próximamente")
      );
      grilla.append(a);
    }

    bloque.append(meta, grilla);
    cont.append(bloque);

    if (!animado && typeof Anim !== "undefined") Anim.entrada(grilla);
  }
  animado = true;

  const temas = temario.fases.flatMap(f => f.temas);
  const pct = Progreso.porcentaje(estado, temario, totales);
  document.getElementById("pct").textContent = pct;
  document.getElementById("completos").textContent =
    temas.filter(t => Progreso.estadoTema(estado, t.slug, totales[t.slug]) === "completa").length;

}

/* ── Red decorativa del hero ───────────────────────────────
   Una red de 3-5-5-2 con pulsos que la recorren de izquierda a derecha en
   bucle. Es decoración y nada más: no lleva datos y no reporta progreso. Está
   acá porque al lado del título quedaban ~600px vacíos en la página de entrada,
   que es justo donde más se nota.

   Se dibuja desde JS y no a mano en el HTML porque son 3+4+4+2 nodos y 12+16+8
   aristas: casi cincuenta elementos que se generan con dos bucles y que a mano serían
   otras tantas líneas imposibles de ajustar. Si este archivo no corre, el `<svg>`
   queda vacío y el hero es una sola columna de texto, que es un modo de falla
   perfectamente presentable. */
const CAPAS = [3, 4, 4, 2];
const RED = { ancho: 300, alto: 260, margenX: 26, margenY: 24 };

function posicionesRed() {
  const util = { x: RED.ancho - RED.margenX * 2, y: RED.alto - RED.margenY * 2 };
  return CAPAS.map((n, c) => {
    const x = RED.margenX + (util.x * c) / (CAPAS.length - 1);
    // Centrado vertical: una capa de 2 nodos queda alineada con el medio de una
    // de 5, que es lo que hace que la red se lea como un embudo y no como una
    // escalera.
    const paso = util.y / (Math.max(...CAPAS) - 1);
    const alto = paso * (n - 1);
    const y0 = RED.margenY + (util.y - alto) / 2;
    return Array.from({ length: n }, (_, i) => ({ x, y: y0 + paso * i }));
  });
}

function montarRed() {
  const svg = document.querySelector("[data-red]");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const capas = posicionesRed();
  const gA = svg.querySelector("[data-red-aristas]");
  const gN = svg.querySelector("[data-red-nodos]");
  const gP = svg.querySelector("[data-red-pulsos]");

  const caminos = [];
  for (let c = 0; c < capas.length - 1; c++) {
    for (const a of capas[c]) {
      for (const b of capas[c + 1]) {
        const l = document.createElementNS(NS, "line");
        l.setAttribute("class", "red-arista");
        l.setAttribute("x1", a.x); l.setAttribute("y1", a.y);
        l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
        gA.append(l);
        caminos.push({ capa: c, a, b });
      }
    }
  }

  for (const [c, capa] of capas.entries()) {
    for (const n of capa) {
      const p = document.createElementNS(NS, "circle");
      p.setAttribute("class", `red-nodo red-capa-${c}`);
      p.setAttribute("cx", n.x); p.setAttribute("cy", n.y);
      p.setAttribute("r", 4.5);
      gN.append(p);
    }
  }

  if (typeof gsap === "undefined" || (typeof Anim !== "undefined" && Anim.reducido())) return;

  /* Un pulso por capa, corriendo a la vez, cada uno por una arista elegida al
     azar de su tramo. Al terminar el recorrido vuelve a sortear: así el dibujo
     nunca repite el mismo camino y no hace falta una coreografía escrita. */
  for (let c = 0; c < capas.length - 1; c++) {
    const pulso = document.createElementNS(NS, "circle");
    pulso.setAttribute("class", "red-pulso");
    pulso.setAttribute("r", 3);
    /* `cx` y `cy` iniciales, aunque el tween los pise enseguida. GSAP lee el
       valor actual del atributo para armar la interpolación, y un atributo
       ausente se lee como cadena vacía: el primer frame escribía `cy=""` y el
       navegador tiraba «<circle> attribute cy: Unexpected end of attribute». */
    pulso.setAttribute("cx", capas[c][0].x);
    pulso.setAttribute("cy", capas[c][0].y);
    gP.append(pulso);

    const tramo = caminos.filter(k => k.capa === c);
    const correr = () => {
      const { a, b } = tramo[Math.floor(Math.random() * tramo.length)];
      gsap.fromTo(pulso,
        { attr: { cx: a.x, cy: a.y }, opacity: 0 },
        {
          attr: { cx: b.x, cy: b.y }, opacity: 1,
          duration: 0.9 + Math.random() * 0.5,
          ease: "power1.inOut",
          delay: c * 0.22 + Math.random() * 0.5,
          onComplete: () => { gsap.to(pulso, { opacity: 0, duration: 0.25, onComplete: correr }); }
        });
    };
    correr();
  }
}

addEventListener("DOMContentLoaded", () => {
  pintarRoadmap();
  try { montarRed(); } catch (e) { console.warn("red del hero:", e); }
  Sync.montar("#sync", CLIENT_ID);
});
addEventListener("progreso-actualizado", pintarRoadmap);
