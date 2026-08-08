/* Pegamento del tema 19. Solo toca `document`, no se testea con node --test. */

const SLUG = "boosting";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "bo-c1",
      q: "En Random Forest podías poner mil árboles sin pensarlo. ¿Por qué en boosting no?",
      opts: [
        "Porque boosting es mucho más lento y mil árboles no terminarían nunca",
        "Porque cada árbol nuevo reduce activamente el error de entrenamiento, así que si lo dejás correr termina ajustando el ruido",
        "Porque boosting solo admite hasta cien árboles por diseño",
        "Porque los árboles de boosting son más profundos y ocupan demasiada memoria"
      ],
      c: 1,
      expl: "En bagging cada árbol es una opinión más sobre el mismo problema y el promedio solo se estabiliza. En boosting la cadena persigue el error residual, y llega un punto en que lo que queda es ruido. Por eso la cantidad de árboles pasa a ser el hiperparámetro crítico y se resuelve con early stopping." },

    { tipo: "mcq", id: "bo-c2",
      q: "¿Por qué los árboles de un gradient boosting se dejan chiquitos, de profundidad 3 o 4?",
      opts: [
        "Para que el entrenamiento sea más rápido",
        "Porque cada uno solo tiene que corregir un pedazo del error restante: si el primero ya ajustara casi todo, la cadena perdería sentido y sobreajustaría enseguida",
        "Porque los árboles profundos no pueden predecir residuos",
        "Porque así se puede dibujar cada uno y explicar el modelo"
      ],
      c: 1,
      expl: "Boosting ataca el sesgo sumando muchas piezas deliberadamente débiles. Un árbol profundo tiene sesgo bajo y varianza alta por sí solo, que es justo lo que boosting NO necesita: para eso está bagging, que promedia modelos ya buenos." },

    { tipo: "num", id: "bo-n1",
      q: "El valor real es 260. La predicción inicial es 200, el árbol 1 predice 40 y el árbol 2 predice 15. Con learning rate 1, ¿cuánto vale el residuo que queda después del árbol 2?",
      resp: 5, tol: 0.01,
      trampas: [
        { val: 55, msg: "Sumaste los dos árboles y lo restaste del residuo inicial mal, o solo aplicaste uno. La predicción acumulada es 200 + 40 + 15 = 255, y el residuo es 260 − 255." },
        { val: 20, msg: "Ese es el residuo después del árbol 1 solamente: 260 − 240. Falta aplicar el árbol 2, que predice 15 sobre ese residuo." }
      ],
      expl: "200 + 40 + 15 = 255, y 260 − 255 = 5. Cada árbol no predice el precio: predice lo que falta. El siguiente va a trabajar sobre ese 5, y así el modelo se afina de a poco hasta que lo que queda es ruido." },

    { tipo: "parsons", id: "bo-p1",
      q: "Armá un gradient boosting con early stopping. Sobra una línea: descartala con ×.",
      lineas: [
        "modelo = GradientBoostingRegressor(learning_rate=0.05, max_depth=3, n_estimators=2000)",
        "modelo.set_params(validation_fraction=0.2, n_iter_no_change=20)",
        "modelo.fit(X_train, y_train)",
        "print('árboles usados:', modelo.n_estimators_)"
      ],
      distractores: ["modelo = GradientBoostingRegressor(learning_rate=0.05, max_depth=12, n_estimators=2000)"],
      expl: "max_depth=12 son árboles profundos, que en boosting es el error clásico: el primero ya ajusta casi todo y la cadena pierde sentido. Fijate el patrón correcto: learning rate chico, árboles chicos, un techo alto de n_estimators, y early stopping decidiendo cuántos usar de verdad." },

    { tipo: "python", id: "bo-py1",
      q: "Simulá la cadena de residuos con learning rate. Imprimí la predicción final y el residuo que queda, redondeados a dos decimales: print(round(pred, 2), round(residuo, 2)).",
      inicial: `real = 260.0
pred = 200.0          # arranca en el promedio
lr = 0.5              # learning rate
arboles = [40.0, 15.0, 4.0, 1.0]   # lo que predice cada árbol

# Completá: sumá cada árbol MULTIPLICADO por el learning rate.
for a in arboles:
    pass

# Completá: el residuo que queda al final.
residuo = None

# Completá: imprimí round(pred, 2) y round(residuo, 2)
`,
      esperado: "230.0 30.0",
      expl: "Con learning rate 0.5, cada árbol aporta la mitad de lo que predijo, así que después de cuatro árboles todavía faltan 30. Con lr = 1 habría llegado a 260 exacto en cuatro pasos. Ese es el compromiso: el learning rate chico exige muchos más árboles y a cambio el modelo generaliza mejor, porque avanza en pasos chicos en vez de saltar a la respuesta." }
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
Anim.dibujar("#d-cadena");
Anim.aparecer("#d-cadena");
