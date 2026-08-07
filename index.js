const CLIENT_ID = "REEMPLAZAR_CON_EL_CLIENT_ID.apps.googleusercontent.com";

/* Cuántos ejercicios corregibles tiene cada tema. Se completa a medida
   que se escriben los temas; un tema ausente NO va acá — se pasa `undefined`
   a Progreso.estadoTema, que lo lee como "tema sin escribir" (ver progreso.js). */
const EJERCICIOS_POR_TEMA = {
  "regresion-lineal": 5
};

async function pintarRoadmap() {
  const temario = await fetch("data/temario.json").then(r => r.json());
  const estado = Progreso.leer();
  const cont = document.getElementById("roadmap");
  cont.replaceChildren();

  for (const fase of temario.fases) {
    const bloque = document.createElement("div");
    bloque.className = `rm-phase fase-${fase.n}`;

    const meta = document.createElement("div");
    meta.className = "rm-phase-meta";
    meta.innerHTML = `
      <div class="rm-phase-n">${String(fase.n).padStart(2, "0")}</div>
      <h2>${fase.nombre}</h2>
      <p class="rm-phase-hint">${fase.hint}</p>`;

    const grilla = document.createElement("div");
    grilla.className = "rm-cards";

    for (const tema of fase.temas) {
      const total = EJERCICIOS_POR_TEMA[tema.slug];
      const est = Progreso.estadoTema(estado, tema.slug, total);
      const existe = tema.escrito === true;

      const a = document.createElement("a");
      a.className = `rm-card ${est === "completa" ? "completa" : est === "en-progreso" ? "en-progreso" : ""}`;
      a.href = tema.archivo;
      if (!existe) { a.classList.add("proximamente"); a.removeAttribute("href"); }
      a.innerHTML = `
        <div class="rm-card-n">${String(tema.n).padStart(2, "0")}</div>
        <div class="rm-card-t">${tema.titulo}</div>
        <span class="rm-card-estado">${
          !existe ? "próximamente" :
          est === "completa" ? "✓ completo" :
          est === "en-progreso" ? "en progreso" : "sin empezar"
        }</span>`;
      grilla.append(a);
    }

    bloque.append(meta, grilla);
    cont.append(bloque);
  }

  const pct = Progreso.porcentaje(estado, temario, EJERCICIOS_POR_TEMA);
  document.getElementById("pct").textContent = pct;
  document.getElementById("completos").textContent =
    temario.fases.flatMap(f => f.temas)
      .filter(t => Progreso.estadoTema(estado, t.slug, EJERCICIOS_POR_TEMA[t.slug]) === "completa").length;
}

addEventListener("DOMContentLoaded", () => {
  pintarRoadmap();
  Sync.montar("#sync", CLIENT_ID);
});
addEventListener("progreso-actualizado", pintarRoadmap);
