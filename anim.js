/* Requiere: gsap, ScrollTrigger, DrawSVGPlugin ya cargados. */
const Anim = (() => {
  const listo = typeof gsap !== "undefined";
  if (listo) gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

  const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Traza los caminos del diagrama al entrar en viewport.
     Con movimiento reducido, los deja dibujados al 100% de una. */
  function dibujar(sel, { duracion = 1.1, escalonado = 0.12 } = {}) {
    if (!listo) return null;
    const trazos = gsap.utils.toArray(`${sel} .dedge`);
    if (!trazos.length) return null;
    if (reducido()) { gsap.set(trazos, { drawSVG: "100%" }); return null; }
    gsap.set(trazos, { drawSVG: "0%" });
    return gsap.to(trazos, {
      drawSVG: "100%", duration: duracion, stagger: escalonado, ease: "power2.out",
      scrollTrigger: { trigger: sel, start: "top 78%", once: true }
    });
  }

  function aparecer(sel, { duracion = 0.5, escalonado = 0.08 } = {}) {
    if (!listo) return null;
    const nodos = gsap.utils.toArray(`${sel} .dnode-bg, ${sel} .dnode-solid`);
    if (!nodos.length) return null;
    if (reducido()) { gsap.set(nodos, { scale: 1, opacity: 1 }); return null; }
    return gsap.from(nodos, {
      scale: 0, opacity: 0, transformOrigin: "center", duration: duracion,
      stagger: escalonado, ease: "back.out(1.7)",
      scrollTrigger: { trigger: sel, start: "top 78%", once: true }
    });
  }

  /* Secuencia fijada: la sección se queda quieta mientras el scroll
     avanza el diagrama paso a paso. Es el recurso caro; usar poco. */
  function secuencia(sel, pasos) {
    if (!listo) return null;
    if (reducido() || innerWidth < 760) {
      // Estado final legible, sin pin. En móvil el pin es más molesto que útil.
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

  /* Botón de reproducir/rebobinar para diagramas que no van atados al scroll. */
  function controles(sel, tl) {
    const cont = document.querySelector(sel);
    if (!cont || !tl) return;
    const b = document.createElement("button");
    b.className = "diag-ctrl";
    b.type = "button";
    b.textContent = "↻ Repetir";
    b.addEventListener("click", () => { tl.restart(); });
    cont.appendChild(b);
  }

  return { reducido, dibujar, aparecer, secuencia, controles };
})();

if (typeof module !== "undefined") module.exports = Anim;
