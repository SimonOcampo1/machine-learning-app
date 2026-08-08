/* Pegamento del tema 08. Solo toca `document`, no se testea con node --test. */

const SLUG = "sesgo-varianza";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "sv-c1",
      q: "Tu modelo tiene 0.98 de acierto en entrenamiento y 0.71 en validación. ¿Qué pasa y qué hacés?",
      opts: [
        "Underfitting: hay que usar un modelo más complejo",
        "Overfitting: hay que regularizar, simplificar el modelo o conseguir más datos",
        "Está bien: 0.98 en entrenamiento es un resultado excelente",
        "Hay un bug: esos dos números no pueden darse a la vez"
      ],
      c: 1,
      expl: "Train bajo en error y validación alto es la firma del overfitting: el modelo memorizó los datos de entrenamiento, ruido incluido. La brecha de 0.27 es enorme. Contra esto va menos complejidad o más filas, nunca más características." },

    { tipo: "mcq", id: "sv-c2",
      q: "Graficás la curva de aprendizaje y ves que los errores de train y validación ya convergieron, juntos, en un valor alto. ¿Conviene conseguir más datos?",
      opts: [
        "Sí: más datos siempre mejoran cualquier modelo",
        "No: las curvas ya se juntaron, así que el problema es sesgo alto y hay que cambiar de modelo",
        "Sí, pero solo si además se regulariza",
        "No se puede saber sin ver el error de test"
      ],
      c: 1,
      expl: "Cuando las dos curvas convergen, el modelo ya aprendió todo lo que su forma le permite: más datos no mueven nada. Eso es sesgo alto y se combate con un modelo más flexible o mejores características. Es justamente la pregunta que las curvas de aprendizaje existen para responder, y se ahorra meses de etiquetado inútil." },

    { tipo: "num", id: "sv-n1",
      q: "Modelo A: 0.95 en train y 0.82 en validación. Modelo B: 0.86 en train y 0.84 en validación. ¿Cuánto vale la brecha de generalización del modelo A? Redondeá a dos decimales.",
      resp: 0.13, tol: 0.005,
      trampas: [
        { val: 0.02, msg: "Esa es la brecha del modelo B, que es el sano. La pregunta es por la de A, que es 0.95 − 0.82." },
        { val: 0.11, msg: "Restaste la validación de A menos la de B, o algo por el estilo. La brecha se calcula dentro de un mismo modelo: su error de train contra su error de validación." }
      ],
      expl: "0.95 − 0.82 = 0.13, contra 0.02 de B. Aunque A puntúa 0.82 y B 0.84, lo que decide no es solo el número de validación: la brecha grande de A dice que está siguiendo ruido, y en producción el ruido es otro. B es el que conviene poner." },

    { tipo: "parsons", id: "sv-p1",
      q: "Armá una función que diagnostique el estado de un modelo a partir de sus dos errores. Sobra una línea: descartala con ×.",
      lineas: [
        "def diagnostico(err_train, err_val, umbral=0.1):",
        "    if err_train > umbral:",
        "        return 'underfitting'",
        "    if err_val - err_train > umbral:",
        "        return 'overfitting'",
        "    return 'bien'"
      ],
      distractores: ["    if err_train - err_val > umbral:"],
      expl: "El overfitting se detecta cuando validación es PEOR que train, o sea err_val − err_train. Con la resta al revés estarías buscando el caso imposible de la cuarta fila de la tabla, que casi siempre es un bug y no un modelo. Fijate además que underfitting se chequea primero: si el error de train ya es alto, no hace falta mirar la brecha." },

    { tipo: "python", id: "sv-py1",
      q: "Diagnosticá tres modelos a partir de sus errores. Imprimí las tres brechas redondeadas a dos decimales y cuál elegirías: print(round(g1,2), round(g2,2), round(g3,2), mejor).",
      inicial: `# error de train, error de validación
modelos = {
    "A": (0.05, 0.28),
    "B": (0.24, 0.26),
    "C": (0.14, 0.17),
}

# Completá: la brecha de cada uno (validación menos train).
g1 = None   # A
g2 = None   # B
g3 = None   # C

# Completá: el nombre del modelo con MENOR error de validación.
mejor = None

# Completá: imprimí round(g1,2), round(g2,2), round(g3,2) y mejor
`,
      esperado: "0.23 0.02 0.03 C",
      expl: "A memoriza (brecha 0.23), B no aprendió lo suficiente (los dos errores altos, aunque la brecha sea mínima), y C está sano: brecha chica y el mejor error de validación. Fijate que la brecha sola no alcanza para elegir, porque B la tiene casi tan chica como C y sin embargo es peor: hay que mirar los dos números juntos." }
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
Anim.dibujar("#d-grados");
Anim.aparecer("#d-grados");
Anim.dibujar("#d-u");
Anim.aparecer("#d-u");
