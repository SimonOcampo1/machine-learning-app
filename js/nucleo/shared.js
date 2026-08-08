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
  /* `vercel.json` tiene `cleanUrls: true`, así que en producción la URL de un
     tema es `/concept-11-regularizacion`, SIN la extensión — el servidor
     redirige desde el `.html`. El temario, en cambio, guarda el nombre de
     archivo con extensión. Sin reponerla acá la búsqueda no encontraba nada y
     el bloque de navegación entre temas quedaba vacío en las 24 páginas: se
     veían dos filetes con 260px de nada entre medio al pie de cada tema.
     En local con `file://` o con un servidor sin cleanUrls la URL sí trae el
     `.html`, y por eso el bug no aparecía al desarrollar. */
  const nombre = location.pathname.split("/").pop() || "";
  const archivo = nombre.endsWith(".html") ? nombre : `${nombre}.html`;
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

/* ── Notación suelta en texto generado por JS ─────────────
   Las 27 páginas tienen su notación envuelta en `data-tex` desde el HTML. Pero
   los enunciados de los ejercicios NO viven en el HTML: son strings dentro de
   `js/temas/*.js` que `ejercicios.js` inserta con `textContent`. Sin esto, un
   enunciado que dice "¿cuánto vale la pendiente β₁?" quedaba en Unicode al lado
   de una fórmula compuesta por KaTeX, con dos tipografías distintas para la
   misma letra en la misma pantalla.
   La tabla es la misma que se usó para convertir el HTML. Lo que NO está acá es
   deliberado: `m²` es metros cuadrados —una unidad, que en LaTeX va en redonda
   y no en itálica matemática—, y `3×3` o `85×1200` son aritmética de la prosa. */
const TERMINOS_MATE = {
  "β₁x̄": "\\beta_1\\bar{x}", "β₁x₁": "\\beta_1 x_1", "β₂x₂": "\\beta_2 x_2",
  "β₃x₃": "\\beta_3 x_3", "w₁x₁": "w_1 x_1", "w₂x₂": "w_2 x_2", "wₙxₙ": "w_n x_n",
  "ŷᵢ": "\\hat{y}_i", "∇J": "\\nabla J", "pᵢ²": "p_i^2",
  "v₁²": "v_1^2", "v₂²": "v_2^2", "vₙ²": "v_n^2",
  "β₀": "\\beta_0", "β₁": "\\beta_1", "β₂": "\\beta_2", "β₃": "\\beta_3",
  "w₁": "w_1", "w₂": "w_2", "wₙ": "w_n", "x₁": "x_1", "x₂": "x_2",
  "xᵢ": "x_i", "yᵢ": "y_i", "x̄": "\\bar{x}", "ȳ": "\\bar{y}", "ŷ": "\\hat{y}",
  "R²": "R^2", "β": "\\beta", "α": "\\alpha", "σ": "\\sigma",
  "Σ": "\\sum", "∝": "\\propto", "≈": "\\approx", "∇": "\\nabla"
};

// Más largo primero: sin esto `β` se comería el prefijo de `β₀` y dejaría un
// `\beta` seguido de un `₀` huérfano.
const _ALTERNATIVA_MATE = Object.keys(TERMINOS_MATE)
  .sort((a, b) => b.length - a.length)
  .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

/* DOS expresiones para el mismo patrón, y no es redundancia. `test()` sobre una
   regex con flag `g` es stateful: adelanta `lastIndex` en cada llamada y la
   siguiente arranca desde ahí, así que llamada en un bucle devuelve false para
   nodos que sí tienen notación. El filtro del TreeWalker es exactamente ese
   bucle. La versión sin `g` es para preguntar; la de `g`, para recorrer. */
const RE_MATE_HAY = new RegExp(`(${_ALTERNATIVA_MATE})`);
const RE_MATE = new RegExp(`(${_ALTERNATIVA_MATE})`, "g");

const LETRA_MATE = /[0-9A-Za-zÀ-ÿ]/;
// Donde el contenido ES código o ya es matemática compuesta, no se toca.
const INTOCABLE = "code, pre, textarea, script, style, svg, .katex, [data-tex]";

function envolverMate(raiz) {
  const paseador = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentElement && !n.parentElement.closest(INTOCABLE) && RE_MATE_HAY.test(n.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
  });

  // Se juntan primero y se reemplazan después: mutar el árbol mientras el
  // TreeWalker lo recorre le hace saltear nodos.
  const textos = [];
  for (let n = paseador.nextNode(); n; n = paseador.nextNode()) textos.push(n);

  for (const nodoTexto of textos) {
    const frag = document.createDocumentFragment();
    let ultimo = 0;
    const cadena = nodoTexto.nodeValue;
    for (const m of cadena.matchAll(RE_MATE)) {
      const antes = cadena[m.index - 1] || "";
      const despues = cadena[m.index + m[0].length] || "";
      // Pegado a una letra o dígito no es notación, es parte de una palabra.
      if (LETRA_MATE.test(antes) || LETRA_MATE.test(despues)) continue;
      frag.append(cadena.slice(ultimo, m.index));
      const span = document.createElement("span");
      span.className = "mate";
      span.dataset.tex = TERMINOS_MATE[m[0]];
      span.textContent = m[0];
      frag.append(span);
      ultimo = m.index + m[0].length;
    }
    if (!ultimo) continue;
    frag.append(cadena.slice(ultimo));
    nodoTexto.replaceWith(frag);
  }
}

/* Componer es idempotente: se saltea lo que ya tiene KaTeX adentro. Eso es lo
   que permite volver a llamarla cada vez que aparece contenido nuevo (los
   ejercicios se montan después del DOMContentLoaded) sin recomponer las 90
   fórmulas de la página. */
async function montarMates(raiz = document.body) {
  const nodos = [...raiz.querySelectorAll("[data-tex]")].filter(el => !el.querySelector(".katex"));
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
