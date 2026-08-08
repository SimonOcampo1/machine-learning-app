/* Pegamento del tema 14. Solo toca `document`, no se testea con node --test. */

const SLUG = "knn";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "kn-c1",
      q: "Tu KNN sobreajusta: acierta casi todo en entrenamiento y bastante menos en validación. ¿Qué hacés con k?",
      opts: [
        "Bajarlo, porque menos vecinos es un modelo más simple",
        "Subirlo, porque más vecinos suaviza la frontera y hace el modelo menos flexible",
        "Dejarlo igual y agregar más características",
        "Dejarlo igual y quitar la estandarización"
      ],
      c: 1,
      expl: "En KNN la dirección va al revés que en casi todos los modelos: más k es MENOS complejo. Con k = 1 la frontera sigue cada punto individual, ruido incluido; subiéndolo, cada predicción promedia más opiniones y la frontera se suaviza." },

    { tipo: "mcq", id: "kn-c2",
      q: "¿Por qué se dice que KNN es un modelo no paramétrico?",
      opts: [
        "Porque no tiene ningún hiperparámetro que configurar",
        "Porque lo que el modelo guarda crece con la cantidad de datos: se queda con el dataset entero",
        "Porque no usa números, solo comparaciones",
        "Porque no hace falta estandarizar sus entradas"
      ],
      c: 1,
      expl: "No paramétrico no significa «sin parámetros». Una regresión lineal guarda los mismos dos coeficientes con cinco filas o con un millón; KNN con un millón de filas guarda un millón de filas. Sí tiene hiperparámetro, que es k, y sí hay que estandarizar." },

    { tipo: "num", id: "kn-n1",
      q: "Casa A es [85, 3] y casa B es [120, 4], en metros cuadrados y ambientes. ¿Cuánto vale la distancia euclídea entre las dos? Redondeá a dos decimales.",
      resp: 35.01, tol: 0.02,
      trampas: [
        { val: 36, msg: "Sumaste las diferencias en vez de aplicar Pitágoras: 35 + 1. La distancia euclídea eleva cada diferencia al cuadrado, suma, y saca la raíz." },
        { val: 1226, msg: "Ese es el valor antes de sacar la raíz cuadrada: 35² + 1². Falta el último paso." }
      ],
      expl: "√(35² + 1²) = √1226 = 35.01. Fijate cuánto aportó cada columna: 1225 los metros cuadrados y 1 los ambientes. La segunda variable es, en la práctica, invisible. Ese es el motivo por el que hay que estandarizar." },

    { tipo: "parsons", id: "kn-p1",
      q: "Armá un KNN sin fuga de datos, eligiendo k por validación cruzada. Sobra una línea: descartala con ×.",
      lineas: [
        "pipe = Pipeline([('escala', StandardScaler()), ('knn', KNeighborsClassifier())])",
        "grilla = {'knn__n_neighbors': [1, 3, 5, 7, 9, 11]}",
        "busqueda = GridSearchCV(pipe, grilla, cv=5)",
        "busqueda.fit(X_train, y_train)"
      ],
      distractores: ["knn = KNeighborsClassifier().fit(X_train, y_train)"],
      expl: "El distractor entrena KNN directo sobre los datos crudos: sin escalar, la columna de unidades más grandes se lleva la distancia entera. Fijate además que los k probados son todos impares, para que en clasificación binaria no haya empates." },

    { tipo: "python", id: "kn-py1",
      q: "Mostrá cuánto cambia la distancia al estandarizar. Imprimí la distancia cruda entre las dos casas y la distancia después de estandarizar, redondeadas a dos decimales: print(round(d_cruda,2), round(d_std,2)).",
      inicial: `import numpy as np

X = np.array([[85, 3], [120, 4], [60, 2], [95, 3]], dtype=float)
a, b = X[0], X[1]

# Completá: distancia euclídea entre a y b con los datos crudos.
d_cruda = None

# Completá: estandarizá X (restá la media de cada columna y dividí
# por su desvío, los dos con axis=0) y calculá la distancia entre
# las filas 0 y 1 del resultado.
Xs = None
d_std = None

# Completá: imprimí round(d_cruda,2) y round(d_std,2)
`,
      paquetes: ["numpy"],
      esperado: "35.01 2.16",
      expl: "Cruda da 35.01 y está compuesta casi enteramente por los metros cuadrados: 1225 contra 1. Estandarizada da 2.16, y ahí las dos columnas aportan casi lo mismo (1.63 y 1.41 de diferencia). Es el mismo par de casas; lo único que cambió es que ahora la distancia mide parecido en lugar de medir unidades." }
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
Anim.dibujar("#d-vecinos");
Anim.aparecer("#d-vecinos");
