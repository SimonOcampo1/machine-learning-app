/* Pegamento del tema 13. Solo toca `document`, no se testea con node --test. */

const SLUG = "metricas";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "me-c1",
      q: "Un detector de tumores marca de más para no perderse ninguno. ¿Qué métrica estás priorizando?",
      opts: [
        "Precisión: querés que cuando marque, sea cierto",
        "Recall: querés encontrar todos los casos reales, aunque haya falsas alarmas",
        "Exactitud: querés maximizar el total de aciertos",
        "AUC: querés que funcione con cualquier umbral"
      ],
      c: 1,
      expl: "Marcar de más significa aceptar falsos positivos a cambio de minimizar los falsos negativos, y eso es exactamente subir el recall. La falsa alarma cuesta un estudio adicional; el caso que se pasa puede costar una vida. Es una decisión del problema, no del modelo." },

    { tipo: "mcq", id: "me-c2",
      q: "Un modelo tiene precisión 1.0 y recall 0.0. ¿Cuánto vale su F1 y por qué?",
      opts: [
        "0.5, porque es el promedio de los dos",
        "0, porque el F1 es una media armónica y se hunde si cualquiera de los dos es cero",
        "1.0, porque la precisión perfecta domina",
        "No se puede calcular: hay una división por cero"
      ],
      c: 1,
      expl: "Ese modelo nunca acusa a nadie, y las poquísimas veces que lo hace acierta. Un promedio común lo premiaría con 0.5; la media armónica da 0, que es lo correcto: un detector que no detecta nada no sirve por más confiable que sea cuando habla." },

    { tipo: "num", id: "me-n1",
      q: "Matriz de confusión: 40 verdaderos positivos, 10 falsos positivos, 30 falsos negativos y 920 verdaderos negativos. ¿Cuánto vale el recall? Redondeá a dos decimales.",
      resp: 0.57, tol: 0.01,
      trampas: [
        { val: 0.8, msg: "Esa es la precisión: 40 / (40 + 10), o sea sobre lo que el modelo marcó. El recall divide por lo que REALMENTE era positivo, que son los 40 encontrados más los 30 que se escaparon." },
        { val: 0.96, msg: "Esa es la exactitud: (40 + 920) / 1000. Está inflada por los 920 verdaderos negativos, y esconde que el modelo se pierde casi la mitad de los casos positivos." }
      ],
      expl: "Recall = VP / (VP + FN) = 40 / (40 + 30) = 0.57. O sea que se le escapa el 43% de los casos reales, mientras la exactitud dice 96%. Esa distancia entre las dos métricas es todo el tema." },

    { tipo: "parsons", id: "me-p1",
      q: "Armá una función que calcule precisión y recall desde las cuatro celdas. Sobra una línea: descartala con ×.",
      lineas: [
        "def precision_y_recall(vp, fp, fn):",
        "    precision = vp / (vp + fp)",
        "    recall = vp / (vp + fn)",
        "    return precision, recall"
      ],
      distractores: ["    recall = vp / (vp + fp)"],
      expl: "Las dos comparten el numerador y se distinguen SOLO por el denominador: precisión divide por lo que el modelo marcó (vp + fp), recall por lo que realmente había (vp + fn). Con el distractor las dos devuelven el mismo número y nunca da error, así que el bug pasa desapercibido hasta que alguien nota que precisión y recall son siempre idénticos." },

    { tipo: "python", id: "me-py1",
      q: "Calculá las cuatro métricas del detector de fraude. Imprimí exactitud, precisión, recall y F1, redondeados a dos decimales: print(round(exa,2), round(pre,2), round(rec,2), round(f1,2)).",
      inicial: `vp = 40    # fraudes detectados
fp = 10    # falsas alarmas
fn = 30    # fraudes que se escaparon
vn = 920   # legítimas bien clasificadas

# Completá: las cuatro métricas.
exa = None   # (vp + vn) sobre el total
pre = None   # vp / (vp + fp)
rec = None   # vp / (vp + fn)
f1 = None    # 2 * pre * rec / (pre + rec)

# Completá: imprimí las cuatro redondeadas a 2 decimales
`,
      esperado: "0.96 0.8 0.57 0.67",
      expl: "La exactitud dice 0.96 y el recall dice 0.57: el mismo modelo, y dos historias opuestas. Si el informe reporta solo la exactitud, nadie se entera de que el detector deja pasar el 43% de los fraudes. El F1 de 0.67 es el resumen honesto, y sigue estando lejos del 0.96 que sonaba tan bien." }
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
Anim.aparecer("#d-matriz");
