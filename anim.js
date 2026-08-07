/* Motor de movimiento. Requiere gsap, ScrollTrigger, DrawSVGPlugin y Lenis
   cargados por CDN antes que este archivo.

   El lenguaje viene de DESIGN.md: ease-out exponencial, sin bounce ni elastic,
   escalonado legible como microtransición firma. */
const Anim = (() => {
  /* Los cuatro se chequean por separado y a mano. Un <script> que falla no
     impide que sus hermanos corran, así que gsap puede existir y un plugin no.
     Nombrar un identificador inexistente tira ReferenceError acá mismo, y eso
     abortaría este IIFE: `Anim` quedaría sin definir y cualquier script
     posterior que lo use moriría con él, incluidos los ejercicios. */
  const hayGsap = typeof gsap !== "undefined";
  const hayST = hayGsap && typeof ScrollTrigger !== "undefined";
  const hayDraw = hayGsap && typeof DrawSVGPlugin !== "undefined";
  const hayLenis = typeof Lenis !== "undefined";

  if (hayST) gsap.registerPlugin(ScrollTrigger);
  if (hayDraw) gsap.registerPlugin(DrawSVGPlugin);

  const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Scroll suave ────────────────────────────────────────────────────── */
  let lenis = null;

  function montarLenis() {
    /* Con movimiento reducido no se instancia nada: el scroll nativo, con sus
       saltos instantáneos, es justamente lo que corresponde. No es un apagado
       parcial, es el otro camino. */
    if (!hayLenis || reducido()) return null;

    lenis = new Lenis({ lerp: 0.08 });

    /* Sin este par, ScrollTrigger sigue leyendo la posición nativa mientras
       Lenis interpola la suya, y los diagramas disparan en el punto
       equivocado. `lagSmoothing(0)` evita que gsap "salte" frames tras una
       pausa larga y descoordine las dos posiciones. */
    if (hayST) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      // Sin gsap, Lenis maneja su propio frame loop.
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    montarParcheScrollbar();
    montarAnclas();
    return lenis;
  }

  /* Parche de la barra de scroll del sistema operativo.

     Si el usuario agarra y arrastra la barra nativa, el navegador saltea los
     eventos del DOM: el SO fuerza la coordenada de scroll y el tween de Lenis
     la devuelve a su valor interpolado en el mismo frame. Esa pelea por frame
     es el stutter.

     `document.documentElement.clientWidth` mide el ancho del contenido SIN la
     barra, así que un `pointerdown` con clientX mayor cayó sobre la barra.
     Ahí se apaga el motor y el arrastre corre 100% nativo; al soltar, Lenis
     rearranca desde la coordenada que eligió el usuario. */
  function montarParcheScrollbar() {
    document.addEventListener("pointerdown", (e) => {
      if (e.clientX > document.documentElement.clientWidth) lenis.stop();
    });
    document.addEventListener("pointerup", () => lenis.start());
  }

  /* Con Lenis activo, un href="#x" salta de golpe: el navegador mueve la
     posición nativa y Lenis la interpola de vuelta. Hay que pedírselo a él. */
  function montarAnclas() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const destino = document.querySelector(id);
      if (!destino) return;
      e.preventDefault();
      lenis.scrollTo(destino, { offset: -80 });
    });
  }

  /* ── Diagramas ───────────────────────────────────────────────────────── */

  /* Traza los caminos del diagrama al entrar en viewport.
     Con movimiento reducido, los deja dibujados al 100% de una. */
  function dibujar(sel, { duracion = 1.2, escalonado = 0.1 } = {}) {
    if (!hayDraw || !hayST) return null;
    const trazos = gsap.utils.toArray(`${sel} .dedge`);
    if (!trazos.length) return null;
    if (reducido()) { gsap.set(trazos, { drawSVG: "100%" }); return null; }
    gsap.set(trazos, { drawSVG: "0%" });
    return gsap.to(trazos, {
      drawSVG: "100%", duration: duracion, stagger: escalonado, ease: "power2.out",
      scrollTrigger: { trigger: sel, start: "top 78%", once: true }
    });
  }

  function aparecer(sel, { duracion = 0.6, escalonado = 0.06 } = {}) {
    if (!hayST) return null;
    const nodos = gsap.utils.toArray(`${sel} .dnode-bg, ${sel} .dnode-solid`);
    if (!nodos.length) return null;
    if (reducido()) { gsap.set(nodos, { scale: 1, opacity: 1 }); return null; }
    /* `expo.out` y no `back.out`: el rebote no pertenece a este tono y está
       prohibido por el sistema. La energía la da el escalonado. */
    return gsap.from(nodos, {
      scale: 0.6, opacity: 0, transformOrigin: "center", duration: duracion,
      stagger: escalonado, ease: "expo.out",
      scrollTrigger: { trigger: sel, start: "top 78%", once: true }
    });
  }

  /* Secuencia fijada: la sección se queda quieta mientras el scroll avanza el
     diagrama paso a paso. Es el recurso caro; usar poco. */
  function secuencia(sel, pasos) {
    if (!hayST) return null;
    if (reducido() || innerWidth < 760) {
      // Estado final legible, sin pin. En móvil el pin molesta más de lo que suma.
      for (const p of pasos) gsap.set(p.el, p.hasta);
      return null;
    }
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sel, start: "top top", end: `+=${pasos.length * 420}`,
        pin: true, scrub: 0.6, anticipatePin: 1
      }
    });
    for (const p of pasos) tl.fromTo(p.el, p.desde, { ...p.hasta, duration: 1 });
    return tl;
  }

  /* ── Microtransiciones ───────────────────────────────────────────────── */

  /* Entrada escalonada de los hijos de un contenedor, al entrar en viewport.
     La usa el roadmap después de pintarse, que es cuando sus tarjetas existen:
     por eso recibe el contenedor y no se auto-monta.

     Acepta un Element, no solo un selector, y el motivo importa: el roadmap
     tiene seis contenedores `.rm-cards`, uno por fase. Con un string, el
     `trigger` de ScrollTrigger resuelve al PRIMERO nomás, y las 24 tarjetas
     entrarían todas juntas cuando asoma la fase 0. */
  function entrada(objetivo, { escalonado = 0.06, y = 20 } = {}) {
    if (!hayST) return null;
    const cont = typeof objetivo === "string" ? document.querySelector(objetivo) : objetivo;
    if (!cont) return null;
    const hijos = [...cont.children];
    if (!hijos.length) return null;
    if (reducido()) { gsap.set(hijos, { opacity: 1, y: 0 }); return null; }
    return gsap.from(hijos, {
      opacity: 0, y, duration: 0.7, stagger: escalonado, ease: "expo.out",
      scrollTrigger: { trigger: cont, start: "top 85%", once: true }
    });
  }

  /* Entrada del hero al cargar. Es lo único que corre sin esperar al scroll:
     una sola coreografía de carga, escalonada, y después el sitio se queda
     quieto hasta que el usuario se mueve. */
  function hero(sel = ".hero, .hero-c") {
    if (!hayGsap || reducido()) return null;
    const cont = document.querySelector(sel);
    if (!cont) return null;
    const partes = cont.querySelectorAll(":scope > *");
    if (!partes.length) return null;
    return gsap.from(partes, {
      opacity: 0, y: 28, duration: 0.9, stagger: 0.07, ease: "expo.out"
    });
  }

  return { reducido, montarLenis, dibujar, aparecer, secuencia, entrada, hero, lenis: () => lenis };
})();

/* Auto-montaje de lo que no depende de contenido inyectado. El resto lo llama
   el JS de cada página cuando ya pintó lo suyo.

   Corre acá y no en DOMContentLoaded a propósito: este archivo se carga al
   final del <body>, el hero ya existe, y esperar al evento agrega un frame en
   el que el hero se ve antes de que `gsap.from` lo mande a opacidad 0 — o sea,
   un parpadeo. El hero nunca se oculta desde el CSS: si gsap no carga, se ve
   quieto, que es el modo de falla correcto. */
if (typeof document !== "undefined") {
  try { Anim.montarLenis(); } catch (e) { console.warn("lenis:", e); }
  try { Anim.hero(); } catch (e) { console.warn("hero:", e); }
}

if (typeof module !== "undefined") module.exports = Anim;
