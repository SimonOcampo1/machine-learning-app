/* Pegamento del tema 15. Solo toca `document`, no se testea con node --test. */

const SLUG = "naive-bayes";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "nb-c1",
      q: "¿En qué sentido es «ingenuo» Naïve Bayes?",
      opts: [
        "En que usa un algoritmo muy simple comparado con otros clasificadores",
        "En que asume que, dentro de una clase, las características son independientes entre sí, cosa que casi nunca es cierta",
        "En que ignora la frecuencia base de cada clase",
        "En que solo funciona con dos clases"
      ],
      c: 1,
      expl: "En castellano, ver «buenos» hace muy probable ver «días»: las palabras no son independientes ni cerca. La suposición es lo que vuelve calculable el problema, porque convierte la probabilidad de una combinación entera en un producto de factores contables." },

    { tipo: "mcq", id: "nb-c2",
      q: "Si la suposición de independencia es falsa, ¿por qué el clasificador funciona bien igual?",
      opts: [
        "Porque con suficientes datos la suposición termina siendo cierta",
        "Porque para clasificar solo importa qué clase saca el puntaje más alto, no que los valores sean correctos",
        "Porque el suavizado de Laplace corrige la dependencia entre palabras",
        "Porque en la práctica se usa solo con características que sí son independientes"
      ],
      c: 1,
      expl: "Las probabilidades salen mal calibradas y pegadas a 0 o a 1, porque la evidencia correlacionada se cuenta varias veces. Pero ese sesgo empuja a las dos clases en la misma dirección, así que la comparación entre ellas sobrevive. De ahí la regla práctica: sirve para decidir, no para reportar un porcentaje." },

    { tipo: "num", id: "nb-n1",
      q: "Con P(spam) = 0.30, P(gratis|spam) = 0.80 y P(reunión|spam) = 0.10, ¿cuánto vale el puntaje de la clase spam para un mail que tiene las dos palabras?",
      resp: 0.024, tol: 0.0005,
      trampas: [
        { val: 1.2, msg: "Sumaste los factores en vez de multiplicarlos. La suposición de independencia sirve justamente para poder MULTIPLICAR las probabilidades individuales." },
        { val: 0.08, msg: "Te olvidaste de un factor: probablemente la frecuencia base P(spam) = 0.30, que es la que dice qué proporción de mails son spam antes de mirar el contenido." }
      ],
      expl: "0.30 × 0.80 × 0.10 = 0.024. Contra los 0.042 de la clase legítimo, gana legítimo. Los dos números son chicos y no suman 1 porque son proporcionales a las probabilidades reales, no iguales: para ordenar dos clases alcanza." },

    { tipo: "parsons", id: "nb-p1",
      q: "Armá el cálculo del puntaje de una clase con suavizado de Laplace y en logaritmos. Sobra una línea: descartala con ×.",
      lineas: [
        "def puntaje(palabras, conteos, total, vocabulario, base):",
        "    p = math.log(base)",
        "    for w in palabras:",
        "        prob = (conteos.get(w, 0) + 1) / (total + vocabulario)",
        "        p = p + math.log(prob)",
        "    return p"
      ],
      distractores: ["        p = p * math.log(prob)"],
      expl: "En logaritmos los productos se convierten en SUMAS: ese es todo el punto de pasar a logaritmos. Multiplicar logaritmos entre sí no corresponde a nada. Fijate además el +1 del numerador y el +vocabulario del denominador: eso es Laplace, y es lo que impide que una palabra nunca vista ponga todo en cero." },

    { tipo: "python", id: "nb-py1",
      q: "Comprobá el problema del cero. Calculá el puntaje de spam sin suavizar, y con Laplace pero en logaritmos. Imprimí los dos: print(sin_suavizar, round(log_suavizado, 2)).",
      inicial: `import math

# Conteos sobre 30 mails de spam.
conteos = {"gratis": 24, "oferta": 15}
total_spam = 30
vocabulario = 1000   # palabras distintas en todo el corpus
base = 0.30

# El mail trae una palabra que nunca apareció en spam.
palabras = ["gratis", "oferta", "presupuesto"]

# Completá: el puntaje SIN suavizar. Multiplicá base por
# conteos.get(w, 0) / total_spam para cada palabra.
sin_suavizar = base
for w in palabras:
    pass

# Completá: el puntaje CON Laplace y en logaritmos.
# Arrancá en math.log(base) y SUMÁ el logaritmo de cada
# (conteos.get(w, 0) + 1) / (total_spam + vocabulario)
log_suavizado = math.log(base)
for w in palabras:
    pass

# Completá: imprimí sin_suavizar y round(log_suavizado, 2)
`,
      esperado: "0.0 -16.02",
      expl: "Sin suavizar da exactamente 0: una sola palabra desconocida anuló las otras dos, que gritaban spam. Con Laplace el puntaje existe, y en logaritmos vale −16.02, un número perfectamente manejable. Sin logaritmos ese mismo puntaje sería 0.00000011, y con doscientas palabras en vez de tres la computadora lo redondearía a cero igual que antes: los dos arreglos hacen falta juntos. Como los datos nuevos SIEMPRE traen palabras que no estaban en el entrenamiento, esto no es un riesgo sino una certeza." }
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
Anim.dibujar("#d-puntajes");
Anim.aparecer("#d-puntajes");
