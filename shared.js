/* Marca que el JS corre. Va PRIMERO y sin esperar a nada: el CSS oculta
   los .reveal solo bajo `.js`, así que si este archivo no carga o revienta
   antes de esta línea, todo el contenido queda visible en vez de invisible. */
document.documentElement.classList.add("js");

/* El tema claro y su toggle se eliminaron en el rediseño: gsap.com es de un
   solo canvas y su propio doc de estilo prohíbe romper el par crema sobre
   negro. Si alguna vez vuelve, vuelve con su fila en `contraste.js`. */

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

/* ── Navegación entre conceptos ──────────────────────────── */
/* Se arma desde data/temario.json, que es la única fuente de verdad de qué
   temas están escritos (campo `escrito`). Así las 24 páginas comparten un
   solo mecanismo y ninguna enlaza a un archivo inexistente.

   El tema actual se deduce del nombre de archivo, no se pasa por parámetro.
   Antes cada página llamaba a esto con su slug escrito a mano: si un tema se
   lo olvidaba, quedaba un bloque vacío de ~6rem con una línea arriba y ningún
   error. Con 23 temas por escribir eran 23 oportunidades de que pasara. */
async function montarConceptNav() {
  const cont = document.querySelector(".concept-nav");
  if (!cont) return;
  const archivo = location.pathname.split("/").pop() || "";
  let temario;
  try {
    temario = await fetch("data/temario.json").then(r => r.json());
  } catch {
    return; // sin datos no se toca nada: mejor vacío que roto
  }
  const temas = temario.fases.flatMap(f => f.temas);
  const i = temas.findIndex(t => t.archivo === archivo);
  if (i < 0) return;

  cont.replaceChildren();
  for (const [tema, rotulo, clase] of [
    [temas[i - 1], "← Anterior", ""],
    [temas[i + 1], "Siguiente →", "cn-next"]
  ]) {
    if (!tema) continue;
    const escrito = tema.escrito === true;
    const el = document.createElement(escrito ? "a" : "span");
    el.className = `${clase}${escrito ? "" : " cn-pronto"}`.trim();
    if (escrito) el.href = tema.archivo;
    const dir = document.createElement("span");
    dir.className = "cn-dir";
    dir.textContent = escrito ? rotulo : `${rotulo} · próximamente`;
    const tit = document.createElement("span");
    tit.className = "cn-t";
    tit.textContent = tema.titulo;
    el.append(dir, tit);
    cont.append(el);
  }
}

/* ── Año del pie ─────────────────────────────────────────── */
function montarAnio() {
  document.querySelectorAll("[data-anio]").forEach(el => { el.textContent = new Date().getFullYear(); });
}

/* ── Matemática (KaTeX) ──────────────────────────────────── */
/* El contrato es `data-tex`: el elemento lleva la notación en LaTeX en el
   atributo y, como contenido, la misma expresión en Unicode plano.

     <span class="mate" data-tex="R^2">R²</span>

   Es al revés de lo que hace todo el mundo (poner `$...$` en el texto y dejar
   que un auto-render lo encuentre), y es a propósito. Con delimitadores, si el
   CDN de KaTeX no responde el lector se come `$$\beta_1 = \frac{\sum...}{}$$`
   crudo en la pantalla — o sea, la fórmula deja de ser legible justo cuando ya
   no hay nada que la arregle. Con `data-tex`, esa misma falla deja exactamente
   lo que la página mostraba antes de existir KaTeX: el Unicode. El principio 4
   de PRODUCT.md pide que todo camino de falla vuelva a legible, y una fórmula
   ilegible es la peor manera de romperlo en un sitio de matemática.
   De paso ahorra la extensión `auto-render` (~30 KB) y el escaneo de delimi-
   tadores sobre todo el DOM: acá ya sabemos qué nodos son fórmulas. */
const KATEX_CDN = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/";

function cargarKatex() {
  // El <link> va acá y no en un @import de shared.css: el @import encadena las
  // descargas (shared.css primero, katex.css recién después) y retrasa el
  // primer pintado de las 27 páginas por una hoja que solo necesitan 13.
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = KATEX_CDN + "katex.min.css";
  document.head.append(l);

  return new Promise((ok, err) => {
    const s = document.createElement("script");
    s.src = KATEX_CDN + "katex.min.js";
    s.defer = true;
    s.onload = ok;
    s.onerror = () => err(new Error("no se pudo cargar KaTeX"));
    document.head.append(s);
  });
}

async function montarMates() {
  const nodos = document.querySelectorAll("[data-tex]");
  if (!nodos.length) return;   // el índice y el roadmap no tienen fórmulas

  await cargarKatex();

  for (const el of nodos) {
    // `renderToString` y no `render`: `render` vacía el elemento ANTES de
    // componer, así que un LaTeX mal escrito borraría el Unicode de respaldo y
    // dejaría el hueco. Componiendo a string primero, el DOM se toca solo si
    // salió bien. El `innerHTML` es seguro: el LaTeX lo escribimos nosotros en
    // el HTML, no viene de ninguna entrada de usuario.
    try {
      el.innerHTML = katex.renderToString(el.dataset.tex, {
        displayMode: el.classList.contains("formula"),
        throwOnError: true,
        strict: false
      });
    } catch (e) {
      console.warn("fórmula no compuesta, queda el Unicode:", el.dataset.tex, e.message);
    }
  }

  // Las fórmulas compuestas no miden lo mismo que el Unicode que reemplazaron,
  // así que todo lo que esté más abajo se corrió de lugar. Sin este refresh los
  // ScrollTrigger de los diagramas disparan en el punto viejo.
  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

/* El listener se registra ANTES que cualquier otro trabajo de nivel superior.
   Si una línea posterior tirara una excepción, el script se abortaría y este
   listener nunca existiría — y sin él nadie sacaría la clase `js`, dejando
   todo el contenido oculto. Registrarlo primero hace que el salvavidas del
   reveal sea lo único que no puede perderse.

   montarReveal va PRIMERO y aislado dentro del listener: es el único que
   puede dejar la página en blanco si falla. Cada montador va en su propio
   try/catch para que un error en la barra de progreso no se lleve puesto
   al resto. */
addEventListener("DOMContentLoaded", () => {
  try { montarReveal(); } catch (e) { mostrarTodo(); console.warn("reveal:", e); }
  for (const montar of [montarBarra, montarAnio, montarConceptNav]) {
    try { montar(); } catch (e) { console.warn("montaje:", e); }
  }
  // Va aparte: es el único asíncrono, y un rechazo suyo (CDN caído, sin red) no
  // debe quedar como "unhandled rejection". El catch alcanza porque el fallback
  // no es código, es el Unicode que ya está en el HTML.
  montarMates().catch(e => console.warn("matemática:", e.message));
});
