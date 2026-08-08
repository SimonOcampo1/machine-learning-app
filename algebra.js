/* Pegamento del tema 03. Solo toca `document`, no se testea con node --test. */

const SLUG = "algebra";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "al-c1",
      q: "¿Qué devuelve el producto punto entre dos vectores de dos componentes?",
      opts: [
        "Un vector de dos componentes",
        "Un solo número",
        "Una matriz de 2 por 2",
        "Depende de si los vectores son fila o columna"
      ],
      c: 1,
      expl: "Se multiplican los pares que están en la misma posición y se suma todo, así que colapsa a un escalar. Es justamente eso lo que lo vuelve útil: ese número es la predicción de un modelo lineal." },

    { tipo: "mcq", id: "al-c2",
      q: "X tiene forma (4, 2) y beta tiene forma (2,). ¿Qué forma tiene X @ beta y qué significa?",
      opts: [
        "(4, 2), porque se multiplica cada fila por beta y se conserva la tabla",
        "(2,), una predicción por característica",
        "(4,), una predicción por casa",
        "Un solo número, la predicción del dataset entero"
      ],
      c: 2,
      expl: "Las columnas del primero (2) coinciden con las filas del segundo (2), ese 2 se consume, y queda lo de afuera: (4,). Cada elemento es el producto punto de una fila de X con beta, o sea la predicción de esa casa." },

    { tipo: "num", id: "al-n1",
      q: "Una casa es el vector [60, 2] (60 m² y 2 ambientes) y los coeficientes del modelo son [1200, 50000]. ¿Qué precio predice el modelo?",
      resp: 172000, tol: 0.001,
      trampas: [
        { val: 3002400, msg: "Multiplicaste cruzado: 60×50000 + 2×1200. Cada característica va con SU coeficiente, en la misma posición. Los metros van con el precio por metro." },
        { val: 51200, msg: "Sumaste los coeficientes en vez de usarlos como pesos. El producto punto multiplica primero cada par y recién después suma." }
      ],
      expl: "60×1200 = 72.000 y 2×50000 = 100.000. Sumados dan 172.000. Eso es el producto punto, y es exactamente lo que hace un modelo lineal al predecir." },

    { tipo: "parsons", id: "al-p1",
      q: "Armá una función que prediga el precio de todas las casas de una matriz. Sobra una línea: descartala con ×.",
      lineas: [
        "def predecir(X, beta):",
        "    return X @ beta"
      ],
      distractores: ["    return X * beta"],
      expl: "El asterisco multiplica elemento por elemento y devuelve una matriz (4, 2) sin sumar nada: no da error, da otra cosa. La arroba hace el producto matricial, que es el que suma cada fila y devuelve una predicción por casa." },

    { tipo: "python", id: "al-py1",
      q: "Calculá las predicciones de las cuatro casas y también la distancia entre las dos primeras. Imprimí la suma de las predicciones y esa distancia redondeada a dos decimales: print(int(predicciones.sum()), round(distancia, 2)).",
      inicial: `import numpy as np

X = np.array([[85, 3], [120, 4], [60, 2], [95, 3]])
beta = np.array([1200, 50000])

# Completá: las predicciones de las cuatro casas, con el producto matricial.
predicciones = None

# Completá: la distancia entre la primera y la segunda casa.
# Es la norma de su diferencia: np.linalg.norm sobre X[0] - X[1].
distancia = None

# Completá: imprimí int(predicciones.sum()) y round(distancia, 2)
`,
      paquetes: ["numpy"],
      esperado: "1032000 35.01",
      expl: "X @ beta da [252000, 344000, 172000, 264000], que suma 1.032.000. La distancia entre [85,3] y [120,4] es la raíz de 35² + 1², o sea 35.01: los metros cuadrados dominan la distancia entera porque están en otra escala. Ese detalle es el que va a obligar a estandarizar en los temas 14 y 16." }
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
Anim.dibujar("#d-suma");
Anim.aparecer("#d-suma");
Anim.dibujar("#d-punto");
Anim.aparecer("#d-punto");
