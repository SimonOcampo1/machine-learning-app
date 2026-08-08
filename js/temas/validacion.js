/* Pegamento del tema 07. Solo toca `document`, no se testea con node --test. */

const SLUG = "validacion";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "va-c1",
      q: "Un árbol de decisión sin límite de profundidad acierta el 100% sobre los datos de entrenamiento. ¿Qué te dice ese número?",
      opts: [
        "Que el modelo es excelente y está listo para producción",
        "Prácticamente nada: cualquier modelo con suficiente capacidad puede memorizar el entrenamiento sin haber aprendido ningún patrón general",
        "Que hay que agregar más datos de entrenamiento",
        "Que las etiquetas están mal puestas"
      ],
      c: 1,
      expl: "El error de entrenamiento siempre se puede llevar a cero: alcanza con aislar cada fila en su propia hoja. Es como sacar diez en un examen que son exactamente los ejercicios de la guía que estudiaste. La única medida que informa es la que se toma sobre datos que el modelo no vio." },

    { tipo: "mcq", id: "va-c2",
      q: "Tenés datos de ventas diarias de tres años y querés predecir las ventas del mes que viene. ¿Cómo separás train y test?",
      opts: [
        "Al azar, con train_test_split y random_state fijo",
        "Al azar pero estratificando por mes",
        "Por fecha: entrenás con los primeros dos años y medio y testeás con los últimos meses",
        "Da igual, mientras el test sea el 25% del total"
      ],
      c: 2,
      expl: "Mezclar al azar deja al modelo entrenando con días futuros para predecir días pasados, algo que en producción es imposible. Los resultados salen espectaculares y no se pueden reproducir. Con orden temporal, el corte va por fecha: se entrena con lo viejo y se testea con lo nuevo." },

    { tipo: "num", id: "va-n1",
      q: "Hacés validación cruzada de 5 pliegues sobre 1.000 filas. ¿Con cuántas filas entrena el modelo en cada una de las cinco vueltas?",
      resp: 800, tol: 0.5,
      trampas: [
        { val: 200, msg: "Esas son las filas del pliegue que hace de validación en esa vuelta. Las otras cuatro quintas partes son las que se usan para entrenar." },
        { val: 1000, msg: "Ese es el dataset completo. En cada vuelta uno de los cinco pliegues se aparta para validar, así que el entrenamiento nunca los ve todos a la vez." }
      ],
      expl: "Cinco pliegues de 200 filas cada uno. En cada vuelta, cuatro pliegues entrenan (800 filas) y uno valida (200). Después de las cinco vueltas, cada fila validó exactamente una vez y entrenó cuatro." },

    { tipo: "parsons", id: "va-p1",
      q: "Ordená un flujo de validación cruzada sin fuga de datos, usando Pipeline. Sobra una línea: descartala con ×.",
      lineas: [
        "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y)",
        "pipe = Pipeline([('escala', StandardScaler()), ('modelo', KNeighborsClassifier())])",
        "puntajes = cross_val_score(pipe, X_train, y_train, cv=5)",
        "print(puntajes.mean(), puntajes.std())"
      ],
      distractores: ["puntajes = cross_val_score(pipe, X, y, cv=5)"],
      expl: "La validación cruzada corre sobre X_train, no sobre X: el test tiene que quedar afuera de todo el proceso de selección. Y el Pipeline es lo que garantiza que el escalador se ajuste dentro de cada pliegue en vez de una sola vez sobre todo, que es la fuga sutil que nadie ve." },

    { tipo: "python", id: "va-py1",
      q: "Compará dos modelos por validación cruzada. Imprimí el promedio de cada uno redondeado a tres decimales y cuál elegirías, así: print(round(m_a, 3), round(m_b, 3), elegido).",
      inicial: `import numpy as np

# Puntajes de 5 pliegues para dos modelos distintos.
a = np.array([0.81, 0.83, 0.80, 0.82, 0.81])
b = np.array([0.65, 0.91, 0.72, 0.88, 0.70])

# Completá: el promedio de cada uno.
m_a = None
m_b = None

# Completá: 'A' si el promedio de a es mayor, si no 'B'.
elegido = None

# Completá: imprimí round(m_a, 3), round(m_b, 3) y elegido
`,
      paquetes: ["numpy"],
      esperado: "0.814 0.772 A",
      expl: "A gana por promedio, pero mirá los desvíos: A varía entre 0.80 y 0.83, B entre 0.65 y 0.91. Aunque B hubiera promediado un poco más, esa inestabilidad significa que su resultado depende muchísimo de qué datos le toquen, y en producción le tocan otros. El promedio solo nunca alcanza: hay que mirar también la dispersión." }
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
Anim.dibujar("#d-cortes");
Anim.aparecer("#d-cortes");
Anim.aparecer("#d-kfold");
