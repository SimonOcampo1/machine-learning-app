/* Mecanismo compartido de diagramas paso a paso.

   El problema que resuelve: un diagrama que se dibuja solo al entrar en
   viewport cuenta su historia UNA vez, a la velocidad del scroll, y el lector
   no puede volver atrás. Para un proceso con etapas —una pasada hacia
   adelante, un reparto de error, una partición de árbol— eso no alcanza: hay
   que poder parar en el paso 3 y quedarse mirándolo.

   El contrato es deliberadamente chico. Cada diagrama entrega una lista de
   pasos y una función `pintar(i)` que deja el SVG en el estado del paso `i`,
   ENTERO y sin depender del paso anterior. Eso es lo que hace que ir para
   atrás, saltar, o arrancar en el último con movimiento reducido sean todos el
   mismo código: no hay animación incremental que rehacer, hay un estado que se
   calcula. Las transiciones las hace el CSS sobre los atributos que cambian. */
const Diagramas = (() => {

  const reducido = () =>
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  /* `pasos`: [{ rotulo, nota }]. `pintar(i)` deja el diagrama en el paso i.
     Devuelve un control con `ir(i)` por si la página quiere manejarlo. */
  function montarPasos(figura, pasos, pintar, { autoplay = 1400 } = {}) {
    const fig = typeof figura === "string" ? document.querySelector(figura) : figura;
    if (!fig || !pasos.length) return null;

    let i = 0;
    let reproduciendo = null;

    const barra = nodo("div", "dg-ctrl");
    const atras = nodo("button", "pill dg-b", "◀");
    const adelante = nodo("button", "pill dg-b", "▶");
    const reproducir = nodo("button", "ej-enviar dg-play", "Reproducir");
    const reiniciar = nodo("button", "pill dg-b", "↻");
    for (const [b, rot] of [[atras, "Paso anterior"], [adelante, "Paso siguiente"], [reiniciar, "Volver al principio"]]) {
      b.type = "button";
      b.setAttribute("aria-label", rot);
      b.title = rot;
    }
    reproducir.type = "button";

    const lectura = nodo("p", "dg-paso");
    // aria-live: quien no ve el diagrama se entera igual de en qué paso está y
    // qué acaba de pasar, que es toda la información que el SVG transmite.
    lectura.setAttribute("role", "status");
    const nota = nodo("p", "dg-nota");

    const marcas = nodo("div", "dg-marcas");
    const puntos = pasos.map((p, k) => {
      const b = nodo("button", "dg-marca");
      b.type = "button";
      b.setAttribute("aria-label", `Ir al paso ${k + 1}: ${p.rotulo}`);
      b.title = p.rotulo;
      b.addEventListener("click", () => { parar(); ir(k); });
      marcas.append(b);
      return b;
    });

    function ir(n) {
      i = Math.max(0, Math.min(pasos.length - 1, n));
      pintar(i);
      lectura.textContent = `Paso ${i + 1} de ${pasos.length} · ${pasos[i].rotulo}`;
      nota.textContent = pasos[i].nota || "";
      atras.disabled = i === 0;
      adelante.disabled = i === pasos.length - 1;
      puntos.forEach((p, k) => {
        p.classList.toggle("en", k === i);
        p.classList.toggle("vista", k < i);
      });
    }

    function parar() {
      if (!reproduciendo) return;
      clearInterval(reproduciendo);
      reproduciendo = null;
      reproducir.textContent = "Reproducir";
    }

    reproducir.addEventListener("click", () => {
      if (reproduciendo) { parar(); return; }
      // Reproducir desde el final es la acción que más se pide sin querer: si
      // ya se llegó al último paso, se vuelve al principio en vez de no hacer
      // nada, que se lee como un botón roto.
      if (i === pasos.length - 1) ir(0);
      reproducir.textContent = "Pausar";
      reproduciendo = setInterval(() => {
        if (i >= pasos.length - 1) { parar(); return; }
        ir(i + 1);
      }, autoplay);
    });

    atras.addEventListener("click", () => { parar(); ir(i - 1); });
    adelante.addEventListener("click", () => { parar(); ir(i + 1); });
    reiniciar.addEventListener("click", () => { parar(); ir(0); });

    barra.append(atras, adelante, reproducir, reiniciar, marcas);

    /* Los controles van ANTES de la leyenda: la leyenda es `figcaption` y en la
       grilla del diagrama vive en la columna del margen, así que insertarlos
       al final los mandaría a esa columna. */
    const leyenda = fig.querySelector("figcaption");
    fig.insertBefore(barra, leyenda);
    fig.insertBefore(lectura, leyenda);
    fig.insertBefore(nota, leyenda);

    /* Con movimiento reducido se arranca en el ÚLTIMO paso, no en el primero:
       el estado final es el que contiene toda la información del diagrama, y
       quien no quiere movimiento igual quiere el contenido. Los controles
       siguen ahí para recorrerlo a mano. */
    ir(reducido() ? pasos.length - 1 : 0);

    return { ir, actual: () => i, parar };
  }

  return { montarPasos, reducido };
})();

if (typeof module !== "undefined") module.exports = Diagramas;
