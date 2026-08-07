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

  function corregirParsons(def, dispuestas) {
    const esperadas = def.lineas;
    const n = esperadas.length;

    if (!Array.isArray(dispuestas) || dispuestas.length !== n) {
      return {
        ok: false, puntaje: 0,
        msg: `El algoritmo tiene ${n} líneas y pusiste ${Array.isArray(dispuestas) ? dispuestas.length : 0}.`
      };
    }

    let correctas = 0;
    let soloIndent = false;
    for (let i = 0; i < n; i++) {
      if (dispuestas[i] === esperadas[i]) { correctas++; continue; }
      if (dispuestas[i].trim() === esperadas[i].trim()) soloIndent = true;
    }

    if (correctas === n) return { ok: true, puntaje: 100, msg: def.expl };

    const puntaje = Math.round((correctas / n) * 100);
    const pista = soloIndent
      ? "Alguna línea tiene la indentación equivocada: en Python la sangría define qué está adentro del bucle."
      : "El orden no es el correcto todavía.";
    return { ok: false, puntaje, msg: `${correctas} de ${n} líneas en su lugar. ${pista}` };
  }

  function corregir(def, respuesta) {
    switch (def.tipo) {
      case "mcq": return corregirMcq(def, respuesta);
      case "num": return corregirNum(def, respuesta);
      case "parsons": return corregirParsons(def, respuesta);
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

  /* OJO con el orden: este dispatch es SÍNCRONO, así que `vigilarQuiz` lee el
     progreso en el acto. Por eso `Progreso.registrar` va SIEMPRE antes de
     llamar a esta función: si se invirtiera, al responder la última conceptual
     el listener leería un estado que todavía no la incluye, no marcaría el
     quiz, y como el MCQ se bloquea tras un clic no habría segunda oportunidad.
     El tema nunca llegaría a "completo". */
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
        Progreso.registrar(slug, def.id, res.puntaje);
        pintarResultado(fb, res);
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
      Progreso.registrar(slug, def.id, res.puntaje);
      pintarResultado(fb, res);
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

  function montarParsons(def, slug) {
    const raiz = nodo("div", "ej ej-parsons");
    raiz.append(nodo("p", "ej-q", def.q));

    const lista = nodo("ol", "pa-lista");
    lista.setAttribute("aria-label", "Líneas de código: arrastralas o usá los botones para ordenarlas");

    // Mezcla determinística por id: la misma página da siempre el mismo desorden.
    const pool = mezclar([...def.lineas, ...(def.distractores || [])], def.id, def.lineas);

    for (const texto of pool) lista.append(itemParsons(texto, lista));

    lista.addEventListener("dragover", (e) => {
      e.preventDefault();
      const arrastrando = lista.querySelector(".arrastrando");
      if (!arrastrando) return;
      const hermanos = [...lista.querySelectorAll(".pa-item:not(.arrastrando)")];
      const siguiente = hermanos.find(li => e.clientY < li.getBoundingClientRect().top + li.offsetHeight / 2);
      lista.insertBefore(arrastrando, siguiente || null);
    });

    const boton = nodo("button", "ej-enviar", "Comprobar");
    boton.type = "button";
    const fb = nodo("div", "ej-fb");
    fb.hidden = true;

    boton.addEventListener("click", () => {
      const puestas = [...lista.querySelectorAll(".pa-item")]
        .filter(li => !li.classList.contains("descartada"))
        .map(li => li.dataset.linea);
      const res = corregirParsons(def, puestas);
      Progreso.registrar(slug, def.id, res.puntaje);
      pintarResultado(fb, res);
    });

    raiz.append(lista, boton, fb);
    return raiz;
  }

  /* Mezcla determinística: la misma página muestra siempre el mismo desorden,
     pero un desorden de verdad. Ordenar por longitud no servía: la semilla se
     sumaba igual a todos los elementos, así que nunca alteraba el orden
     relativo entre líneas del mismo largo — esas caían al `localeCompare` y
     quedaban alfabéticas. Un ejercicio con líneas parejas ya ordenadas se
     renderizaba resuelto. Acá va un PRNG sembrado con el id y un Fisher-Yates,
     más un chequeo final: si la mezcla devolvió el orden correcto, se rompe. */
  function prng(semilla) {
    let a = semilla >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function mezclar(pool, id, ordenCorrecto) {
    const semilla = [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rnd = prng(semilla);
    const out = pool.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    const yaResuelto = ordenCorrecto.every((l, i) => out[i] === l);
    if (yaResuelto && out.length > 1) [out[0], out[1]] = [out[1], out[0]];
    return out;
  }

  function itemParsons(texto, lista) {
    const li = nodo("li", "pa-item");
    li.dataset.linea = texto;
    li.draggable = true;

    const pre = nodo("code", "pa-txt", texto);
    pre.style.paddingLeft = `${(texto.length - texto.trimStart().length) * 0.5}rem`;

    const ctrl = nodo("div", "pa-ctrl");
    const arriba = nodo("button", "pa-b", "↑");
    const abajo = nodo("button", "pa-b", "↓");
    const fuera = nodo("button", "pa-b", "×");
    arriba.type = abajo.type = fuera.type = "button";
    arriba.setAttribute("aria-label", "Subir esta línea");
    abajo.setAttribute("aria-label", "Bajar esta línea");
    fuera.setAttribute("aria-label", "Descartar esta línea, no va en el algoritmo");

    arriba.addEventListener("click", () => {
      const prev = li.previousElementSibling;
      if (prev) lista.insertBefore(li, prev);
    });
    abajo.addEventListener("click", () => {
      const sig = li.nextElementSibling;
      if (sig) lista.insertBefore(sig, li);
    });
    fuera.addEventListener("click", () => {
      li.classList.toggle("descartada");
      fuera.setAttribute("aria-label", li.classList.contains("descartada")
        ? "Restaurar esta línea al algoritmo"
        : "Descartar esta línea, no va en el algoritmo");
    });

    ctrl.append(arriba, abajo, fuera);
    li.append(pre, ctrl);

    li.addEventListener("dragstart", () => li.classList.add("arrastrando"));
    li.addEventListener("dragend", () => li.classList.remove("arrastrando"));
    return li;
  }

  /* ── Pyodide, cargado una sola vez por página ─────────── */
  const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v314.0.4/full/";
  let promesaPyodide = null;
  const paquetesCargados = new Set();

  async function cargarPyodide(paquetes = []) {
    if (!promesaPyodide) {
      promesaPyodide = (async () => {
        if (typeof loadPyodide === "undefined") {
          await new Promise((ok, err) => {
            const s = document.createElement("script");
            s.src = PYODIDE_CDN + "pyodide.js";
            s.onload = ok;
            s.onerror = () => err(new Error("no se pudo cargar Pyodide"));
            document.head.append(s);
          });
        }
        return loadPyodide({ indexURL: PYODIDE_CDN });
      })();
    }
    const py = await promesaPyodide;
    const faltantes = paquetes.filter(p => !paquetesCargados.has(p));
    if (faltantes.length) {
      await py.loadPackage(faltantes);
      faltantes.forEach(p => paquetesCargados.add(p));
    }
    return py;
  }

  function montarPython(def, slug) {
    const raiz = nodo("div", "ej ej-python");
    raiz.append(nodo("p", "ej-q", def.q));

    const editor = nodo("textarea", "py-editor");
    editor.value = def.inicial;
    editor.spellcheck = false;
    editor.rows = Math.max(6, def.inicial.split("\n").length + 2);
    editor.setAttribute("aria-label", "Editor de Python");

    const fila = nodo("div", "ej-fila");
    const correr = nodo("button", "ej-enviar", "▶ Ejecutar");
    correr.type = "button";
    const reset = nodo("button", "diag-ctrl", "↻ Reiniciar");
    reset.type = "button";
    reset.addEventListener("click", () => { editor.value = def.inicial; });

    const estado = nodo("span", "py-estado");
    const salida = nodo("pre", "py-salida");
    salida.hidden = true;
    const fb = nodo("div", "ej-fb");
    fb.hidden = true;

    correr.addEventListener("click", async () => {
      correr.disabled = true;
      const pesado = (def.paquetes || []).length > 0;
      estado.textContent = paquetesCargados.size || promesaPyodide
        ? "Ejecutando…"
        : `Descargando Python${pesado ? " y sus paquetes" : ""}. Solo la primera vez.`;

      try {
        const py = await cargarPyodide(def.paquetes || []);
        estado.textContent = "Ejecutando…";

        // Capturar stdout y stderr sin ensuciar el intérprete del usuario.
        py.runPython(`
import sys, io
_buf = io.StringIO()
sys.stdout = _buf
sys.stderr = _buf
`);
        let error = null;
        try {
          await py.runPythonAsync(editor.value);
        } catch (e) {
          error = e;
        }
        const impreso = py.runPython("sys.stdout.getvalue()");
        py.runPython("sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");

        salida.hidden = false;
        salida.textContent = error ? `${impreso}\n${error.message}` : (impreso || "(sin salida)");
        estado.textContent = "";

        if (error) {
          Progreso.registrar(slug, def.id, 0);
          pintarResultado(fb, { ok: false, puntaje: 0, msg: "El código tiró un error. Leelo arriba: Python suele decir bastante bien qué pasó." });
        } else {
          // Se compara la salida, no el código: hay muchas formas correctas de escribir lo mismo.
          const ok = impreso.trim() === def.esperado.trim();
          const res = ok
            ? { ok: true, puntaje: 100, msg: def.expl }
            : { ok: false, puntaje: 30, msg: `Corrió sin errores, pero la salida no es la esperada.\nEsperaba:\n${def.esperado}` };
          Progreso.registrar(slug, def.id, res.puntaje);
          pintarResultado(fb, res);
        }
      } catch (e) {
        estado.textContent = "";
        pintarResultado(fb, { ok: false, puntaje: 0, msg: `No se pudo cargar Python: ${e.message}. Probá recargar la página.` });
      } finally {
        correr.disabled = false;
      }
    });

    fila.append(correr, reset, estado);
    raiz.append(editor, fila, salida, fb);
    return raiz;
  }

  const constructores = { mcq: montarMcq, num: montarNum, parsons: montarParsons, python: montarPython };

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

  return { corregir, montar, mezclar, cargarPyodide };
})();

if (typeof module !== "undefined") module.exports = Ejercicios;
