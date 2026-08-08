/* Pegamento del tema 01. Solo toca `document`, no se testea con node --test:
   acá todo es DOM. La lógica pura, si la hubiera, iría a un módulo aparte. */

const SLUG = "python";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "py-c1",
      q: "En Python, ¿qué define dónde termina el cuerpo de un bucle for?",
      opts: [
        "Una llave de cierre }",
        "La palabra end",
        "La sangría: el bloque termina donde el código vuelve al margen",
        "Una línea en blanco"
      ],
      c: 2,
      expl: "Python no tiene delimitadores de bloque. La sangría no es estética, es sintaxis: mover una línea cuatro espacios cambia el programa." },

    { tipo: "mcq", id: "py-c2",
      q: "Tenés precios = [1500, 2000, 1800, 2400]. ¿Qué devuelve precios[1]?",
      opts: [
        "1500, porque es el primer elemento",
        "2000, porque se cuenta desde cero y la posición 1 es la segunda",
        "Un error, porque las listas se indexan desde 1",
        "[1500], una lista con el primer elemento"
      ],
      c: 1,
      expl: "Se cuenta desde cero: la posición 0 es 1500 y la 1 es 2000. Para el primero se pide precios[0]; para el último, precios[-1]." },

    { tipo: "num", id: "py-n1",
      q: "Con precios = [1500, 2000, 1800, 2400], ¿cuánto devuelve len(precios[1:3])?",
      resp: 2, tol: 0.01,
      trampas: [
        { val: 3, msg: "El corte 1:3 va desde la posición 1 hasta la 3 sin incluirla: se lleva la 1 y la 2, o sea dos elementos. El límite de la derecha nunca entra." },
        { val: 4, msg: "Eso es len(precios), la lista entera. La pregunta es por el pedazo precios[1:3]." }
      ],
      expl: "precios[1:3] es [2000, 1800]: arranca en la posición 1 e incluye hasta la 3 sin tomarla. Son 2 elementos." },

    { tipo: "parsons", id: "py-p1",
      q: "Armá una función que cuente cuántos precios superan los 2000. Sobra una línea: descartala con ×.",
      lineas: [
        "def contar_caros(precios):",
        "    total = 0",
        "    for p in precios:",
        "        if p > 2000:",
        "            total = total + 1",
        "    return total"
      ],
      distractores: ["        return total"],
      expl: "El return va al margen del for, no adentro: si estuviera indentado dentro del bucle, la función cortaría en la primera vuelta y devolvería siempre 0 o 1. Ese es el uso real de la sangría." },

    { tipo: "python", id: "py-py1",
      q: "Escribí una función promedio(numeros) que devuelva el promedio de una lista, y usala con la lista de precios. Imprimí el resultado redondeado a dos decimales: print(round(promedio(precios), 2)).",
      inicial: `precios = [1500, 2000, 1800, 2400]

def promedio(numeros):
    # Completá: devolvé la suma dividida por la cantidad.
    # Te sirven sum(numeros) y len(numeros).
    pass

# Completá: imprimí round(promedio(precios), 2)
`,
      esperado: "1925.0",
      expl: "sum() suma y len() cuenta; dividir uno por el otro es el promedio. Si te dio None, te faltó el return: una función sin return devuelve None, no el último valor que calculó." }
  ], SLUG);
}

/* "Leído" se marca al llegar a la síntesis. Sin el guard, la excepción
   abortaría el resto del archivo. Si no hay observer se marca leído directo:
   es preferible a que el tema nunca pueda completarse. */
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

/* Los ejercicios primero: son lo que el usuario vino a usar. Si algo de acá se
   rompiera, el resto de la página seguiría legible. */
montarEjercicios();
montarProgresoLectura();

/* Animaciones: decorativas, van al final. Si algo falla acá abajo se pierde
   una animación, no el contenido. */
Anim.dibujar("#d-variables");
Anim.aparecer("#d-variables");
Anim.dibujar("#d-listas");
Anim.aparecer("#d-listas");
Anim.aparecer("#d-sangria");
Anim.dibujar("#d-funcion");
Anim.aparecer("#d-funcion");
