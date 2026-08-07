const Progreso = (() => {
  const CLAVE = "ml-progreso";

  const vacio = () => ({ v: 1, actualizado: new Date().toISOString(), temas: {} });

  const temaVacio = () => ({ leido: false, quiz: false, ejercicios: {} });

  function leer() {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return vacio();
      const e = JSON.parse(crudo);
      if (!e || typeof e !== "object" || !e.temas) return vacio();
      return e;
    } catch {
      // JSON corrupto: mejor arrancar limpio que romper toda la página.
      return vacio();
    }
  }

  function guardar(estado) {
    estado.actualizado = new Date().toISOString();
    localStorage.setItem(CLAVE, JSON.stringify(estado));
    if (typeof Sync !== "undefined") Sync.encolar(estado);
    return estado;
  }

  function mutar(slug, fn) {
    const e = leer();
    e.temas[slug] = { ...temaVacio(), ...(e.temas[slug] || {}) };
    fn(e.temas[slug]);
    return guardar(e);
  }

  const marcarLeido = (slug) => mutar(slug, t => { t.leido = true; });
  const marcarQuiz  = (slug) => mutar(slug, t => { t.quiz = true; });
  const registrar   = (slug, id, puntaje) =>
    mutar(slug, t => { t.ejercicios[id] = Math.max(t.ejercicios[id] || 0, puntaje); });

  /* Fusión monótona: nada se pierde nunca. Conmutativa e idempotente. */
  function fusionar(a, b) {
    const ta = (a && a.temas) || {};
    const tb = (b && b.temas) || {};
    const salida = { v: 1, actualizado: new Date().toISOString(), temas: {} };

    for (const slug of new Set([...Object.keys(ta), ...Object.keys(tb)])) {
      const x = ta[slug] || {};
      const y = tb[slug] || {};
      const ejercicios = {};
      const ex = x.ejercicios || {};
      const ey = y.ejercicios || {};
      for (const id of new Set([...Object.keys(ex), ...Object.keys(ey)])) {
        ejercicios[id] = Math.max(ex[id] || 0, ey[id] || 0);
      }
      salida.temas[slug] = {
        leido: Boolean(x.leido || y.leido),
        quiz: Boolean(x.quiz || y.quiz),
        ejercicios
      };
    }
    return salida;
  }

  function estadoTema(estado, slug, totalEjercicios) {
    const t = (estado && estado.temas && estado.temas[slug]) || null;
    if (!t) return "sin-empezar";
    const resueltos = Object.values(t.ejercicios || {}).filter(p => p > 0).length;
    if (!t.leido && !t.quiz && resueltos === 0) return "sin-empezar";
    if (t.leido && t.quiz && resueltos >= totalEjercicios) return "completa";
    return "en-progreso";
  }

  function porcentaje(estado, temario, totalesPorSlug) {
    const temas = temario.fases.flatMap(f => f.temas);
    if (!temas.length) return 0;
    const completos = temas.filter(
      t => estadoTema(estado, t.slug, totalesPorSlug[t.slug] || 0) === "completa"
    ).length;
    return Math.round((completos / temas.length) * 100);
  }

  return { vacio, leer, guardar, marcarLeido, marcarQuiz, registrar, fusionar, estadoTema, porcentaje };
})();

if (typeof module !== "undefined") module.exports = Progreso;
