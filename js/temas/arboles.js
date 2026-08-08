/* Pegamento del tema 17. Solo toca `document`, no se testea con node --test. */

const SLUG = "arboles";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "ar-c1",
      q: "¿Por qué los árboles de decisión no necesitan que estandarices las variables?",
      opts: [
        "Porque internamente aplican una normalización antes de cada corte",
        "Porque solo comparan cada variable contra un umbral, así que cambiar de unidades cambia el umbral y nada más",
        "Porque solo funcionan con variables categóricas",
        "Porque el criterio de Gini es invariante a cualquier transformación"
      ],
      c: 1,
      expl: "Un corte es «¿esta columna supera este número?». Si medís la superficie en hectáreas en vez de metros, el árbol elige otro umbral y produce exactamente la misma partición. Compará con KNN o SVM, donde la distancia mezcla todas las columnas y la escala decide cuál domina." },

    { tipo: "mcq", id: "ar-c2",
      q: "Entrenás un árbol con max_depth=None (el valor por defecto de scikit-learn) y da 100% en entrenamiento. ¿Qué pasó?",
      opts: [
        "El modelo encontró el patrón perfecto y está listo",
        "Siguió partiendo hasta aislar cada fila en su propia hoja: memorizó el dataset, ruido incluido",
        "Hubo un error de configuración y hay que reentrenar",
        "Las clases están perfectamente separadas por una sola variable"
      ],
      c: 1,
      expl: "Sin límite, un árbol siempre llega ahí: es lo que hace por defecto, no un accidente. Es el caso más claro de varianza alta del tema 08. Hay que fijar max_depth, min_samples_leaf o podar, y elegir el valor con validación cruzada." },

    { tipo: "num", id: "ar-n1",
      q: "Un nodo tiene 6 casas caras y 6 baratas. ¿Cuánto vale su impureza de Gini? Redondeá a tres decimales.",
      resp: 0.5, tol: 0.002,
      trampas: [
        { val: 0, msg: "Cero es un nodo perfectamente PURO, con una sola clase. Este está mitad y mitad, que es lo más impuro posible con dos clases." },
        { val: 0.25, msg: "Elevaste al cuadrado una sola proporción. Gini resta la suma de TODOS los cuadrados: 1 − (0.5² + 0.5²) = 1 − 0.5." }
      ],
      expl: "Las proporciones son 0.5 y 0.5, así que Gini = 1 − (0.25 + 0.25) = 0.5, el máximo con dos clases. Después del corte de la tabla queda en 0.278, y esa caída de 0.222 es lo que el algoritmo maximiza al elegir dónde partir." },

    { tipo: "parsons", id: "ar-p1",
      q: "Armá la función que calcula la impureza de Gini de un nodo. Sobra una línea: descartala con ×.",
      lineas: [
        "def gini(conteos):",
        "    total = sum(conteos)",
        "    suma = 0",
        "    for c in conteos:",
        "        suma = suma + (c / total) ** 2",
        "    return 1 - suma"
      ],
      distractores: ["        suma = suma + c ** 2"],
      expl: "Hay que elevar al cuadrado la PROPORCIÓN (c / total), no el conteo crudo. Con conteos, el resultado crece con el tamaño del nodo y deja de estar entre 0 y 1: la función devolvería números negativos enormes y el árbol elegiría cortes al azar. No da error, solo resultados sin sentido." },

    { tipo: "python", id: "ar-py1",
      q: "Calculá la ganancia del corte de la sección 02. Imprimí el Gini de antes, el ponderado de después, y la ganancia, redondeados a tres decimales: print(round(g_antes,3), round(g_despues,3), round(ganancia,3)).",
      inicial: `def gini(a, b):
    total = a + b
    # Completá: devolvé 1 menos la suma de los cuadrados de las proporciones.
    pass

# Antes del corte: 6 caras y 6 baratas.
g_antes = None

# Después: izquierda 1 cara y 5 baratas, derecha 5 caras y 1 barata.
# Completá: el Gini de cada lado, ponderado por cuántos datos cayó en cada uno
# (6 de 12 en cada lado).
g_despues = None

# Completá: la ganancia es lo que bajó la impureza.
ganancia = None

# Completá: imprimí los tres redondeados a 3 decimales
`,
      esperado: "0.5 0.278 0.222",
      expl: "El corte bajó la impureza de 0.5 a 0.278, o sea una ganancia de 0.222. La ponderación por tamaño importa: sin ella, un corte que aísla dos casos purísimos y deja el resto revuelto le ganaría a este, que ordena las doce filas. Probá cambiar el corte a 0 y 6 contra 6 y 6 para ver un caso que no gana nada." }
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
Anim.dibujar("#d-arbol");
Anim.aparecer("#d-arbol");
