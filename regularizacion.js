/* Pegamento del tema 11. Solo toca `document`, no se testea con node --test. */

const SLUG = "regularizacion";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "rg-c1",
      q: "Tenés 300 columnas y sospechás que solo unas quince importan de verdad. ¿Ridge o Lasso?",
      opts: [
        "Ridge, porque es la opción por defecto y siempre es más estable",
        "Lasso, porque lleva coeficientes exactamente a cero y eso equivale a sacar las variables que no aportan",
        "Ninguno de los dos: con tantas columnas hay que usar regresión común",
        "Ridge, porque Lasso solo funciona con menos de diez variables"
      ],
      c: 1,
      expl: "Lasso hace selección de características sola: las 285 columnas que no aportan terminan con coeficiente cero y salen del modelo. Ridge las dejaría a todas con un peso chico, lo cual sirve cuando creés que todas aportan algo, que no es este caso." },

    { tipo: "mcq", id: "rg-c2",
      q: "¿Por qué alpha no se puede elegir mirando el error de entrenamiento?",
      opts: [
        "Porque el error de entrenamiento no se puede calcular con modelos regularizados",
        "Porque ese error siempre es mínimo con alpha = 0, así que el procedimiento devuelve siempre «no regularices»",
        "Porque alpha no afecta al error de entrenamiento en absoluto",
        "Porque hace falta el conjunto de test para calcularlo"
      ],
      c: 1,
      expl: "Regularizar empeora el ajuste sobre los datos de entrenamiento a propósito: ese es el punto. Si elegís alpha por ese error, siempre gana alpha = 0 y volvés a la regresión sin castigo. Hay que medir sobre datos que el modelo no vio, o sea validación cruzada." },

    { tipo: "num", id: "rg-n1",
      q: "Un modelo tiene coeficientes [3, −4, 0, 12]. ¿Cuánto vale el castigo de Lasso, o sea la suma de sus valores absolutos?",
      resp: 19, tol: 0.01,
      trampas: [
        { val: 11, msg: "Sumaste los coeficientes tal cual, sin valor absoluto: 3 − 4 + 0 + 12. Los negativos se cancelarían con los positivos y un modelo con coeficientes enormes de signos opuestos daría castigo cero, que es justo lo que hay que evitar." },
        { val: 169, msg: "Ese es el castigo de Ridge: 9 + 16 + 0 + 144, la suma de los CUADRADOS. Lasso usa valores absolutos." }
      ],
      expl: "3 + 4 + 0 + 12 = 19. El valor absoluto cumple la misma función que el cuadrado en Ridge: evitar que los coeficientes positivos y negativos se cancelen entre sí. Es la misma razón por la que el tema 09 elevaba los residuos al cuadrado." },

    { tipo: "parsons", id: "rg-p1",
      q: "Armá un flujo que elija alpha por validación cruzada sin fuga de datos. Sobra una línea: descartala con ×.",
      lineas: [
        "pipe = Pipeline([('escala', StandardScaler()), ('modelo', Ridge())])",
        "grilla = {'modelo__alpha': [0.01, 0.1, 1, 10, 100]}",
        "busqueda = GridSearchCV(pipe, grilla, cv=5)",
        "busqueda.fit(X_train, y_train)",
        "print(busqueda.best_params_)"
      ],
      distractores: ["X_train = StandardScaler().fit_transform(X_train)"],
      expl: "El escalador va DENTRO del Pipeline, no aplicado antes a mano. Puesto afuera, se ajusta una sola vez sobre todo X_train, así que en cada pliegue de la validación cruzada la porción de validación fue escalada con estadísticas que la incluyen: fuga sutil. Dentro del Pipeline, GridSearchCV lo reajusta en cada pliegue." },

    { tipo: "python", id: "rg-py1",
      q: "Comprobá que el castigo depende de las unidades. Los mismos datos medidos en m² y en hectáreas dan coeficientes distintos. Imprimí los dos coeficientes y los dos castigos de Ridge: print(round(c1,2), round(c2,2), round(p1,2), round(p2,2)).",
      inicial: `# Una relación fija: el precio sube 1200 por cada m2.
# Medido en m2, el coeficiente vale 1200.
coef_m2 = 1200.0

# 1 hectárea son 10.000 m2. Si medís la MISMA superficie en hectáreas,
# el número de la variable se hace 10.000 veces más chico,
# así que el coeficiente tiene que ser 10.000 veces más grande.
# Completá: el coeficiente equivalente medido en hectáreas.
c1 = coef_m2
c2 = None

# Completá: el castigo de Ridge de cada uno (el coeficiente al cuadrado).
p1 = None
p2 = None

# Completá: imprimí round(c1,2), round(c2,2), round(p1,2), round(p2,2)
`,
      esperado: "1200.0 12000000.0 1440000.0 144000000000000.0",
      expl: "El mismo fenómeno, dos unidades, y el castigo de Ridge pasa de 1,4 millones a 144 billones: cien millones de veces más grande. Si esa variable convive con otras en un modelo sin estandarizar, la regularización la va a aplastar por completo, no porque importe menos sino porque la mediste en otra unidad. Eso es lo que arregla StandardScaler." }
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
Anim.aparecer("#d-encoge");
