/* Pegamento del tema 12. Solo toca `document`, no se testea con node --test. */

const SLUG = "logistica";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "lo-c1",
      q: "¿Por qué no se usa una regresión lineal común para predecir si un mail es spam o no?",
      opts: [
        "Porque la regresión lineal solo funciona con una única característica",
        "Porque predice cualquier número real, incluidos valores negativos y mayores que 1, que no se pueden leer como probabilidad; y un punto lejano corre la recta entera",
        "Porque la regresión lineal es mucho más lenta de entrenar",
        "Porque no se le pueden pasar variables categóricas"
      ],
      c: 1,
      expl: "Con etiquetas 0 y 1, la recta pasa por debajo de 0 y por arriba de 1, y no hay forma honesta de leer −0,3 como probabilidad. Peor: un mail clarísimamente spam pero muy alejado arrastra la recta y empeora la clasificación de todos los demás." },

    { tipo: "mcq", id: "lo-c2",
      q: "Tu modelo devuelve 0.62 para un mail. Con umbral 0.5 lo clasifica como spam. ¿Qué significa mover el umbral a 0.9?",
      opts: [
        "Que el modelo se vuelve más preciso, porque se entrena mejor",
        "Que hacen falta más datos para que el modelo llegue a 0.9",
        "Que se vuelve más exigente para marcar spam: menos falsos positivos, pero se le escapan más spams reales",
        "Que la sigmoide cambia de forma y se hace más empinada"
      ],
      c: 2,
      expl: "El umbral no toca el modelo: las probabilidades salen iguales. Solo cambia dónde cortás. Subirlo pide más evidencia para acusar a un mail de spam, así que mandás menos mails buenos a la basura y dejás pasar más spam. Es una decisión de negocio, no del modelo, y el tema 13 la desarrolla con precisión y recall." },

    { tipo: "num", id: "lo-n1",
      q: "Un modelo calcula z = −4 + 0.05 × m², donde m² son los metros cuadrados. Para una casa de 100 m², ¿qué probabilidad devuelve la sigmoide? Redondeá a dos decimales.",
      resp: 0.73, tol: 0.015,
      trampas: [
        { val: 1, msg: "Ese es z, el número que entra a la sigmoide, no la probabilidad que sale. La sigmoide todavía tiene que aplastarlo al intervalo (0, 1): sigmoide(1) = 0.73." },
        { val: 0.5, msg: "0.5 es lo que devuelve la sigmoide cuando z vale exactamente 0, que es el punto de la frontera de decisión. Acá z = 1, no 0." }
      ],
      expl: "z = −4 + 0.05 × 100 = 1. Y sigmoide(1) = 1 / (1 + e⁻¹) = 0.73. Fijate que la frontera está donde z = 0, o sea en 80 m²: por debajo el modelo dice una clase y por encima la otra." },

    { tipo: "parsons", id: "lo-p1",
      q: "Armá la función que convierte las características en una probabilidad. Sobra una línea: descartala con ×.",
      lineas: [
        "def sigmoide(z):",
        "    return 1 / (1 + np.exp(-z))",
        "",
        "def probabilidad(X, beta):",
        "    return sigmoide(X @ beta)"
      ],
      distractores: ["    return sigmoide(X * beta)"],
      expl: "Es el producto matricial del tema 03, no el elemento a elemento: hace falta que cada fila se colapse en un solo número antes de entrar a la sigmoide. Con el asterisco sale una matriz entera de probabilidades, una por celda, y no da error." },

    { tipo: "python", id: "lo-py1",
      q: "Calculá las probabilidades de cuatro casas y clasificalas con umbral 0.5. Imprimí cuántas quedan en la clase 1 y la probabilidad de la primera redondeada a dos decimales: print(int(clases.sum()), round(float(probs[0]), 2)).",
      inicial: `import numpy as np

# Una sola característica: metros cuadrados.
m2 = np.array([100, 60, 85, 120], dtype=float)
beta0, beta1 = -4.0, 0.05

def sigmoide(z):
    return 1 / (1 + np.exp(-z))

# Completá: calculá z para las cuatro casas.
z = None

# Completá: pasalo por la sigmoide.
probs = None

# Completá: clasificá con umbral 0.5. (probs > 0.5) da booleanos;
# .astype(int) los convierte en 0 y 1.
clases = None

# Completá: imprimí int(clases.sum()) y round(float(probs[0]), 2)
`,
      paquetes: ["numpy"],
      esperado: "3 0.73",
      expl: "Tres casas superan los 80 m², que es donde z cruza el cero, así que quedan en la clase 1. La de 60 m² da z = −1 y probabilidad 0.27, por debajo del umbral. Cambiá el umbral a 0.9 y vas a ver que solo sobrevive la de 120 m²: el modelo no se tocó, solo se movió el corte." }
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
Anim.dibujar("#d-recta");
Anim.aparecer("#d-recta");
Anim.dibujar("#d-sigmoide");
Anim.aparecer("#d-sigmoide");
Anim.dibujar("#d-frontera");
Anim.aparecer("#d-frontera");
