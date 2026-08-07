const Ejercicios = (() => {

  /* ── Correctores puros ────────────────────────────────── */

  function corregirMcq(def, elegida) {
    const ok = elegida === def.c;
    return {
      ok,
      puntaje: ok ? 100 : 0,
      msg: ok ? def.expl : `La correcta era «${def.opts[def.c]}». ${def.expl}`
    };
  }

  function corregirNum(def, valor) {
    if (typeof valor !== "number" || !Number.isFinite(valor)) {
      return { ok: false, puntaje: 0, msg: "Eso no es un número. Revisá lo que escribiste." };
    }
    // Tolerancia relativa, con piso absoluto para que funcione cerca de cero.
    const margen = Math.max(Math.abs(def.resp) * def.tol, def.tol);
    if (Math.abs(valor - def.resp) <= margen) {
      return { ok: true, puntaje: 100, msg: def.expl };
    }
    for (const t of def.trampas || []) {
      const margenT = Math.max(Math.abs(t.val) * def.tol, def.tol);
      if (Math.abs(valor - t.val) <= margenT) {
        return { ok: false, puntaje: 0, msg: t.msg };
      }
    }
    return { ok: false, puntaje: 0, msg: `No es. La respuesta es ${def.resp}. ${def.expl}` };
  }

  function corregir(def, respuesta) {
    switch (def.tipo) {
      case "mcq": return corregirMcq(def, respuesta);
      case "num": return corregirNum(def, respuesta);
      default: throw new Error(`tipo de ejercicio desconocido: ${def.tipo}`);
    }
  }

  /* ── Renderizado ──────────────────────────────────────── */

  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function pintarResultado(caja, res) {
    caja.className = `ej-fb ${res.ok ? "ok" : "no"}`;
    caja.textContent = res.msg;
    caja.hidden = false;
    dispatchEvent(new CustomEvent("ejercicio-respondido"));
  }

  function montarMcq(def, slug) {
    const raiz = nodo("div", "ej ej-mcq");
    raiz.append(nodo("p", "ej-q", def.q));
    const lista = nodo("div", "ej-opts");
    const fb = nodo("div", "ej-fb");
    fb.hidden = true;
    let respondido = false;

    def.opts.forEach((texto, i) => {
      const b = nodo("button", "ej-opt", texto);
      b.type = "button";
      b.addEventListener("click", () => {
        if (respondido) return;
        respondido = true;
        const res = corregirMcq(def, i);
        b.classList.add(res.ok ? "ok" : "no");
        if (!res.ok) lista.children[def.c].classList.add("ok");
        lista.querySelectorAll(".ej-opt").forEach(x => { x.disabled = true; });
        pintarResultado(fb, res);
        Progreso.registrar(slug, def.id, res.puntaje);
      });
      lista.append(b);
    });

    raiz.append(lista, fb);
    return raiz;
  }

  function montarNum(def, slug) {
    const raiz = nodo("div", "ej ej-num");
    raiz.append(nodo("p", "ej-q", def.q));

    const fila = nodo("div", "ej-fila");
    const input = nodo("input", "ej-input");
    input.type = "number";
    input.step = "any";
    input.setAttribute("aria-label", "Tu respuesta");
    if (def.unidad) input.setAttribute("aria-describedby", `${def.id}-u`);

    const boton = nodo("button", "ej-enviar", "Comprobar");
    boton.type = "button";
    const fb = nodo("div", "ej-fb");
    fb.hidden = true;

    const enviar = () => {
      const res = corregirNum(def, input.valueAsNumber);
      pintarResultado(fb, res);
      Progreso.registrar(slug, def.id, res.puntaje);
    };
    boton.addEventListener("click", enviar);
    input.addEventListener("keydown", e => { if (e.key === "Enter") enviar(); });

    fila.append(input);
    if (def.unidad) {
      const u = nodo("span", "ej-unidad", def.unidad);
      u.id = `${def.id}-u`;
      fila.append(u);
    }
    fila.append(boton);
    raiz.append(fila, fb);
    return raiz;
  }

  const constructores = { mcq: montarMcq, num: montarNum };

  function montar(contenedor, defs, slug) {
    const raiz = typeof contenedor === "string" ? document.querySelector(contenedor) : contenedor;
    if (!raiz) throw new Error(`contenedor no encontrado: ${contenedor}`);
    const vistos = new Set();
    for (const def of defs) {
      if (vistos.has(def.id)) throw new Error(`id de ejercicio duplicado: ${def.id}`);
      vistos.add(def.id);
      const c = constructores[def.tipo];
      if (!c) throw new Error(`tipo de ejercicio sin constructor: ${def.tipo}`);
      raiz.append(c(def, slug));
    }
    vigilarQuiz(defs, slug);
  }

  /* El "quiz" de un tema son sus preguntas conceptuales. Cuando todas
     fueron respondidas, el tema queda apto para contar como completo.
     Sin esto, `quiz` nunca se pone en true y ningún tema llega a "completa". */
  function vigilarQuiz(defs, slug) {
    const ids = defs.filter(d => d.tipo === "mcq").map(d => d.id);
    if (!ids.length) { Progreso.marcarQuiz(slug); return; }
    const revisar = () => {
      const t = Progreso.leer().temas[slug];
      if (t && ids.every(id => id in (t.ejercicios || {}))) {
        Progreso.marcarQuiz(slug);
        removeEventListener("ejercicio-respondido", revisar);
      }
    };
    addEventListener("ejercicio-respondido", revisar);
  }

  return { corregir, montar };
})();

if (typeof module !== "undefined") module.exports = Ejercicios;
