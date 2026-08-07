/* Marca que el JS corre. Va PRIMERO y sin esperar a nada: el CSS oculta
   los .reveal solo bajo `.js`, así que si este archivo no carga o revienta
   antes de esta línea, todo el contenido queda visible en vez de invisible. */
document.documentElement.classList.add("js");

/* ── Tema ────────────────────────────────────────────────── */
const CLAVE_TEMA = "ml-tema";

function temaInicial() {
  const guardado = localStorage.getItem(CLAVE_TEMA);
  if (guardado === "claro" || guardado === "oscuro") return guardado;
  return matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "oscuro";
}

function aplicarTema(t) {
  document.documentElement.dataset.tema = t;
  const b = document.getElementById("theme-tog");
  if (b) {
    b.textContent = t === "oscuro" ? "☾" : "☀";
    b.setAttribute("aria-label", t === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  }
}

function toggleTheme() {
  const t = document.documentElement.dataset.tema === "oscuro" ? "claro" : "oscuro";
  localStorage.setItem(CLAVE_TEMA, t);
  aplicarTema(t);
}

// Se corre inmediatamente, no en DOMContentLoaded: evita el flash de tema equivocado.
aplicarTema(temaInicial());

/* ── Reveal on scroll ────────────────────────────────────── */
/* Contrato con el CSS: `.js .reveal` es lo que oculta. La clase `.js` se puso
   arriba, antes del primer pintado, para que no haya flash de contenido que
   aparece y se esconde. La contracara es que si el observer no llega a
   montarse, ese contenido queda oculto para siempre — así que cualquier
   camino de falla saca la clase y devuelve todo a visible. */
function mostrarTodo() {
  document.documentElement.classList.remove("js");
}

function montarReveal() {
  const objetivos = document.querySelectorAll(".reveal");
  if (!objetivos.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { mostrarTodo(); return; }
  if (typeof IntersectionObserver === "undefined") { mostrarTodo(); return; }

  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    }
  }, { rootMargin: "0px 0px -12% 0px" });
  objetivos.forEach(el => obs.observe(el));
}

/* ── Barra de progreso de lectura ────────────────────────── */
function montarBarra() {
  const barra = document.querySelector(".barra-progreso");
  if (!barra) return;
  const actualizar = () => {
    const alto = document.documentElement.scrollHeight - innerHeight;
    barra.style.width = alto > 0 ? `${Math.min(100, (scrollY / alto) * 100)}%` : "0%";
  };
  addEventListener("scroll", actualizar, { passive: true });
  addEventListener("resize", actualizar);
  actualizar();
}

/* ── Año del pie ─────────────────────────────────────────── */
function montarAnio() {
  document.querySelectorAll("[data-anio]").forEach(el => { el.textContent = new Date().getFullYear(); });
}

/* montarReveal va PRIMERO y aislado: es el único que puede dejar la página
   en blanco si falla. Si reventara un montador anterior, este nunca correría
   y el contenido quedaría oculto. Cada uno en su propio try/catch para que
   un error en la barra de progreso no se lleve puesto al resto. */
addEventListener("DOMContentLoaded", () => {
  try { montarReveal(); } catch (e) { mostrarTodo(); console.warn("reveal:", e); }
  for (const montar of [() => aplicarTema(document.documentElement.dataset.tema || temaInicial()), montarBarra, montarAnio]) {
    try { montar(); } catch (e) { console.warn("montaje:", e); }
  }
});
