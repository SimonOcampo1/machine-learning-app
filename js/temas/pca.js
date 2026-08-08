/* Pegamento del tema 21. Solo toca `document`, no se testea con node --test. */

const SLUG = "pca";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "pc-c1",
      q: "Tenés precio en pesos (cientos de miles) y superficie en metros (dos dígitos). Corrés PCA sin estandarizar. ¿Qué pasa?",
      opts: [
        "PCA normaliza internamente, así que no pasa nada",
        "PC1 va a ser esencialmente la columna de precio, porque su varianza es enormemente más grande solo por las unidades",
        "El método tira un error por escalas incompatibles",
        "Las componentes salen bien pero en orden invertido"
      ],
      c: 1,
      expl: "PCA busca direcciones de máxima varianza, y la varianza depende de las unidades. Con precio en cientos de miles, su varianza aplasta a la de cualquier otra columna. El método corre, la varianza explicada se ve altísima, y lo único que hiciste fue redescubrir tu columna de números más grandes." },

    { tipo: "mcq", id: "pc-c2",
      q: "¿Qué son exactamente las componentes principales, en relación con los datos originales?",
      opts: [
        "Las columnas originales más importantes, seleccionadas y reordenadas",
        "Direcciones nuevas, cada una una combinación de TODAS las columnas originales",
        "Los promedios de grupos de columnas parecidas",
        "Las columnas originales después de estandarizarlas"
      ],
      c: 1,
      expl: "PCA no selecciona columnas: las combina. PC1 puede ser 0.4×superficie + 0.5×precio − 0.3×antigüedad + … Por eso no tiene nombre ni unidades, y por eso un modelo entrenado sobre componentes es opaco. Si necesitás explicar el modelo, PCA es el método equivocado." },

    { tipo: "num", id: "pc-n1",
      q: "Los autovalores de un PCA son 6.0, 2.5, 1.0 y 0.5. ¿Qué porcentaje de la varianza explican las dos primeras componentes juntas?",
      resp: 85, tol: 0.5,
      trampas: [
        { val: 60, msg: "Esa es solo PC1: 6.0 sobre 10. La pregunta es por las dos primeras juntas, así que hay que sumar también el 25% de PC2." },
        { val: 8.5, msg: "Esa es la suma de los dos autovalores (6.0 + 2.5), no un porcentaje. Hay que dividirla por la suma total de los cuatro, que es 10." }
      ],
      expl: "Los autovalores suman 10. (6.0 + 2.5) / 10 = 0.85, o sea 85%. Con dos componentes de cuatro conservás el 85% de la variación, que suele alcanzar para graficar; agregando PC3 llegás al 95%, que es el umbral habitual para modelar." },

    { tipo: "parsons", id: "pc-p1",
      q: "Armá un PCA sin fuga de datos, dentro de un pipeline. Sobra una línea: descartala con ×.",
      lineas: [
        "pipe = Pipeline([('escala', StandardScaler()), ('pca', PCA(n_components=0.95)), ('modelo', LogisticRegression())])",
        "pipe.fit(X_train, y_train)",
        "print('componentes:', pipe['pca'].n_components_)",
        "print('acumulada:', pipe['pca'].explained_variance_ratio_.sum())"
      ],
      distractores: ["X = PCA(n_components=0.95).fit_transform(X)"],
      expl: "El distractor ajusta PCA sobre TODO el dataset antes de separar: las direcciones se calculan con información del test, que es fuga de datos igual que escalar antes de separar. Fijate que n_components acepta un decimal: 0.95 significa «las que hagan falta para llegar al 95% de varianza explicada»." },

    { tipo: "python", id: "pc-py1",
      q: "Calculá la varianza explicada de un PCA a mano, desde los autovalores de la matriz de covarianza. Imprimí las cuatro proporciones redondeadas a dos decimales y la acumulada de las dos primeras: print(props, round(acum2, 2)).",
      inicial: `import numpy as np

# Autovalores ya calculados, en orden decreciente.
autovalores = np.array([6.0, 2.5, 1.0, 0.5])

# Completá: la proporción de varianza que explica cada componente.
# Es cada autovalor sobre la suma de todos.
props = None

# Completá: la acumulada de las dos primeras.
acum2 = None

# Completá: imprimí np.round(props, 2).tolist() y round(float(acum2), 2)
`,
      paquetes: ["numpy"],
      esperado: "[0.6, 0.25, 0.1, 0.05] 0.85",
      expl: "Las cuatro proporciones suman 1, como tiene que ser: entre todas las componentes está toda la varianza. Las dos primeras llegan a 0.85 y las tres primeras a 0.95. Elegir cuántas conservar es leer esta lista acumulada y cortar donde el aporte deja de valer la columna extra." }
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
Anim.dibujar("#d-pca");
Anim.aparecer("#d-pca");
