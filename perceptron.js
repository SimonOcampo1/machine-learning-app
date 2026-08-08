/* Pegamento del tema 22. Solo toca `document`, no se testea con node --test. */

const SLUG = "perceptron";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "pe-c1",
      q: "Armás una red de seis capas y no le ponés ninguna función de activación. ¿Qué modelo tenés?",
      opts: [
        "Una red profunda que va a aprender representaciones jerárquicas",
        "Un modelo matemáticamente equivalente a UNA sola capa lineal: las seis capas no aportan nada",
        "Un modelo que no puede entrenarse porque falta la activación",
        "Una red que solo funciona para regresión, no para clasificación"
      ],
      c: 1,
      expl: "La composición de transformaciones lineales es otra transformación lineal, así que las seis capas se pueden reescribir como una con otros pesos. Entrena, converge y predice sin fallar, pero tenés una regresión lineal cara. La no linealidad es lo único que hace que la profundidad sirva." },

    { tipo: "mcq", id: "pe-c2",
      q: "¿Por qué ReLU reemplazó a la sigmoide en las capas ocultas?",
      opts: [
        "Porque produce salidas entre 0 y 1, que son más fáciles de interpretar",
        "Porque para valores positivos su derivada es exactamente 1, así que la señal de aprendizaje no se atenúa al atravesar muchas capas",
        "Porque es la única activación no lineal que existe",
        "Porque permite usar redes sin sesgo"
      ],
      c: 1,
      expl: "La sigmoide es casi plana en los extremos, y una función casi plana tiene derivada casi nula: al atravesar muchas capas, esas derivadas chiquitas se multiplican y la señal desaparece. Es el gradiente que se desvanece del tema siguiente. ReLU no tiene ese problema del lado positivo, y además es más barata de calcular." },

    { tipo: "num", id: "pe-n1",
      q: "Una neurona tiene pesos [0.5, −0.3], sesgo 0.1 y activación ReLU. Las entradas son [4, 2]. ¿Cuánto sale?",
      resp: 1.5, tol: 0.01,
      trampas: [
        { val: 1.4, msg: "Te olvidaste del sesgo. La cuenta es (0.5×4) + (−0.3×2) + 0.1, y ese +0.1 del final es el sesgo." },
        { val: 2.6, msg: "Sumaste el segundo término en vez de restarlo. El peso es −0.3, así que −0.3 × 2 aporta −0.6, no +0.6." }
      ],
      expl: "0.5×4 + (−0.3)×2 + 0.1 = 2 − 0.6 + 0.1 = 1.5. Como es positivo, ReLU lo deja pasar tal cual. Si hubiera dado negativo, ReLU habría devuelto 0. Fijate que lo de adentro es el producto punto del tema 03 más una constante: nada nuevo." },

    { tipo: "parsons", id: "pe-p1",
      q: "Armá una red multicapa que pueda resolver XOR. Sobra una línea: descartala con ×.",
      lineas: [
        "modelo = Sequential()",
        "modelo.add(Dense(4, activation='relu', input_shape=(2,)))",
        "modelo.add(Dense(1, activation='sigmoid'))",
        "modelo.compile(optimizer='adam', loss='binary_crossentropy')"
      ],
      distractores: ["modelo.add(Dense(4, activation='linear', input_shape=(2,)))"],
      expl: "Con activación lineal en la capa oculta, la red entera colapsa a un modelo lineal y XOR sigue sin poder resolverse por más neuronas que le pongas. ReLU en las ocultas y sigmoide en la salida, que es donde sí se quiere una probabilidad entre 0 y 1." },

    { tipo: "python", id: "pe-py1",
      q: "Comprobá que apilar capas lineales no agrega nada. Pasá una entrada por dos capas lineales, y después por la única capa equivalente. Imprimí los dos resultados: print(round(dos_capas,4), round(una_capa,4)).",
      inicial: `import numpy as np

x = np.array([1.0, 2.0])
W1 = np.array([[0.5, -0.3], [0.2, 0.8]])
W2 = np.array([[1.5, -0.5], [0.4, 1.2]])

# Completá: pasá x por las dos capas, SIN activación entre ellas.
h = x @ W1
dos_capas = None      # h @ W2, y quedate con la primera componente

# Completá: la matriz de UNA sola capa equivalente es W1 @ W2.
W_equiv = None
una_capa = None       # x @ W_equiv, primera componente

# Completá: imprimí round(float(dos_capas),4) y round(float(una_capa),4)
`,
      paquetes: ["numpy"],
      esperado: "1.87 1.87",
      expl: "Los dos números son idénticos, y no por casualidad: (x @ W1) @ W2 es lo mismo que x @ (W1 @ W2). Toda la pila de capas lineales se reduce a una sola matriz. Metele una ReLU entre las dos capas y los resultados dejan de coincidir: ahí recién la segunda capa está haciendo algo que la primera no podía." }
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
Anim.dibujar("#d-xor");
Anim.aparecer("#d-xor");
Anim.dibujar("#d-capas");
Anim.aparecer("#d-capas");
