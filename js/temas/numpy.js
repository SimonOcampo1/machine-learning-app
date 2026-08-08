/* Pegamento del tema 02. Solo toca `document`, no se testea con node --test. */

const SLUG = "numpy";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "np-c1",
      q: "X tiene forma (4, 2): cuatro casas, dos características. ¿Qué devuelve X.mean(axis=0)?",
      opts: [
        "Un número: el promedio de los ocho valores",
        "Dos números: el promedio de cada columna",
        "Cuatro números: el promedio de cada fila",
        "Un array de forma (4, 2), con cada valor reemplazado por el promedio"
      ],
      c: 1,
      expl: "axis nombra la dimensión que desaparece. Con axis=0 se colapsan las 4 filas y queda la forma (2,): un promedio por columna, o sea el m² promedio y los ambientes promedio." },

    { tipo: "mcq", id: "np-c2",
      q: "¿Por qué un array de NumPy es mucho más rápido que una lista de Python para hacer cuentas?",
      opts: [
        "Porque NumPy usa un bucle for más eficiente por dentro",
        "Porque guarda menos decimales y pierde precisión a cambio de velocidad",
        "Porque todos sus elementos son del mismo tipo, ocupan memoria contigua y la operación corre en código compilado",
        "Porque reparte el trabajo entre todos los procesadores de la máquina"
      ],
      c: 2,
      expl: "La restricción de un solo tipo es justamente la fuente de la velocidad: NumPy sabe de antemano cuánto ocupa cada elemento y puede recorrer la memoria de corrido, sin volver al intérprete de Python en cada vuelta." },

    { tipo: "num", id: "np-n1",
      q: "Con precios = np.array([1500, 2000, 1800, 2400]), ¿cuánto devuelve (precios > 1900).sum()?",
      resp: 2, tol: 0.01,
      trampas: [
        { val: 4400, msg: "Eso es la suma de los precios que superan 1900, o sea precios[precios > 1900].sum(). La máscara sola suma booleanos: cuenta casos, no valores." },
        { val: 4, msg: "Ese es el largo del array. La comparación devuelve cuatro booleanos, pero sumarlos da cuántos son True, no cuántos hay." }
      ],
      expl: "precios > 1900 da [False, True, False, True]. Como True vale 1 y False vale 0, sumarlos cuenta los casos que cumplen: 2." },

    { tipo: "parsons", id: "np-p1",
      q: "Armá una función que estandarice una matriz: a cada columna le resta su promedio y la divide por su desvío. Sobra una línea: descartala con ×.",
      lineas: [
        "def estandarizar(X):",
        "    medias = X.mean(axis=0)",
        "    desvios = X.std(axis=0)",
        "    return (X - medias) / desvios"
      ],
      distractores: ["    medias = X.mean(axis=1)"],
      expl: "Estandarizar es por característica, así que los promedios se toman por columna: axis=0. Con axis=1 se promediarían los m² con los ambientes de cada casa, que no significa nada. Las dos versiones corren sin error; solo una da lo correcto." },

    { tipo: "python", id: "np-py1",
      q: "Filtrá las casas de más de 80 m² y calculá su precio promedio. Imprimí cuántas quedaron y ese promedio: print(cantidad, round(promedio, 1)).",
      inicial: `import numpy as np

X = np.array([[85, 3], [120, 4], [60, 2], [95, 3]])
y = np.array([2400, 3100, 1700, 2600])

# Completá: armá la máscara de las casas con más de 80 m2.
# La primera columna es X[:, 0].
mascara = None

# Completá: imprimí cuántas casas quedaron y el promedio de SUS precios,
# redondeado a un decimal. Ojo: hay que filtrar y con la misma máscara.
`,
      paquetes: ["numpy"],
      esperado: "3 2700.0",
      expl: "X[:, 0] > 80 da [True, True, False, True]. La misma máscara se aplica a y para que cada precio siga correspondiendo a su casa: y[mascara] da [2400, 3100, 2600], que promedia 2700. Filtrar X sin filtrar y es el error silencioso de la sección de errores frecuentes." }
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
Anim.dibujar("#d-vectorizado");
Anim.aparecer("#d-vectorizado");
Anim.aparecer("#d-shape");
Anim.dibujar("#d-shape");
Anim.dibujar("#d-broadcast");
Anim.aparecer("#d-broadcast");
