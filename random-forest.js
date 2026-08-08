/* Pegamento del tema 18. Solo toca `document`, no se testea con node --test. */

const SLUG = "random-forest";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "rf-c1",
      q: "¿Por qué Random Forest le prohíbe a cada árbol considerar todas las variables en cada corte?",
      opts: [
        "Para que el entrenamiento sea más rápido",
        "Para que los árboles salgan distintos entre sí: si todos usaran la mejor variable primero, quedarían casi iguales y promediarlos no reduciría casi nada",
        "Para evitar que el modelo use variables irrelevantes",
        "Porque los árboles no pueden manejar muchas variables a la vez"
      ],
      c: 1,
      expl: "Promediar baja la varianza n veces solo si las piezas son independientes. Con una variable muy predictiva, todos los árboles la eligen primero y quedan correlacionados. Restringir el conjunto disponible empeora a cada árbol y mejora mucho al bosque: descorrelacionar vale más que optimizar cada pieza." },

    { tipo: "mcq", id: "rf-c2",
      q: "Tu Random Forest sobreajusta. ¿Cuál de estos cambios NO va a ayudar?",
      opts: [
        "Bajar la profundidad máxima de los árboles",
        "Subir el mínimo de muestras por hoja",
        "Bajar la cantidad de árboles del bosque",
        "Conseguir más datos de entrenamiento"
      ],
      c: 2,
      expl: "Agregar o quitar árboles no cambia el overfitting: más árboles solo estabiliza el promedio, y quitarlos lo desestabiliza sin volverlo más simple. Lo que controla la complejidad es la profundidad, el mínimo por hoja y cuántas variables ve cada corte." },

    { tipo: "num", id: "rf-n1",
      q: "Tenés 16 columnas y usás la regla habitual de Random Forest para clasificación: la raíz cuadrada del total. ¿Cuántas variables considera cada corte?",
      resp: 4, tol: 0.01,
      trampas: [
        { val: 16, msg: "Esas son todas, que es lo que haría bagging común. Random Forest restringe justamente para que los árboles no queden todos iguales." },
        { val: 8, msg: "Esa es la mitad, que es la regla habitual para regresión en algunas implementaciones. Para clasificación, la convención es la raíz cuadrada." }
      ],
      expl: "√16 = 4. En cada corte, cada árbol sortea 4 de las 16 columnas y elige la mejor entre esas. Muchas veces la variable dominante no está entre las sorteadas, y ahí es cuando el árbol descubre estructura que de otro modo quedaría tapada." },

    { tipo: "parsons", id: "rf-p1",
      q: "Armá un Random Forest con estimación out-of-bag e importancia por permutación. Sobra una línea: descartala con ×.",
      lineas: [
        "bosque = RandomForestClassifier(n_estimators=500, oob_score=True, random_state=0)",
        "bosque.fit(X_train, y_train)",
        "print('oob:', bosque.oob_score_)",
        "imp = permutation_importance(bosque, X_test, y_test, n_repeats=10)",
        "print(imp.importances_mean)"
      ],
      distractores: ["print(bosque.feature_importances_)"],
      expl: "feature_importances_ es la importancia por impureza, la que favorece a las columnas con muchos valores distintos y puede poner un ID arriba de todo. La de permutación mide cuánto empeora el modelo al mezclar cada columna, que es lo que uno quiere saber de verdad. Fijate que oob_score da una estimación de desempeño sin gastar datos en validación." },

    { tipo: "python", id: "rf-py1",
      q: "Comprobá cuántas filas quedan afuera de una muestra bootstrap. Imprimí cuántas filas distintas entraron y qué fracción quedó out-of-bag, redondeada a dos decimales: print(distintas, round(frac_oob, 2)).",
      inicial: `import numpy as np

rng = np.random.default_rng(0)
n = 10000

# Una muestra bootstrap: n índices elegidos al azar CON reemplazo.
muestra = rng.integers(0, n, size=n)

# Completá: cuántas filas distintas del original aparecen en la muestra.
# len(set(...)) cuenta los valores únicos.
distintas = None

# Completá: qué fracción del original NO aparece.
frac_oob = None

# Completá: imprimí distintas y round(frac_oob, 2)
`,
      paquetes: ["numpy"],
      esperado: "6350 0.36",
      expl: "Cerca del 37% de las filas queda afuera de cada muestra, y no es casualidad: la probabilidad de que una fila no salga nunca en n intentos tiende a 1/e ≈ 0.368 cuando n crece. Esas son las out-of-bag, y evaluar cada árbol contra ellas da una estimación de error sin apartar un conjunto de validación." }
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
Anim.dibujar("#d-bagging");
Anim.aparecer("#d-bagging");
