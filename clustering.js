/* Pegamento del tema 20. Solo toca `document`, no se testea con node --test. */

const SLUG = "clustering";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "cl-c1",
      q: "¿Por qué no se puede elegir k minimizando la inercia?",
      opts: [
        "Porque la inercia no se puede calcular para todos los valores de k",
        "Porque siempre baja al subir k, y llega a cero cuando cada punto es su propio grupo",
        "Porque la inercia depende de la inicialización al azar",
        "Porque solo tiene sentido comparar inercias entre datasets distintos"
      ],
      c: 1,
      expl: "Es el mismo problema que el error de entrenamiento del tema 07: una medida que siempre mejora al agregar complejidad no puede servir para elegir cuánta complejidad usar. De ahí que haya que recurrir al codo, a la silueta, o al criterio de que los grupos signifiquen algo." },

    { tipo: "mcq", id: "cl-c2",
      q: "Corrés k-means sobre datos generados completamente al azar, sin ninguna estructura, pidiendo 4 grupos. ¿Qué devuelve?",
      opts: [
        "Un error, porque no hay grupos que encontrar",
        "Un solo grupo con todos los puntos",
        "Cuatro grupos perfectamente descritos, que no significan nada",
        "Cuatro grupos, pero con una advertencia de baja confianza"
      ],
      c: 2,
      expl: "K-means siempre devuelve k grupos: no tiene forma de decir «acá no hay nada». Los centroides salen, los tamaños salen, se les puede poner nombre y armar una presentación. Por eso conviene la verificación de comparar la silueta contra la de datos al azar con las mismas dimensiones." },

    { tipo: "num", id: "cl-n1",
      q: "Un centroide tiene asignados los puntos [2, 4], [4, 6] y [6, 8]. ¿Cuál es la primera coordenada del centroide recalculado?",
      resp: 4, tol: 0.01,
      trampas: [
        { val: 12, msg: "Sumaste sin dividir. El centroide es el PROMEDIO de sus puntos, no la suma." },
        { val: 6, msg: "Ese es el promedio de la segunda coordenada, que da (4+6+8)/3 = 6. La pregunta es por la primera." }
      ],
      expl: "(2 + 4 + 6) / 3 = 4. El centroide recalculado es [4, 6]: el promedio de sus puntos, componente por componente. Ese es todo el paso 3 del algoritmo, y es lo que garantiza que la inercia baje o quede igual en cada vuelta." },

    { tipo: "parsons", id: "cl-p1",
      q: "Armá un clustering con estandarización y varias inicializaciones. Sobra una línea: descartala con ×.",
      lineas: [
        "pipe = Pipeline([('escala', StandardScaler()), ('km', KMeans(n_clusters=4, n_init=10))])",
        "etiquetas = pipe.fit_predict(X)",
        "print('silueta:', silhouette_score(pipe['escala'].transform(X), etiquetas))",
        "print('inercia:', pipe['km'].inertia_)"
      ],
      distractores: ["etiquetas = KMeans(n_clusters=4).fit_predict(X)"],
      expl: "El distractor agrupa sobre datos crudos: como toda la mecánica son distancias, la columna con las unidades más grandes define los grupos ella sola. Fijate además que la silueta se calcula sobre los datos YA escalados, que es el espacio donde el algoritmo trabajó." },

    { tipo: "python", id: "cl-py1",
      q: "Hacé una iteración completa de k-means a mano. Imprimí los dos centroides recalculados: print(c1.tolist(), c2.tolist()).",
      inicial: `import numpy as np

puntos = np.array([[1, 1], [2, 1], [1, 2], [8, 8], [9, 8], [8, 9]], dtype=float)
centroides = np.array([[0, 0], [10, 10]], dtype=float)

# Completá: la distancia de cada punto a cada centroide, y a cuál queda
# más cerca. Te sirve np.linalg.norm(puntos - c, axis=1) por centroide.
d1 = None
d2 = None
asignados_a_1 = None   # una máscara booleana: d1 < d2

# Completá: recalculá cada centroide como el promedio de sus puntos.
c1 = None
c2 = None

# Completá: imprimí c1.tolist() y c2.tolist()
`,
      paquetes: ["numpy"],
      esperado: "[1.3333333333333333, 1.3333333333333333] [8.333333333333334, 8.333333333333334]",
      expl: "Los tres primeros puntos van al centroide de abajo y los tres últimos al de arriba, y cada centroide salta al centro de su grupo. Si volvieras a correr la iteración, las asignaciones no cambiarían y el algoritmo terminaría: con grupos así de separados, k-means converge en una sola vuelta." }
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
Anim.dibujar("#d-kmeans");
Anim.aparecer("#d-kmeans");
