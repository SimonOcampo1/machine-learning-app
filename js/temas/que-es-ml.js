/* Pegamento del tema 05. Solo toca `document`, no se testea con node --test. */

const SLUG = "que-es-ml";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "qm-c1",
      q: "Querés agrupar a tus clientes en segmentos parecidos entre sí, pero no tenés ninguna lista previa de a qué segmento pertenece cada uno. ¿Qué tipo de problema es?",
      opts: [
        "Supervisado, de clasificación: hay que predecir a qué grupo pertenece cada cliente",
        "No supervisado: no hay respuesta correcta con la cual comparar, la estructura hay que encontrarla",
        "Supervisado, de regresión: el número de segmento es la respuesta",
        "Por refuerzo: el algoritmo prueba agrupaciones y recibe un premio si acierta"
      ],
      c: 1,
      expl: "La pregunta que decide es una sola: ¿hay una columna con la respuesta? Acá no la hay, así que nadie puede decir si el agrupamiento es correcto. Es el tema 20, clustering, y ahí se ve que elegir cuántos grupos hacer no tiene respuesta objetiva." },

    { tipo: "mcq", id: "qm-c2",
      q: "El que etiquetó los mails de entrenamiento se equivocó en el 15% de los casos. ¿Qué le pasa al modelo?",
      opts: [
        "Nada: con suficientes datos, los errores se compensan entre sí",
        "Aprende ese error como si fuera la verdad, y ninguna métrica calculada sobre esas mismas etiquetas lo detecta",
        "Tira un error de entrenamiento y no llega a converger",
        "Se soluciona usando un algoritmo más robusto, como Random Forest"
      ],
      c: 1,
      expl: "El modelo no tiene forma de saber que la etiqueta está mal: es su única fuente de verdad. Va a reproducir ese 15% de error con precisión, y si evaluás contra las mismas etiquetas corruptas, la métrica va a decir que todo anda bien. Es el error silencioso de este tema." },

    { tipo: "num", id: "qm-n1",
      q: "Un detector de fraude se evalúa sobre 10.000 transacciones, de las cuales 50 son fraude. Un modelo que siempre dice «no es fraude» ¿qué porcentaje de aciertos tiene? Redondeá a un decimal.",
      resp: 99.5, tol: 0.05,
      trampas: [
        { val: 0.5, msg: "Ese es el porcentaje de fraudes sobre el total. La pregunta es por los aciertos del modelo, y este modelo acierta en todas las transacciones legítimas: son las otras 9.950." },
        { val: 50, msg: "Ese es un modelo que tira una moneda. El que siempre dice «no es fraude» acierta muchísimo más, justamente porque casi nada es fraude." }
      ],
      expl: "9.950 de 10.000 son 99,5% de aciertos, con un modelo que no detecta ni un solo fraude, o sea que es completamente inútil para lo único que le pediste. Esto es por qué la medida de éxito hay que elegirla antes y con cuidado: el tema 13 lo desarrolla entero." },

    { tipo: "parsons", id: "qm-p1",
      q: "Armá una función que decida si un problema es de regresión o de clasificación mirando cuántos valores distintos toma la respuesta. Sobra una línea: descartala con ×.",
      lineas: [
        "def tipo_de_problema(y):",
        "    distintos = len(set(y))",
        "    if distintos <= 10:",
        "        return 'clasificacion'",
        "    return 'regresion'"
      ],
      distractores: ["    if distintos >= 10:"],
      expl: "Pocos valores distintos sugieren categorías; muchos, un número continuo. Es una heurística útil pero no una ley: el criterio real es si la distancia entre dos valores significa algo. Con el signo dado vuelta, la función clasifica todo al revés y no da error." },

    { tipo: "python", id: "qm-py1",
      q: "Comprobá el caso del detector de fraude. Imprimí cuántos aciertos tiene el modelo que siempre dice «no es fraude», su porcentaje, y cuántos fraudes detectó: print(aciertos, round(pct, 1), detectados).",
      inicial: `import numpy as np

# 10.000 transacciones: 50 son fraude (1), el resto legítimas (0).
y = np.zeros(10000, dtype=int)
y[:50] = 1

# El modelo que siempre dice "no es fraude".
pred = np.zeros(10000, dtype=int)

# Completá: cuántas veces coincide la predicción con la realidad.
# (pred == y) da booleanos; sumarlos los cuenta.
aciertos = None

# Completá: ese número como porcentaje del total.
pct = None

# Completá: cuántos fraudes reales detectó el modelo.
# Son los casos donde y == 1 Y ADEMÁS pred == 1.
detectados = None

# Completá: imprimí aciertos, round(pct, 1) y detectados
`,
      paquetes: ["numpy"],
      esperado: "9950 99.5 0",
      expl: "99,5% de aciertos y cero fraudes detectados. El número que suena impecable y el número que importa apuntan en direcciones opuestas, y solo uno de los dos aparece si mirás la exactitud. Por eso la medida de éxito se define antes de entrenar, no después de ver los resultados." }
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
Anim.dibujar("#d-paradigma");
Anim.aparecer("#d-paradigma");
