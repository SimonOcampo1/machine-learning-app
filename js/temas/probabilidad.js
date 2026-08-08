/* Pegamento del tema 04. Solo toca `document`, no se testea con node --test. */

const SLUG = "probabilidad";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "pr-c1",
      q: "En una oficina la media de sueldos es 191.700 y la mediana es 52.500. ¿Qué te dice esa diferencia?",
      opts: [
        "Que alguien se equivocó al calcular: media y mediana tienen que dar parecido",
        "Que hay al menos un valor muy alto que arrastra la media",
        "Que los sueldos siguen una distribución normal bien ancha",
        "Que la mitad de la gente gana menos de 52.500 y la otra mitad gana 191.700"
      ],
      c: 1,
      expl: "La mediana solo mira quién está en el medio, así que un extremo no la mueve. La media suma todo, así que un sueldo enorme la arrastra. Verlas separadas es la señal de que hay outliers, y conviene ir a buscarlos antes de entrenar nada." },

    { tipo: "mcq", id: "pr-c2",
      q: "Un test de una enfermedad rara acierta el 99% de las veces, tanto en enfermos como en sanos. Te da positivo. ¿Por qué la chance de estar enfermo es mucho menor al 99%?",
      opts: [
        "Porque el test en realidad es peor de lo que dice su fabricante",
        "Porque hay muchísima más gente sana, y el 1% de error sobre ese grupo enorme produce más falsos positivos que verdaderos",
        "Porque el 99% se refiere al promedio de muchos tests, no a uno solo",
        "Porque hay que hacerse el test dos veces para que el 99% valga"
      ],
      c: 1,
      expl: "El test está bien: la enfermedad es rara. Con 100 enfermos y 99.900 sanos por cada 100.000 personas, el 1% de error sobre los sanos son 999 falsos positivos contra apenas 99 verdaderos. Es aritmética, no una falla del test." },

    { tipo: "num", id: "pr-n1",
      q: "Otra enfermedad, esta vez en 1 de cada 100 personas. El test acierta el 95% de las veces en enfermos y el 95% en sanos. Sobre 100.000 personas, ¿qué porcentaje de los que dan positivo está realmente enfermo? Redondeá a un decimal.",
      resp: 16.1, tol: 0.05,
      trampas: [
        { val: 95, msg: "Ese es P(positivo | enfermo), la precisión del test. La pregunta es al revés: P(enfermo | positivo). Dar vuelta el condicional cambia la respuesta, y acá la cambia muchísimo." },
        { val: 1, msg: "Esa es la frecuencia de la enfermedad antes de hacerse el test. El positivo sí es información y sube la probabilidad: de 1% a 16%. Lo que no hace es llevarla al 95%." }
      ],
      expl: "1.000 enfermos, de los cuales el test agarra 950. 99.000 sanos, de los cuales el 5% da falso positivo: 4.950. Positivos totales 5.900, de los cuales 950 están enfermos: 950/5900 = 16,1%. El positivo multiplicó por dieciséis tu probabilidad, pero sigue siendo mucho más probable que estés sano." },

    { tipo: "parsons", id: "pr-p1",
      q: "Armá una función que estandarice una lista de valores: a cada uno le resta la media y lo divide por el desvío. Sobra una línea: descartala con ×.",
      lineas: [
        "def estandarizar(valores):",
        "    m = np.mean(valores)",
        "    s = np.std(valores)",
        "    return (valores - m) / s"
      ],
      distractores: ["    return (valores - m) / np.var(valores)"],
      expl: "Se divide por el desvío, no por la varianza. La varianza está en unidades al cuadrado, así que dividir por ella no deja el resultado en 'cuántos desvíos me alejo': deja algo sin interpretación. Las dos líneas corren sin error; solo una da lo correcto." },

    { tipo: "python", id: "pr-py1",
      q: "Contá el caso del test médico del texto sobre 100.000 personas. Imprimí cuántos enfermos dan positivo, cuántos sanos dan positivo, y qué porcentaje de los positivos está enfermo: print(ep, sp, round(pct, 1)).",
      inicial: `poblacion = 100000
prevalencia = 0.001   # 1 de cada 1000
acierto = 0.99        # tanto en enfermos como en sanos

enfermos = int(poblacion * prevalencia)
sanos = poblacion - enfermos

# Completá: enfermos que dan positivo (el test los agarra)
ep = None

# Completá: sanos que dan positivo (el test se equivoca en ellos)
sp = None

# Completá: qué porcentaje de TODOS los positivos está realmente enfermo
pct = None

# Completá: imprimí ep, sp y round(pct, 1)
`,
      esperado: "99 999 9.0",
      expl: "99 verdaderos positivos contra 999 falsos: el test acierta el 99% y aun así nueve de cada diez positivos son gente sana. Cambiá la prevalencia a 0.1 y volvé a correrlo para ver cómo el mismo test pasa a ser confiable cuando la enfermedad es común. Lo que decide no es la calidad del test, es qué tan raro es lo que buscás." }
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
Anim.aparecer("#d-dispersion");
Anim.dibujar("#d-normal");
Anim.aparecer("#d-normal");
Anim.dibujar("#d-bayes");
Anim.aparecer("#d-bayes");
