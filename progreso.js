const Progreso = (() => {
  const CLAVE = "ml-progreso";

  const vacio = () => ({ v: 1, actualizado: new Date().toISOString(), temas: {} });

  const temaVacio = () => ({ leido: false, quiz: false, ejercicios: {} });

  // `temas` tiene que ser un objeto plano. Un array pasa `typeof === "object"`
  // y es truthy, pero `JSON.stringify` de un array descarta las claves de
  // texto: el progreso se guardaría y desaparecería al siguiente `guardar()`.
  function _estadoValido(e) {
    if (!e || typeof e !== "object") return false;
    if (!e.temas || typeof e.temas !== "object" || Array.isArray(e.temas)) return false;
    return true;
  }

  function leer() {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return vacio();
      const e = JSON.parse(crudo);
      if (!_estadoValido(e)) return vacio();
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
    // Un total ausente significa "este tema todavía no se escribió", que es
    // distinto de "este tema no tiene ejercicios". Sin esta distinción, los 23
    // temas pendientes se pintarían completos apenas alguien los marque leídos.
    if (typeof totalEjercicios !== "number" || totalEjercicios < 0) return "sin-empezar";
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
    // Se pasa el valor tal cual: si el slug no está en el mapa llega `undefined`,
    // y `estadoTema` lo lee como "tema sin escribir" en vez de "cero ejercicios".
    const completos = temas.filter(
      t => estadoTema(estado, t.slug, totalesPorSlug[t.slug]) === "completa"
    ).length;
    return Math.round((completos / temas.length) * 100);
  }

  return { vacio, leer, guardar, marcarLeido, marcarQuiz, registrar, fusionar, estadoTema, porcentaje, _estadoValido };
})();

if (typeof module !== "undefined") module.exports = Progreso;

/* ── Sincronización con el servidor ──────────────────────── */
const Sync = (() => {
  const CLAVE_CRED = "ml-cred";
  let cred = null;
  let temporizador = null;

  const sesionActiva = () => Boolean(cred);

  async function pedir(metodo, cuerpo) {
    const r = await fetch("/api/progress", {
      method: metodo,
      headers: {
        Authorization: `Bearer ${cred}`,
        ...(cuerpo ? { "Content-Type": "application/json" } : {})
      },
      ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {})
    });
    if (r.status === 401) { salir(); throw new Error("sesión vencida"); }
    if (!r.ok && r.status !== 204) throw new Error(`el servidor respondió ${r.status}`);
    return r.status === 204 ? null : r.json();
  }

  /* Debounce: escribir un ejercicio no dispara un POST por tecla. */
  function encolar(estado) {
    if (!sesionActiva()) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      // Si falla, no se avisa: el dato ya está en localStorage y el próximo
      // guardado lo reintenta. No vale la pena una cola de reintentos acá.
      pedir("POST", estado).catch(e => console.warn("no se pudo sincronizar:", e.message));
    }, 2000);
  }

  async function entrar(credential) {
    cred = credential;
    sessionStorage.setItem(CLAVE_CRED, credential);
    try {
      const remoto = await pedir("GET");
      const fusionado = Progreso.fusionar(Progreso.leer(), remoto);
      Progreso.guardar(fusionado);           // guardar() vuelve a llamar a encolar()
      await pedir("POST", fusionado);        // y además sube ya, sin esperar el debounce
      pintar();
      dispatchEvent(new CustomEvent("progreso-actualizado"));
    } catch (e) {
      console.warn("no se pudo traer el progreso remoto:", e.message);
      pintar();
    }
  }

  function salir() {
    cred = null;
    sessionStorage.removeItem(CLAVE_CRED);
    if (window.google?.accounts?.id) google.accounts.id.disableAutoSelect();
    pintar();
  }

  let contenedor = null;
  let clientIdGuardado = null;

  function pintar() {
    if (!contenedor) return;
    contenedor.replaceChildren();
    if (sesionActiva()) {
      const p = document.createElement("span");
      p.className = "sync-estado";
      p.textContent = "✓ progreso sincronizado";
      const b = document.createElement("button");
      b.className = "sync-salir";
      b.type = "button";
      b.textContent = "Salir";
      b.addEventListener("click", salir);
      contenedor.append(p, b);
    } else {
      const d = document.createElement("div");
      d.id = "g-boton";
      contenedor.append(d);
      if (window.google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: clientIdGuardado,
          callback: (resp) => entrar(resp.credential)
        });
        google.accounts.id.renderButton(d, { theme: "outline", size: "medium", text: "signin", locale: "es" });
      }
    }
  }

  function montar(sel, clientId) {
    contenedor = document.querySelector(sel);
    clientIdGuardado = clientId;
    const guardada = sessionStorage.getItem(CLAVE_CRED);
    if (guardada) {
      // Se reusa la credencial de la pestaña; si venció, el 401 la limpia sola.
      cred = guardada;
      pedir("GET")
        .then(remoto => {
          if (remoto) {
            Progreso.guardar(Progreso.fusionar(Progreso.leer(), remoto));
            dispatchEvent(new CustomEvent("progreso-actualizado"));
          }
        })
        .catch(() => {});
    }
    pintar();
  }

  return { montar, encolar, entrar, salir, sesionActiva };
})();

if (typeof module !== "undefined") module.exports.Sync = Sync;
