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
  document.getElementById("pct").textContent = Progreso.porcentaje(estado, temario, totales);
  document.getElementById("completos").textContent =
    temas.filter(t => Progreso.estadoTema(estado, t.slug, totales[t.slug]) === "completa").length;
}

addEventListener("DOMContentLoaded", () => {
  pintarRoadmap();
  Sync.montar("#sync", CLIENT_ID);
});
addEventListener("progreso-actualizado", pintarRoadmap);
