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

  const SVG_NS = "http://www.w3.org/2000/svg";

  /* `className` en un elemento SVG es un SVGAnimatedString de solo lectura:
     asignarle un string no hace nada y falla en silencio. Va por atributo. */
  function svgNodo(tag, clase, attrs = {}) {
    const n = document.createElementNS(SVG_NS, tag);
    if (clase) n.setAttribute("class", clase);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  }

  const reducido = () =>
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    /* La explicación es donde vive casi toda la notación de los ejercicios —el
       enunciado pregunta en palabras y la explicación contesta con fórmulas—,
       y aparece recién ahora, al responder. Envolverla solo al montar no
       alcanzaría: en ese momento esta caja está vacía. */
    componerMate(caja);
    dispatchEvent(new CustomEvent("ejercicio-respondido"));
  }

  /* Envuelve la notación suelta y la compone. Las dos funciones viven en
     shared.js y pueden faltar si ese archivo no cargó: sin ellas el texto se
     lee igual en Unicode, que es el respaldo de siempre. */
  function componerMate(raiz) {
    if (typeof envolverMate !== "function") return;
    try {
      envolverMate(raiz);
      montarMates(raiz).catch(e => console.warn("matemática de ejercicios:", e.message));
    } catch (e) {
      console.warn("notación de ejercicios:", e);
    }
  }

  function montarMcq(def, slug) {
    const raiz = nodo("div", "ej ej-mcq");
    raiz.append(nodo("p", "ej-q", def.q));
    const lista = nodo("div", "ej-opts");
    const fb = nodo("div", "ej-fb");
    // role="status" implica aria-live="polite": quien usa lector de pantalla
    // se entera del resultado sin tener que ir a buscarlo.
    fb.setAttribute("role", "status");
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

    /* Las flechas nativas de `type="number"` no se pueden pintar: el navegador
       las dibuja con el estilo del sistema operativo y el único CSS que las
       toca es el que las esconde. Se esconden (ver `.ej-input::-webkit-*`) y se
       reponen como dos botones del sistema. El input sigue siendo `number`, así
       que el teclado del teléfono, las flechas ↑↓ del teclado físico y
       `valueAsNumber` no cambian. */
    const campo = nodo("div", "ej-num-campo");
    const flechas = nodo("div", "ej-num-flechas");
    const paso = (signo) => {
      // `stepUp/stepDown` respetan min, max y step del input, cosa que sumar a
      // mano no hace. Con `step="any"` tiran, y ahí el paso de a 1 es el
      // fallback razonable para las respuestas numéricas de los ejercicios.
      try {
        signo > 0 ? input.stepUp() : input.stepDown();
      } catch {
        input.value = (Number(input.value || 0) + signo).toString();
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    for (const [signo, glifo, rotulo] of [[1, "▲", "Aumentar"], [-1, "▼", "Disminuir"]]) {
      const b = nodo("button", "ej-num-b", glifo);
      b.type = "button";
      b.tabIndex = -1;   // el input ya responde a ↑↓: duplicar paradas de tabulación estorba
      b.setAttribute("aria-label", rotulo);
      b.addEventListener("click", () => { paso(signo); input.focus(); });
      flechas.append(b);
    }
    campo.append(input, flechas);

    const boton = nodo("button", "ej-enviar", "Comprobar");
    boton.type = "button";
    const fb = nodo("div", "ej-fb");
    // role="status" implica aria-live="polite": quien usa lector de pantalla
    // se entera del resultado sin tener que ir a buscarlo.
    fb.setAttribute("role", "status");
    fb.hidden = true;

    const enviar = () => {
      const res = corregirNum(def, input.valueAsNumber);
      Progreso.registrar(slug, def.id, res.puntaje);
      pintarResultado(fb, res);
    };
    boton.addEventListener("click", enviar);
    input.addEventListener("keydown", e => { if (e.key === "Enter") enviar(); });

    fila.append(campo);
    if (def.unidad) {
      const u = nodo("span", "ej-unidad", def.unidad);
      u.id = `${def.id}-u`;
      fila.append(u);
    }
    fila.append(boton);
    raiz.append(fila, fb);
    return raiz;
  }

  /* ── Flujo de ejecución del Parsons ───────────────────── */
  /* El diagrama que acompaña a los bloques. Un nodo por línea, en el orden en
     que están AHORA, encadenados por un conector acodado. La sangría de la
     línea se traduce en desplazamiento lateral del nodo, así que el acodado
     del conector dibuja literalmente el "entrar" y "salir" de un bloque: la
     indentación deja de ser un detalle tipográfico y pasa a ser una forma.
     Eso importa porque `corregirParsons` ya distingue el error de sangría del
     error de orden, pero hasta ahora solo podía decirlo con una frase. */
  const NODO_ALTO = 34, NODO_SALTO = 52, FLUJO_ANCHO = 260, SANGRIA_PX = 13;

  function rotuloNodo(linea) {
    const t = linea.trim();
    return t.length > 26 ? `${t.slice(0, 25)}…` : t;
  }

  const nivelSangria = (linea) => (linea.length - linea.trimStart().length) / 4;

  /* Dibuja el flujo desde cero a partir del estado actual de la lista. Se
     redibuja entero en vez de parchear: son seis nodos, el costo es nulo, y
     un redibujado completo no puede quedar desincronizado de la lista, que es
     el único error que este componente no se puede permitir. */
  function pintarFlujo(svg, items) {
    const alto = Math.max(NODO_SALTO * items.length - (NODO_SALTO - NODO_ALTO), NODO_ALTO);
    svg.setAttribute("viewBox", `0 0 ${FLUJO_ANCHO} ${alto}`);
    svg.replaceChildren();

    const geo = items.map((li, i) => {
      const x = 6 + nivelSangria(li.dataset.linea) * SANGRIA_PX;
      return { x, y: i * NODO_SALTO, ancho: FLUJO_ANCHO - x - 6, li };
    });

    // Los conectores van primero para que queden por debajo de los nodos.
    for (let i = 0; i < geo.length - 1; i++) {
      const a = geo[i], b = geo[i + 1];
      const x1 = a.x + 14, x2 = b.x + 14;
      const y1 = a.y + NODO_ALTO, y2 = b.y;
      const medio = y1 + (y2 - y1) / 2;
      svg.append(svgNodo("path", "pa-arista", {
        d: `M ${x1} ${y1} V ${medio} H ${x2} V ${y2}`,
        "data-arista": i
      }));
    }

    for (const [i, g] of geo.entries()) {
      const grupo = svgNodo("g", "pa-nodo", { "data-i": i });
      if (g.li.classList.contains("descartada")) {
        grupo.setAttribute("class", "pa-nodo descartada");
      }
      grupo.append(svgNodo("rect", null, {
        x: g.x, y: g.y, width: g.ancho, height: NODO_ALTO, rx: 6
      }));
      const t = svgNodo("text", null, { x: g.x + 10, y: g.y + NODO_ALTO / 2 + 4 });
      t.textContent = rotuloNodo(g.li.dataset.linea);
      grupo.append(t);
      svg.append(grupo);
    }

    return geo;
  }

  /* Recorre el camino encendiendo nodos y aristas. `camino` son los índices de
     nodo a visitar, en orden y ya sin los descartados; `culpable` es el índice
     del nodo equivocado, o null si el orden estaba bien.
     Los descartados se saltean y no rompen la numeración: por eso el camino
     viene como lista de índices y no como un corte, que obligaría a suponer
     que los nodos visitados son los primeros N. */
  function recorrerFlujo(svg, geo, camino, culpable) {
    svg.querySelectorAll(".pa-nodo").forEach(n => {
      n.setAttribute("class", n.getAttribute("class").replace(/\s+(ok|falla)\b/g, ""));
    });
    svg.querySelectorAll(".pa-arista").forEach(a => a.setAttribute("class", "pa-arista"));
    svg.querySelector(".pa-token-grupo")?.remove();

    const marcar = (i, previo) => {
      const n = svg.querySelector(`.pa-nodo[data-i="${i}"]`);
      if (!n) return;
      const falla = i === culpable;
      n.setAttribute("class", `${n.getAttribute("class")} ${falla ? "falla" : "ok"}`);
      if (falla || previo == null) return;
      // Entre dos nodos del camino puede haber descartados: se encienden todas
      // las aristas del tramo, que es lo que el ojo ve como un solo trazo.
      for (let a = previo; a < i; a++) {
        svg.querySelector(`.pa-arista[data-arista="${a}"]`)?.setAttribute("class", "pa-arista ok");
      }
    };

    // Con movimiento reducido el resultado se pinta de una: el token es la
    // forma de CONTAR el recorrido, no el recorrido en sí. Quien pidió menos
    // movimiento ve exactamente la misma información, sin la animación.
    if (reducido() || typeof gsap === "undefined") {
      camino.forEach((i, k) => marcar(i, k === 0 ? null : camino[k - 1]));
      return;
    }

    const grupo = svgNodo("g", "pa-token-grupo");
    const halo = svgNodo("circle", "pa-token-halo", { r: 9 });
    const punto = svgNodo("circle", "pa-token", { r: 4 });
    grupo.append(halo, punto);
    svg.append(grupo);

    const linea = gsap.timeline();
    camino.forEach((i, k) => {
      const g = geo[i];
      if (!g) return;
      linea.to([halo, punto], {
        attr: { cx: g.x + 14, cy: g.y + NODO_ALTO / 2 },
        duration: k === 0 ? 0 : 0.28,
        ease: "power2.inOut",
        onComplete: () => marcar(i, k === 0 ? null : camino[k - 1])
      });
    });
    // El token se retira cuando el camino ya está pintado: dejarlo clavado
    // sobre el último nodo lo haría leer como "acá quedó trabado".
    linea.to(grupo, { opacity: 0, duration: 0.3, delay: 0.25 });
  }

  function montarParsons(def, slug) {
    const raiz = nodo("div", "ej ej-parsons");
    raiz.append(nodo("p", "ej-q", def.q));

    const split = nodo("div", "pa-split");
    const lista = nodo("ol", "pa-lista");
    lista.setAttribute("aria-label", "Líneas de código: arrastralas o usá los botones para ordenarlas");

    const flujo = nodo("div", "pa-flujo");
    flujo.append(nodo("p", "pa-flujo-tit", "Flujo de ejecución"));
    const svg = svgNodo("svg", null, { role: "img" });
    // El flujo es un espejo de la lista, que ya es navegable y anunciable. Que
    // un lector de pantalla lo lea de nuevo sería repetir todo el ejercicio;
    // el resultado se anuncia una sola vez, por el `role="status"` del feedback.
    svg.setAttribute("aria-hidden", "true");
    flujo.append(svg);

    let geo = [];
    const itemsVivos = () => [...lista.querySelectorAll(".pa-item")];
    const redibujar = () => { geo = pintarFlujo(svg, itemsVivos()); };

    // Mezcla determinística por id: la misma página da siempre el mismo desorden.
    const pool = mezclar([...def.lineas, ...(def.distractores || [])], def.id, def.lineas);
    for (const texto of pool) lista.append(itemParsons(texto, lista, redibujar, svg));

    lista.addEventListener("dragover", (e) => {
      e.preventDefault();
      const arrastrando = lista.querySelector(".arrastrando");
      if (!arrastrando) return;
      const hermanos = [...lista.querySelectorAll(".pa-item:not(.arrastrando)")];
      const siguiente = hermanos.find(li => e.clientY < li.getBoundingClientRect().top + li.offsetHeight / 2);
      lista.insertBefore(arrastrando, siguiente || null);
      redibujar();
    });

    split.append(lista, flujo);

    const boton = nodo("button", "ej-enviar", "Comprobar");
    boton.type = "button";
    const fb = nodo("div", "ej-fb");
    // role="status" implica aria-live="polite": quien usa lector de pantalla
    // se entera del resultado sin tener que ir a buscarlo.
    fb.setAttribute("role", "status");
    fb.hidden = true;

    boton.addEventListener("click", () => {
      const activos = itemsVivos().filter(li => !li.classList.contains("descartada"));
      const puestas = activos.map(li => li.dataset.linea);
      const res = corregirParsons(def, puestas);

      /* `fallo` es el primer índice que no coincide con lo esperado. Si da -1
         con un resultado incorrecto, lo puesto es un prefijo correcto de la
         solución: no hay nodo culpable, faltan líneas. Ahí el camino se recorre
         entero y el porqué lo dice el feedback, que ya informa cuántas líneas
         esperaba. */
      const fallo = puestas.findIndex((l, i) => l !== def.lineas[i]);
      // `indices[k]` es la posición real, en la lista completa, del k-ésimo
      // bloque activo. Sin este mapeo un bloque descartado en el medio correría
      // todo el flujo un lugar y se encendería el nodo equivocado.
      const indices = itemsVivos()
        .map((li, i) => (li.classList.contains("descartada") ? -1 : i))
        .filter(i => i >= 0);
      const camino = fallo < 0 ? indices : indices.slice(0, fallo + 1);
      recorrerFlujo(svg, geo, camino, fallo < 0 ? null : indices[fallo]);

      Progreso.registrar(slug, def.id, res.puntaje);
      pintarResultado(fb, res);
    });

    raiz.append(split, boton, fb);
    // El primer dibujo va después de que la lista esté en el DOM del árbol que
    // se devuelve: `pintarFlujo` solo lee `dataset` y clases, no mide layout.
    redibujar();
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

  /* `alCambiar` se dispara en los cuatro caminos que pueden alterar el orden o
     la participación de una línea: soltar un arrastre, ↑, ↓ y ×. Se avisa
     explícitamente en vez de espiar la lista con un MutationObserver porque el
     resaltado por hover también toca clases, y un observer volvería a dibujar
     el flujo entero en cada pasada del mouse, borrando el resultado de la
     última comprobación. */
  function itemParsons(texto, lista, alCambiar = () => {}, svg = null) {
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
      if (prev) { lista.insertBefore(li, prev); alCambiar(); }
    });
    abajo.addEventListener("click", () => {
      const sig = li.nextElementSibling;
      if (sig) { lista.insertBefore(sig, li); alCambiar(); }
    });
    fuera.addEventListener("click", () => {
      li.classList.toggle("descartada");
      fuera.setAttribute("aria-label", li.classList.contains("descartada")
        ? "Restaurar esta línea al algoritmo"
        : "Descartar esta línea, no va en el algoritmo");
      alCambiar();
    });

    ctrl.append(arriba, abajo, fuera);
    li.append(pre, ctrl);

    li.addEventListener("dragstart", () => li.classList.add("arrastrando"));
    li.addEventListener("dragend", () => { li.classList.remove("arrastrando"); alCambiar(); });

    /* Espejo bloque ↔ nodo. Es lo que enseña que las dos columnas son la misma
       cosa vista de dos maneras; sin él, el flujo se lee como una decoración
       que apareció al costado. Va también en foco, no solo en hover: quien
       navega con el teclado tiene el mismo hilo. */
    if (svg) {
      const señalar = (on) => {
        const i = [...lista.querySelectorAll(".pa-item")].indexOf(li);
        li.classList.toggle("senalada", on);
        const n = svg.querySelector(`.pa-nodo[data-i="${i}"]`);
        if (!n) return;
        const base = n.getAttribute("class").replace(/\s+senalada\b/g, "");
        n.setAttribute("class", on ? `${base} senalada` : base);
      };
      li.addEventListener("mouseenter", () => señalar(true));
      li.addEventListener("mouseleave", () => señalar(false));
      li.addEventListener("focusin", () => señalar(true));
      li.addEventListener("focusout", () => señalar(false));
    }

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
    let py;
    try {
      py = await promesaPyodide;
    } catch (e) {
      // Una promesa rechazada queda cacheada y todo intento posterior la reusa.
      // Sin esto, un solo clic sin conexión deja Python inutilizable hasta recargar.
      promesaPyodide = null;
      throw e;
    }
    const faltantes = paquetes.filter(p => !paquetesCargados.has(p));
    if (faltantes.length) {
      await py.loadPackage(faltantes);
      faltantes.forEach(p => paquetesCargados.add(p));
    }
    return py;
  }

  /* Conecta la salida del intérprete a la terminal, línea por línea mientras
     corre. `setStdout({batched})` es lo que hace posible ver el progreso de un
     bucle en vivo en vez de recibir todo de golpe al terminar; Pyodide llama al
     callback en cada salto de línea y le saca el "\n", que se repone acá.
     El fallback al viejo `io.StringIO` no es decorativo: si esa API no existe
     en la versión de Pyodide que sirva el CDN, sin él los ejercicios de Python
     de los 24 temas se quedan sin salida. Pierde el streaming, no la función.
     Devuelve `{ leer, restaurar }`: `leer()` da el stdout acumulado (que es lo
     único contra lo que se compara `def.esperado`) y `restaurar()` deja el
     intérprete como estaba para el ejercicio siguiente. */
  function conectarSalida(py, escribir) {
    let acumulado = "";
    const alSalir = (txt) => { acumulado += `${txt}\n`; escribir(`${txt}\n`, "py-linea-salida"); };
    const alError = (txt) => escribir(`${txt}\n`, "py-linea-error");

    if (typeof py.setStdout === "function" && typeof py.setStderr === "function") {
      py.setStdout({ batched: alSalir });
      py.setStderr({ batched: alError });
      return {
        leer: () => acumulado,
        restaurar: () => { py.setStdout({}); py.setStderr({}); }
      };
    }

    py.runPython("import sys, io\n_buf = io.StringIO()\nsys.stdout = _buf\nsys.stderr = _buf");
    return {
      leer: () => acumulado,
      restaurar: () => {
        // Se lee `_buf` directo y no `sys.stdout`: si el código del usuario
        // reasignó sys.stdout, leer de ahí tiraría y la restauración nunca
        // ocurriría, dejando el intérprete redirigido para siempre.
        try {
          acumulado = py.runPython("_buf.getvalue()");
          if (acumulado) escribir(acumulado, "py-linea-salida");
        } finally {
          py.runPython("sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");
        }
      }
    };
  }

  function panelPython(nombre, cuerpo, extra) {
    const panel = nodo("div", "py-panel");
    const barra = nodo("div", "py-barra");
    barra.append(nodo("span", "py-nombre", nombre), extra);
    panel.append(barra, cuerpo);
    return panel;
  }

  function montarPython(def, slug) {
    const raiz = nodo("div", "ej ej-python");
    raiz.append(nodo("p", "ej-q", def.q));

    const editor = nodo("textarea", "py-editor");
    editor.value = def.inicial;
    editor.spellcheck = false;
    editor.rows = Math.max(8, def.inicial.split("\n").length + 1);
    editor.setAttribute("aria-label", "Editor de Python");

    const salida = nodo("pre", "py-salida");
    // role="log" con aria-live implícito "polite": la salida se va anunciando
    // sola a medida que llega, que es justamente lo que hace un streaming.
    salida.setAttribute("role", "log");
    salida.setAttribute("aria-label", "Salida de la terminal");
    const cursor = nodo("span", "py-cursor");
    cursor.hidden = true;
    salida.append(cursor);

    const estado = nodo("span", "py-estado");

    /* La terminal escribe SIEMPRE antes del cursor, así el bloque parpadeante
       queda al final de lo último impreso, como en una consola de verdad. */
    const escribir = (txt, clase) => {
      if (!txt) return;
      salida.insertBefore(nodo("span", clase, txt), cursor);
      salida.scrollTop = salida.scrollHeight;
    };
    const limpiar = () => salida.replaceChildren(cursor);

    const split = nodo("div", "py-split");
    split.append(
      panelPython("ejercicio.py", editor, nodo("span", null, "Python")),
      panelPython("terminal", salida, estado)
    );

    const fila = nodo("div", "ej-fila");
    const correr = nodo("button", "ej-enviar", "▶ Ejecutar");
    correr.type = "button";
    // `.pill` es el control secundario del sistema; el primario de esta fila es
    // `correr`, que lleva el borde de gradiente. Uno solo por vista.
    const reset = nodo("button", "pill", "↻ Reiniciar");
    reset.type = "button";
    reset.addEventListener("click", () => {
      editor.value = def.inicial;
      limpiar();
      estado.textContent = "";
      estado.className = "py-estado";
    });

    const fb = nodo("div", "ej-fb");
    // role="status" implica aria-live="polite": quien usa lector de pantalla
    // se entera del resultado sin tener que ir a buscarlo.
    fb.setAttribute("role", "status");
    fb.hidden = true;

    correr.addEventListener("click", async () => {
      correr.disabled = true;
      limpiar();
      cursor.hidden = false;
      estado.className = "py-estado";
      estado.textContent = "corriendo";
      escribir("$ python ejercicio.py\n", "py-linea-sistema");

      // El aviso tiene que decir la verdad en los tres casos. Mirar solo si
      // Pyodide ya cargó no alcanza: un ejercicio posterior puede pedir paquetes
      // nuevos y bajarse 30 MB mientras la pantalla dice "Ejecutando…".
      const faltanPaquetes = (def.paquetes || []).some(p => !paquetesCargados.has(p));
      if (!promesaPyodide) {
        escribir(`Descargando Python${faltanPaquetes ? " y sus paquetes" : ""}. Solo la primera vez.\n`, "py-linea-sistema");
      } else if (faltanPaquetes) {
        escribir("Descargando paquetes. Solo la primera vez.\n", "py-linea-sistema");
      }

      const t0 = Date.now();
      try {
        const py = await cargarPyodide(def.paquetes || []);
        const tubo = conectarSalida(py, escribir);

        let error = null;
        try {
          await py.runPythonAsync(editor.value);
        } catch (e) {
          error = e;
        } finally {
          tubo.restaurar();
        }

        const impreso = tubo.leer();
        const segundos = ((Date.now() - t0) / 1000).toFixed(1);
        cursor.hidden = true;

        if (error) {
          // El traceback va a la terminal y en el color de error, no en el
          // feedback: es salida del programa, no corrección del ejercicio.
          escribir(`${error.message}\n`, "py-linea-error");
          estado.className = "py-estado no";
          estado.textContent = `error · ${segundos}s`;
          Progreso.registrar(slug, def.id, 0);
          pintarResultado(fb, { ok: false, puntaje: 0, msg: "El código tiró un error. Leelo en la terminal: Python suele decir bastante bien qué pasó." });
        } else {
          if (!impreso) escribir("(sin salida)\n", "py-linea-sistema");
          // Se compara la salida, no el código: hay muchas formas correctas de
          // escribir lo mismo. Y se compara solo stdout: antes stdout y stderr
          // iban al mismo buffer, así que un warning de scikit-learn —que sale
          // por stderr y no es culpa de quien resuelve— daba el ejercicio por
          // incorrecto aunque el print fuera exacto.
          const ok = impreso.trim() === def.esperado.trim();
          estado.className = `py-estado ${ok ? "ok" : "no"}`;
          estado.textContent = `${ok ? "ok" : "salida distinta"} · ${segundos}s`;
          const res = ok
            ? { ok: true, puntaje: 100, msg: def.expl }
            : { ok: false, puntaje: 30, msg: `Corrió sin errores, pero la salida no es la esperada.\nEsperaba:\n${def.esperado}` };
          Progreso.registrar(slug, def.id, res.puntaje);
          pintarResultado(fb, res);
        }
      } catch (e) {
        cursor.hidden = true;
        escribir(`${e.message}\n`, "py-linea-error");
        estado.className = "py-estado no";
        estado.textContent = "sin Python";
        pintarResultado(fb, { ok: false, puntaje: 0, msg: `No se pudo cargar Python: ${e.message}. Probá recargar la página.` });
      } finally {
        correr.disabled = false;
      }
    });

    fila.append(correr, reset);
    raiz.append(split, fila, fb);
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

    /* Los enunciados son strings de `js/temas/*.js` insertados con
       `textContent`, así que la conversión a LaTeX que se hizo sobre el HTML no
       los alcanza. Se envuelven acá, recién montados. Las explicaciones se
       envuelven aparte, en `pintarResultado`, porque todavía no existen. */
    componerMate(raiz);

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
