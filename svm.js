/* Pegamento del tema 16. Solo toca `document`, no se testea con node --test. */

const SLUG = "svm";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "sv-c1",
      q: "Entrenaste una SVM sobre 5.000 filas y quedaron 47 vectores de soporte. Movés un punto que NO es vector de soporte, alejándolo del margen. ¿Qué le pasa a la frontera?",
      opts: [
        "Se corre un poco, porque todos los puntos influyen en el resultado",
        "No cambia en absoluto: solo los vectores de soporte definen la frontera",
        "Cambia solo si el punto pertenece a la clase minoritaria",
        "Se vuelve inválida y hay que reentrenar desde cero"
      ],
      c: 1,
      expl: "Es la propiedad que le da nombre al método. Mientras el punto no invada la franja del margen, es irrelevante para la frontera: podrías borrarlo y obtener exactamente la misma SVM. Compará con KNN, donde cada punto guardado participa de cada predicción." },

    { tipo: "mcq", id: "sv-c2",
      q: "Tu SVM con kernel RBF sobreajusta. ¿Qué hacés con C y con gamma?",
      opts: [
        "Subir los dos, para que el modelo aprenda mejor",
        "Bajar los dos: menos C tolera más violaciones del margen, y menos gamma hace la frontera más suave",
        "Subir C y bajar gamma",
        "Dejarlos y cambiar a kernel polinomial"
      ],
      c: 1,
      expl: "C grande casi no tolera errores y retuerce la frontera para acomodar cada punto; gamma grande hace que cada punto influya solo en su vecindad inmediata, lo que produce islas alrededor de puntos individuales. Los dos empujan hacia overfitting, así que contra eso van los dos para abajo. Y se buscan juntos, porque interactúan." },

    { tipo: "num", id: "sv-n1",
      q: "Dos puntos son [1, 2] y [3, 1]. Un kernel polinomial de grado 2 se calcula como (a · b + 1)², donde a · b es el producto punto. ¿Cuánto vale?",
      resp: 36, tol: 0.01,
      trampas: [
        { val: 25, msg: "Te olvidaste del +1 antes de elevar al cuadrado: 5² = 25. La fórmula es (producto punto + 1) al cuadrado." },
        { val: 6, msg: "Ese es el producto punto más 1, sin elevar al cuadrado. Falta el último paso, que es el que corresponde al grado 2." }
      ],
      expl: "El producto punto es 1×3 + 2×1 = 5. Después (5 + 1)² = 36. Ese único número es lo que la SVM necesita del espacio de más dimensiones: nunca calculó las coordenadas de ninguno de los dos puntos allá. Eso es el truco del kernel en una cuenta." },

    { tipo: "parsons", id: "sv-p1",
      q: "Armá la búsqueda conjunta de C y gamma para una SVM con RBF. Sobra una línea: descartala con ×.",
      lineas: [
        "pipe = Pipeline([('escala', StandardScaler()), ('svm', SVC(kernel='rbf'))])",
        "grilla = {'svm__C': [0.1, 1, 10, 100], 'svm__gamma': [0.001, 0.01, 0.1, 1]}",
        "busqueda = GridSearchCV(pipe, grilla, cv=5)",
        "busqueda.fit(X_train, y_train)"
      ],
      distractores: ["grilla = {'svm__C': [0.1, 1, 10, 100]}"],
      expl: "La grilla tiene que incluir los DOS hiperparámetros a la vez: GridSearchCV prueba todas las combinaciones, que es lo que hace falta porque el mejor C depende del gamma y viceversa. Buscando solo C, gamma se queda en su valor por defecto y podés estar comparando cuatro modelos malos entre sí." },

    { tipo: "python", id: "sv-py1",
      q: "Comprobá el truco del kernel. Calculá el kernel polinomial de grado 2 entre dos puntos, y después el producto punto de sus proyecciones explícitas a 3 dimensiones. Imprimí los dos: print(k, p).",
      inicial: `import numpy as np

a = np.array([1.0, 2.0])
b = np.array([3.0, 1.0])

# Completá: el kernel, calculado en 2 dimensiones.
# Es (a @ b + 1) elevado al cuadrado.
k = None

# La proyección explícita que ese kernel representa (una versión
# simplificada, con solo tres de sus términos):
def proyectar(v):
    return np.array([v[0]**2, v[1]**2, np.sqrt(2) * v[0] * v[1]])

# Completá: el producto punto de las dos proyecciones.
p = None

# Completá: imprimí int(k) y int(round(p))
`,
      paquetes: ["numpy"],
      esperado: "36 25",
      expl: "El kernel da 36 y esta proyección parcial da 25: la diferencia son los términos que la versión simplificada dejó afuera (los lineales y la constante que aporta el +1). Con la proyección completa los dos números coinciden exactamente. El punto es que el kernel llegó a su resultado en dos multiplicaciones sobre las coordenadas originales, mientras que proyectar exigió construir un vector nuevo para cada punto: con un kernel de dimensión infinita, como RBF, esa construcción directamente no se puede hacer." }
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
Anim.dibujar("#d-margen");
Anim.aparecer("#d-margen");
Anim.dibujar("#d-kernel");
Anim.aparecer("#d-kernel");
