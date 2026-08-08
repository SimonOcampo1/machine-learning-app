/* Pegamento del tema 06. Solo toca `document`, no se testea con node --test. */

const SLUG = "flujo";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "fl-c1",
      q: "Tenés una columna «barrio» con los valores Flores, Palermo y Caballito. ¿Cómo se la das al modelo?",
      opts: [
        "Reemplazando cada barrio por un número: Flores 1, Palermo 2, Caballito 3",
        "Con one-hot: una columna por barrio, con 1 en la que corresponde y 0 en las demás",
        "Borrando la columna, porque los modelos no aceptan texto",
        "Ordenando los barrios por precio promedio y usando esa posición"
      ],
      c: 1,
      expl: "Numerarlos le dice al modelo que Palermo está entre Flores y Caballito, y que la distancia de Flores a Caballito es el doble que la de Flores a Palermo. Nada de eso existe. One-hot no inventa ningún orden: cada barrio es su propia columna independiente." },

    { tipo: "mcq", id: "fl-c2",
      q: "Probaste veinte modelos y elegiste el que mejor puntuó en el conjunto de test. ¿Qué problema tiene ese número?",
      opts: [
        "Ninguno: para eso está el conjunto de test",
        "Que ya no estima el desempeño con datos nuevos, porque elegiste el modelo EN FUNCIÓN de él",
        "Que veinte modelos son demasiados y hay que probar menos",
        "Que hay que promediar los veinte resultados en vez de quedarse con el mejor"
      ],
      c: 1,
      expl: "Con veinte intentos, el mejor puntaje incluye una parte de suerte con ese conjunto puntual. El test ya participó de la decisión, así que dejó de ser una muestra de datos nunca vistos. Para elegir entre modelos está el conjunto de validación, que es el tema siguiente." },

    { tipo: "num", id: "fl-n1",
      q: "Tenés 8.000 filas y separás el 25% para test. ¿Cuántas filas quedan para entrenar?",
      resp: 6000, tol: 0.5,
      trampas: [
        { val: 2000, msg: "Esas son las que van a test. La pregunta es por las que quedan para entrenar, que son el 75% restante." },
        { val: 7975, msg: "Restaste el 0,25% en vez del 25%. El 25% de 8.000 son 2.000 filas, no 20." }
      ],
      expl: "El 25% de 8.000 son 2.000 para test, así que quedan 6.000 para entrenar. Con datasets chicos ese corte duele, y es justamente el problema que resuelve la validación cruzada del tema siguiente." },

    { tipo: "parsons", id: "fl-p1",
      q: "Ordená las etapas de un flujo que estandariza y entrena, sin filtrar información del test. Sobra una línea: descartala con ×.",
      lineas: [
        "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)",
        "escalador = StandardScaler()",
        "X_train = escalador.fit_transform(X_train)",
        "X_test = escalador.transform(X_test)",
        "modelo.fit(X_train, y_train)"
      ],
      distractores: ["X = StandardScaler().fit_transform(X)"],
      expl: "Primero se separa y recién después se escala. El distractor escala TODO el dataset junto, así que la media y el desvío que usa ya incluyen al test: eso es fuga de datos. Fijate además que sobre el test se llama transform y no fit_transform, para aplicar los números aprendidos en train sin recalcularlos." },

    { tipo: "python", id: "fl-py1",
      q: "Compará el baseline contra un modelo. Los datos son precios; el baseline predice siempre el promedio de entrenamiento. Imprimí el error absoluto medio del baseline y el del modelo, redondeados a un decimal: print(round(err_base, 1), round(err_modelo, 1)).",
      inicial: `import numpy as np

y_train = np.array([100, 150, 200, 250, 300], dtype=float)
y_test = np.array([120, 180, 260], dtype=float)
pred_modelo = np.array([130, 190, 240], dtype=float)

# Completá: el baseline predice siempre el promedio de y_train,
# para las tres filas de test.
pred_base = None

# Completá: error absoluto medio de cada uno.
# Es el promedio de abs(prediccion - real).
err_base = None
err_modelo = None

# Completá: imprimí round(err_base, 1) y round(err_modelo, 1)
`,
      paquetes: ["numpy"],
      esperado: "53.3 13.3",
      expl: "El baseline predice siempre 200 y se equivoca en promedio 53,3; el modelo, 13,3. Le gana por cuatro veces, así que justifica su costo. Sin calcular el baseline, el 13,3 solo no se puede interpretar: podría haber sido peor que predecir siempre el promedio." }
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
Anim.dibujar("#d-ciclo");
Anim.aparecer("#d-ciclo");
