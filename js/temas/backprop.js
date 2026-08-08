/* Pegamento del tema 23. Solo toca `document`, no se testea con node --test. */

const SLUG = "backprop";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "bp-c1",
      q: "¿Cuál es exactamente el rol de backpropagation en el entrenamiento?",
      opts: [
        "Es el algoritmo que ajusta los pesos para minimizar el error",
        "Es el método que calcula los gradientes de forma eficiente; quien mueve los pesos es el descenso de gradiente",
        "Es la pasada hacia adelante que produce la predicción",
        "Es la técnica que evita el sobreajuste en redes profundas"
      ],
      c: 1,
      expl: "Backprop dice hacia dónde; el optimizador da el paso. La distinción importa al diagnosticar: si el modelo no mejora, el problema casi siempre está en el learning rate o el optimizador, no en el cálculo del gradiente." },

    { tipo: "mcq", id: "bp-c2",
      q: "En una red de veinte capas con sigmoides, las primeras capas casi no cambian sus pesos durante el entrenamiento. ¿Por qué?",
      opts: [
        "Porque las primeras capas ya están bien inicializadas y no necesitan cambiar",
        "Porque el gradiente es un producto de los efectos de cada capa, y con factores menores que 1 se derrumba exponencialmente antes de llegar",
        "Porque el optimizador prioriza las capas finales",
        "Porque las primeras capas reciben menos datos que las últimas"
      ],
      c: 1,
      expl: "La derivada de la sigmoide nunca supera 0.25, así que cada capa atravesada divide el gradiente al menos por cuatro. Con veinte capas, lo que llega adelante es prácticamente cero y esas capas nunca aprenden. Es el gradiente que se desvanece, y es la razón real por la que ReLU cambió las cosas." },

    { tipo: "num", id: "bp-n1",
      q: "Tenés 50.000 ejemplos de entrenamiento y usás lotes de 250. ¿Cuántas actualizaciones de pesos ocurren en una época?",
      resp: 200, tol: 0.5,
      trampas: [
        { val: 1, msg: "Una época es una pasada completa por el dataset, pero los pesos se actualizan una vez por LOTE, no una vez por época. Con lotes de 250 sobre 50.000 ejemplos entran 200 lotes." },
        { val: 50000, msg: "Esa sería la cantidad de actualizaciones si el lote fuera de un solo ejemplo. Con lotes de 250, cada actualización procesa 250 ejemplos a la vez." }
      ],
      expl: "50.000 / 250 = 200 lotes, o sea 200 actualizaciones por época. Entrenar 100 épocas son 20.000 actualizaciones. Confundir época con actualización es lo que hace que la gente subestime por dos órdenes de magnitud cuánto se está moviendo el modelo." },

    { tipo: "parsons", id: "bp-p1",
      q: "Armá el bucle de entrenamiento de una época en PyTorch. Sobra una línea: descartala con ×.",
      lineas: [
        "for x, y in cargador:",
        "    optimizador.zero_grad()",
        "    pred = modelo(x)",
        "    perdida = criterio(pred, y)",
        "    perdida.backward()",
        "    optimizador.step()"
      ],
      distractores: ["    perdida.backward(retain_graph=True)"],
      expl: "El orden es el contrato: poner los gradientes en cero, pasada hacia adelante, calcular la pérdida, pasada hacia atrás, y recién ahí mover los pesos. Sin zero_grad() los gradientes se acumulan entre iteraciones y cada paso usa la suma de todos los anteriores, sin que nada falle. Es el bug más común de quien arranca." },

    { tipo: "python", id: "bp-py1",
      q: "Comprobá el desvanecimiento del gradiente. Calculá qué fracción del gradiente llega a la primera capa con sigmoides y con ReLU, en una red de 20 capas. Imprimí los dos: print(sigmoide, relu).",
      inicial: `# Derivada máxima de cada activación.
d_sigmoide = 0.25
d_relu = 1.0
capas = 20

# Completá: el gradiente que llega a la primera capa es el producto
# de la derivada de cada capa atravesada, o sea la derivada elevada
# a la cantidad de capas.
sigmoide = None
relu = None

# Completá: imprimí sigmoide y relu
`,
      esperado: "9.094947017729282e-13 1.0",
      expl: "Con sigmoides llega menos de una billonésima parte del gradiente: la primera capa recibe una señal de ajuste indistinguible de cero y nunca aprende. Con ReLU llega entero. Y esto es con la derivada MÁXIMA de la sigmoide, que solo se alcanza en un punto; en la práctica es todavía peor. Eso explica por qué backprop se conocía desde los setenta y las redes profundas no funcionaron hasta treinta años después." }
  ], SLUG);
}

function montarProgresoLectura() {
  const sintesis = document.getElementById("sintesis");
  if (!sintesis) return;
  if (typeof IntersectionObserver === "undefined") {
    Progreso.marcarLeido(SLUG);
    return;
  }
  new IntersectionObserver((es, obs) => {
    if (es[0].isIntersecting) {
      Progreso.marcarLeido(SLUG);
      obs.disconnect();
    }
  }, { threshold: 0.6 }).observe(sintesis);
}

/* ═══ Recorrido de backpropagation, con números de verdad ═══
   Todo lo que muestra el diagrama sale de estas cuentas: no hay ningún valor
   escrito a mano. Es el punto del tema —el error se REPARTE, y el reparto es
   una multiplicación por el camino— y con números inventados no se puede
   comprobar. Acá se puede: sumar a mano las contribuciones da el gradiente.

   La red es la más chica que todavía tiene todo lo que hay que explicar: dos
   entradas, dos neuronas ocultas con sigmoide, una salida lineal y error
   cuadrático. Con una sola neurona oculta no se ve el reparto; con tres, las
   cuentas dejan de entrar en la cabeza. */

const ENTRADA = { x1: 1.0, x2: 0.5 };
const OBJETIVO = 1.0;
const LR = 0.5;
const PESOS_INICIALES = { w11: 0.5, w12: -0.4, w21: 0.8, w22: 0.3, v1: 1.2, v2: -0.7 };

const sigmoide = (z) => 1 / (1 + Math.exp(-z));

/* Una pasada completa: hacia adelante y hacia atrás, devolviendo TODOS los
   intermedios. El diagrama los va destapando de a uno; tenerlos todos desde el
   principio es lo que permite ir para atrás en los pasos sin recalcular. */
function pasada(p) {
  const { x1, x2 } = ENTRADA;

  // Hacia adelante
  const z1 = p.w11 * x1 + p.w21 * x2;
  const z2 = p.w12 * x1 + p.w22 * x2;
  const h1 = sigmoide(z1);
  const h2 = sigmoide(z2);
  const y = p.v1 * h1 + p.v2 * h2;
  const L = (y - OBJETIVO) ** 2;

  // Hacia atrás. Cada línea es un eslabón de la regla de la cadena.
  const dL_dy = 2 * (y - OBJETIVO);
  const dL_dv1 = dL_dy * h1;
  const dL_dv2 = dL_dy * h2;
  // Lo que le llega a cada neurona oculta es el error de la salida MULTIPLICADO
  // por el peso del camino que los une. Ese producto es, literalmente, "cuánto
  // de este error viene por acá".
  const dL_dh1 = dL_dy * p.v1;
  const dL_dh2 = dL_dy * p.v2;
  // Y para cruzar la sigmoide hay que multiplicar por su derivada, h(1-h), que
  // nunca pasa de 0.25: acá empieza el gradiente que se desvanece.
  const dL_dz1 = dL_dh1 * h1 * (1 - h1);
  const dL_dz2 = dL_dh2 * h2 * (1 - h2);
  const dL_dw11 = dL_dz1 * x1, dL_dw21 = dL_dz1 * x2;
  const dL_dw12 = dL_dz2 * x1, dL_dw22 = dL_dz2 * x2;

  const grad = { w11: dL_dw11, w12: dL_dw12, w21: dL_dw21, w22: dL_dw22, v1: dL_dv1, v2: dL_dv2 };
  const nuevos = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v - LR * grad[k]]));

  return { z1, z2, h1, h2, y, L, dL_dy, dL_dh1, dL_dh2, dL_dz1, dL_dz2, grad, nuevos };
}

const num = (v) => (Math.abs(v) < 0.005 && v !== 0 ? v.toExponential(1) : v.toFixed(2));

function montarBackprop() {
  const fig = document.getElementById("d-backprop");
  if (!fig || typeof Diagramas === "undefined") return;
  const svg = fig.querySelector("svg");

  let pesos = { ...PESOS_INICIALES };
  let r = pasada(pesos);

  const ponerValor = (n, txt) => { const t = svg.querySelector(`[data-v="${n}"]`); if (t) t.textContent = txt; };
  const ponerPeso = (n, txt) => { const t = svg.querySelector(`[data-p="${n}"]`); if (t) t.textContent = txt; };
  /* El gradiente va FUERA del círculo, en su propia línea. Adentro no entra:
     "∂L/∂h₁ = −1.09" mide más que el diámetro del nodo y se montaba encima del
     nombre. Afuera además se ven las dos cosas a la vez —la activación y su
     gradiente— que es justo la comparación que el tema quiere que se haga. */
  const ponerGrad = (n, txt) => { const t = svg.querySelector(`[data-g="${n}"]`); if (t) t.textContent = txt || ""; };

  /* `pintar` deja el SVG en el estado del paso i ENTERO: primero borra todas
     las marcas y después enciende las del paso. Sin ese borrado, ir para atrás
     dejaría encendido lo del paso siguiente. */
  function pintar(i) {
    svg.querySelectorAll(".bp-nodo, .bp-arista, .bp-peso").forEach(el => {
      el.setAttribute("class", el.getAttribute("class").replace(/\s*\b(activo|grad|apagado)\b/g, ""));
    });
    svg.querySelector("#bp-vuelta").setAttribute("class", "bp-vuelta");

    const encender = (sel, marca) => svg.querySelectorAll(sel).forEach(el =>
      el.setAttribute("class", `${el.getAttribute("class")} ${marca}`));

    // Los pesos se muestran siempre; los valores se destapan a medida que la
    // pasada hacia adelante los va calculando.
    for (const [k, v] of Object.entries(pesos)) ponerPeso(k, num(v));
    ponerValor("x1", num(ENTRADA.x1));
    ponerValor("x2", num(ENTRADA.x2));
    ponerValor("h1", i >= 1 ? num(r.h1) : "—");
    ponerValor("h2", i >= 1 ? num(r.h2) : "—");
    ponerValor("y", i >= 2 ? num(r.y) : "—");
    ponerValor("L", i >= 3 ? num(r.L) : "—");
    for (const n of ["x1", "x2", "h1", "h2", "y", "L"]) ponerGrad(n, "");

    if (i === 0) encender('.bp-nodo[data-n="x1"], .bp-nodo[data-n="x2"]', "activo");

    if (i === 1) {
      encender('.bp-nodo[data-n="h1"], .bp-nodo[data-n="h2"]', "activo");
      encender('.bp-arista[data-w="w11"], .bp-arista[data-w="w12"], .bp-arista[data-w="w21"], .bp-arista[data-w="w22"]', "activo");
      encender('.bp-peso[data-p="w11"], .bp-peso[data-p="w12"], .bp-peso[data-p="w21"], .bp-peso[data-p="w22"]', "activo");
    }
    if (i === 2) {
      encender('.bp-nodo[data-n="y"]', "activo");
      encender('.bp-arista[data-w="v1"], .bp-arista[data-w="v2"]', "activo");
      encender('.bp-peso[data-p="v1"], .bp-peso[data-p="v2"]', "activo");
    }
    if (i === 3) {
      encender('.bp-nodo[data-n="L"]', "activo");
      encender('.bp-arista[data-w="L"]', "activo");
    }

    // A partir del paso 4 se va para atrás: el arco de vuelta se enciende y las
    // etiquetas de peso pasan a mostrar su GRADIENTE, en el color de error.
    if (i >= 4) svg.querySelector("#bp-vuelta").setAttribute("class", "bp-vuelta activo");

    /* En la vuelta lo que se muestra es ACUMULATIVO: una vez que un nodo pasó a
       mostrar su gradiente, se queda así hasta el final del recorrido. Cuando
       cada paso volvía a poner la activación en los nodos anteriores, el nodo ŷ
       mostraba ∂L/∂ŷ en el paso 5 y volvía a "0.55" en el 6, justo mientras la
       nota explicaba que ∂L/∂v₁ sale de multiplicar ESE número por h₁: el valor
       citado ya no estaba en pantalla. */
    if (i >= 4 && i <= 7) {
      encender('.bp-nodo[data-n="y"]', "grad");
      ponerGrad("y", `∂L/∂ŷ = ${num(r.dL_dy)}`);
    }
    if (i === 4) encender('.bp-nodo[data-n="L"]', "grad");

    if (i >= 5 && i <= 7) {
      encender('.bp-arista[data-w="v1"], .bp-arista[data-w="v2"]', "grad");
      encender('.bp-peso[data-p="v1"], .bp-peso[data-p="v2"]', "grad");
      ponerPeso("v1", num(r.grad.v1));
      ponerPeso("v2", num(r.grad.v2));
    }
    if (i >= 6 && i <= 7) {
      encender('.bp-nodo[data-n="h1"], .bp-nodo[data-n="h2"]', "grad");
      ponerGrad("h1", `∂L/∂h₁ = ${num(r.dL_dh1)}`);
      ponerGrad("h2", `∂L/∂h₂ = ${num(r.dL_dh2)}`);
    }
    if (i === 7) {
      encender('.bp-arista[data-w="w11"], .bp-arista[data-w="w12"], .bp-arista[data-w="w21"], .bp-arista[data-w="w22"]', "grad");
      encender('.bp-peso[data-p="w11"], .bp-peso[data-p="w12"], .bp-peso[data-p="w21"], .bp-peso[data-p="w22"]', "grad");
      for (const k of ["w11", "w12", "w21", "w22"]) ponerPeso(k, num(r.grad[k]));
    }
    if (i === 8) {
      // El paso donde se cierra el círculo: los pesos se mueven y la pérdida
      // baja. Sin mostrar la pérdida nueva, backprop parece un ritual.
      encender('.bp-nodo[data-n="L"]', "activo");
      for (const [k, v] of Object.entries(r.nuevos)) ponerPeso(k, num(v));
      ponerValor("L", num(r.L));
      ponerGrad("L", `baja a ${num(pasada(r.nuevos).L)}`);
    }
  }

  const PASOS = [
    { rotulo: "Las entradas",
      nota: `Entra un solo ejemplo: x₁ = ${num(ENTRADA.x1)} y x₂ = ${num(ENTRADA.x2)}. El objetivo es ${num(OBJETIVO)}. Los seis números sobre las flechas son los pesos, y arrancan en cualquier lado.` },
    { rotulo: "Adelante · capa oculta",
      nota: `Cada neurona suma sus entradas por sus pesos y le aplica la sigmoide. h₁ = σ(${num(PESOS_INICIALES.w11)}·${num(ENTRADA.x1)} + ${num(PESOS_INICIALES.w21)}·${num(ENTRADA.x2)}) = ${num(r.h1)}.` },
    { rotulo: "Adelante · la predicción",
      nota: `La salida combina las dos activaciones con sus pesos: ŷ = ${num(PESOS_INICIALES.v1)}·${num(r.h1)} + ${num(PESOS_INICIALES.v2)}·${num(r.h2)} = ${num(r.y)}.` },
    { rotulo: "La pérdida",
      nota: `Se compara contra el objetivo: L = (${num(r.y)} − ${num(OBJETIVO)})² = ${num(r.L)}. Acá termina la ida. Todo lo que sigue es repartir este número.` },
    { rotulo: "Atrás · el error en la salida",
      nota: `Se empieza por el final: ∂L/∂ŷ = 2·(ŷ − y) = ${num(r.dL_dy)}. Es la única derivada que se calcula directo; todas las demás salen de multiplicar esta por el camino.` },
    { rotulo: "Atrás · los pesos de salida",
      nota: `El gradiente de un peso es el error que le llega por su activación: ∂L/∂v₁ = ${num(r.dL_dy)} · ${num(r.h1)} = ${num(r.grad.v1)}. La neurona que más se activó recibe la mayor parte de la culpa.` },
    { rotulo: "Atrás · el error cruza a la capa oculta",
      nota: `Cada neurona oculta recibe el error multiplicado por el peso que la conecta: ∂L/∂h₁ = ${num(r.dL_dy)} · ${num(PESOS_INICIALES.v1)} = ${num(r.dL_dh1)}. Ese producto es todo backpropagation.` },
    { rotulo: "Atrás · los pesos de entrada",
      nota: `Para cruzar la sigmoide se multiplica por su derivada h(1−h), que nunca supera 0.25. Mirá cuánto más chicos son estos gradientes que los de la salida: eso, repetido veinte capas, es el gradiente que se desvanece.` },
    { rotulo: "El paso: los pesos se mueven",
      nota: `Cada peso resta su gradiente por el learning rate (${num(LR)}). La pérdida baja de ${num(r.L)} a ${num(pasada(r.nuevos).L)}. Eso es una iteración; entrenar es repetirla miles de veces.` }
  ];

  const ctrl = Diagramas.montarPasos(fig, PASOS, pintar);

  /* El botón que cierra el bucle: adopta los pesos nuevos y vuelve a empezar.
     Es lo que convierte el diagrama de "una explicación" en "un entrenamiento":
     apretándolo varias veces se ve la pérdida caer de verdad. */
  if (ctrl) {
    const barra = fig.querySelector(".dg-ctrl");
    const otra = document.createElement("button");
    otra.type = "button";
    otra.className = "pill dg-b";
    otra.textContent = "↻ Otra iteración";
    otra.title = "Adopta los pesos nuevos y vuelve a empezar";
    otra.addEventListener("click", () => {
      pesos = { ...r.nuevos };
      r = pasada(pesos);
      ctrl.ir(0);
    });
    barra.insertBefore(otra, barra.querySelector(".dg-marcas"));
  }
}

montarEjercicios();
montarProgresoLectura();
try { montarBackprop(); } catch (e) { console.warn("backprop:", e); }
