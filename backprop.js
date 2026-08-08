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

montarEjercicios();
montarProgresoLectura();

/* Animaciones: decorativas, van al final. */
Anim.dibujar("#d-backprop");
Anim.aparecer("#d-backprop");
