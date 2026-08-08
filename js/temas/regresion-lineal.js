/* Pegamento de esta página: solo toca `document`, no se testea con node --test.
   Si alguna sección tuviera un cálculo puro que valiera la pena extraer, se
   extraería a un módulo aparte; acá todo es DOM y SVG. */

/* Datos compartidos entre el diagrama fijado (sección 06) y el simulador
   (sección 07): las mismas ocho casas, para que ambos cuenten la misma
   historia. */
const DATOS = [[35, 62], [48, 88], [55, 96], [62, 118], [70, 128], [78, 152], [85, 160], [95, 190]];

function predecir(b0, b1, x) { return b0 + b1 * x; }

function ajuste(datos) {
  const n = datos.length;
  const mx = datos.reduce((s, [x]) => s + x, 0) / n;
  const my = datos.reduce((s, [, y]) => s + y, 0) / n;
  const num = datos.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0);
  const den = datos.reduce((s, [x]) => s + (x - mx) ** 2, 0);
  const b1 = num / den;
  const b0 = my - b1 * mx;
  return { b0, b1 };
}

function sumaCuadrados(datos, b0, b1) {
  return datos.reduce((s, [x, y]) => s + (y - predecir(b0, b1, x)) ** 2, 0);
}

/* ═══ 1. Simulador (sección 07) — manipulación directa, sin GSAP ═══ */

const aX = m2 => 60 + (m2 - 30) * 7.7;
const aY = p => 290 - (p - 50) * 1.7;

function pintarPuntosSim() {
  const g = document.getElementById("sim-puntos");
  if (!g) return;
  for (const [m2, precio] of DATOS) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("class", "dnode-solid");
    c.setAttribute("cx", aX(m2)); c.setAttribute("cy", aY(precio)); c.setAttribute("r", 5);
    g.append(c);
  }
}

function pintarSim() {
  const inputB1 = document.getElementById("sim-b1");
  const inputB0 = document.getElementById("sim-b0");
  if (!inputB1 || !inputB0) return;
  const b1 = parseFloat(inputB1.value);
  const b0 = parseFloat(inputB0.value);
  document.getElementById("out-b1").textContent = b1.toFixed(1);
  document.getElementById("out-b0").textContent = b0;

  const recta = document.getElementById("sim-recta");
  recta.setAttribute("x1", aX(30)); recta.setAttribute("y1", aY(predecir(b0, b1, 30)));
  recta.setAttribute("x2", aX(100)); recta.setAttribute("y2", aY(predecir(b0, b1, 100)));

  const g = document.getElementById("sim-residuos");
  g.replaceChildren();
  for (const [m2, precio] of DATOS) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("class", "dedge-mute");
    l.setAttribute("x1", aX(m2)); l.setAttribute("y1", aY(precio));
    l.setAttribute("x2", aX(m2)); l.setAttribute("y2", aY(predecir(b0, b1, m2)));
    g.append(l);
  }
  document.getElementById("sim-sse").textContent = Math.round(sumaCuadrados(DATOS, b0, b1)).toLocaleString("es-AR");
}

function montarSimulador() {
  if (!document.getElementById("sim-svg")) return;
  pintarPuntosSim();
  for (const id of ["sim-b1", "sim-b0"]) {
    document.getElementById(id).addEventListener("input", pintarSim);
  }
  pintarSim();
}

/* ═══ 2. Ejercicios (sección 08) ═══ */

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "rl-c1",
      q: "¿Por qué los errores se elevan al cuadrado en vez de sumarse tal cual?",
      opts: [
        "Porque el cuadrado es más fácil de calcular",
        "Porque si no, los errores positivos y negativos se cancelan entre sí",
        "Porque así el resultado siempre da un número entero",
        "Porque los errores negativos no existen"
      ],
      c: 1,
      expl: "Un punto 10 arriba y otro 10 abajo darían error total cero, y la recta parecería perfecta siendo mala. El cuadrado los hace sumar, y de paso castiga más los errores grandes." },

    { tipo: "num", id: "rl-n1",
      q: "Con los puntos de la tabla de la sección 04 —(1,2), (2,4), (3,5), (4,4) y (5,5)— ¿cuánto vale la pendiente β₁? Redondeá a dos decimales.",
      resp: 0.60, tol: 0.02,
      trampas: [
        { val: 4.0, msg: "Eso es ȳ, el promedio de los y. La pendiente no es un promedio: compara cómo se mueven x e y juntos, no promedia uno solo." },
        { val: 1.67, msg: "Diste vuelta la fracción: el numerador mide cómo se mueven x e y juntos, el denominador mide cuánto varía x sola. Te quedó al revés." }
      ],
      expl: "x̄ = 3, ȳ = 4. El numerador Σ(xᵢ−x̄)(yᵢ−ȳ) da 6, el denominador Σ(xᵢ−x̄)² da 10. 6 / 10 = 0.6." },

    { tipo: "num", id: "rl-n2",
      q: "Con la misma pendiente, ¿cuánto vale el intercepto β₀?",
      resp: 2.2, tol: 0.02,
      trampas: [
        { val: 5.8, msg: "Sumaste en vez de restar: β₀ = ȳ − β₁x̄, no ȳ + β₁x̄." },
        { val: -1.8, msg: "Calculaste β₁x̄ − ȳ, al revés. Es ȳ − β₁x̄, no lo opuesto." }
      ],
      expl: "β₀ = ȳ − β₁x̄ = 4 − 0.6 × 3 = 2.2." },

    { tipo: "parsons", id: "rl-p1",
      q: "Armá la función que calcula la pendiente. Sobra una línea: descartala con ×.",
      lineas: [
        "def pendiente(x, y):",
        "    mx = sum(x) / len(x)",
        "    my = sum(y) / len(y)",
        "    num = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))",
        "    den = sum((xi - mx) ** 2 for xi in x)",
        "    return num / den"
      ],
      distractores: ["    den = sum((yi - my) ** 2 for yi in y)"],
      expl: "El denominador siempre lleva la variación de x. Si usás la de y, estás calculando otra cosa." },

    { tipo: "python", id: "rl-py1",
      q: "Ajustá la misma recta con scikit-learn. Con round(valor, 2), imprimí primero la pendiente y después el intercepto, separados por un espacio: print(round(pendiente, 2), round(intercepto, 2)).",
      inicial: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 5, 4, 5])

modelo = LinearRegression()
# Completá: entrenalo con modelo.fit(X, y) y después imprimí
# round(modelo.coef_[0], 2) y round(modelo.intercept_, 2)
`,
      paquetes: ["scikit-learn", "numpy"],
      esperado: "0.6 2.2",
      expl: "modelo.fit(X, y) ajusta β₀ y β₁; coef_ e intercept_ te los devuelven. Es la misma cuenta de la tabla de la sección 04, hecha por la librería." }
  ], "regresion-lineal");
}

/* ═══ 3. Progreso: "leído" se marca al llegar a la síntesis ═══ */

function montarProgresoLectura() {
  const sintesis = document.getElementById("sintesis");
  if (!sintesis) return;
  // Sin el guard, la excepcion abortaria el resto del archivo — y abajo esta
  // montarConceptNav. Si no hay observer, se marca leido directo: es preferible
  // a que el tema nunca pueda completarse.
  if (typeof IntersectionObserver === "undefined") {
    Progreso.marcarLeido("regresion-lineal");
    return;
  }
  new IntersectionObserver((es, obs) => {
    if (es[0].isIntersecting) {
      Progreso.marcarLeido("regresion-lineal");
      obs.disconnect();
    }
  }, { threshold: 0.6 }).observe(sintesis);
}

/* Ejercicios y simulador primero: son lo que el usuario vino a usar. Si algo
   de acá se rompiera, el resto de la página seguiría legible y usable. */
montarSimulador();
montarEjercicios();
montarProgresoLectura();
/* La nav prev/next ya no se llama desde acá: `shared.js` la monta sola,
   deduciendo el tema del nombre del archivo. */

/* ═══ 4. Animaciones — decorativas, van al final ═══ */
/* Si algo de acá abajo fallara, se pierde una animación, no el contenido. */

const etqError = document.getElementById("etq-error");
if (etqError) {
  const { b0, b1 } = ajuste(DATOS);
  etqError.textContent = `error: ${Math.round(sumaCuadrados(DATOS, b0, b1)).toLocaleString("es-AR")}`;
}

Anim.secuencia("#s-ajuste", [
  { el: "#recta", desde: { attr: { y1: 300, y2: 280 } }, hasta: { attr: { y1: 290, y2: 150 } } },
  { el: "#recta", desde: { attr: { y1: 290, y2: 150 } }, hasta: { attr: { y1: 305, y2: 105 } } },
  { el: "#recta", desde: { attr: { y1: 305, y2: 105 } }, hasta: { attr: { y1: 300, y2: 120 } } }
]);
Anim.dibujar("#d-intuicion");
Anim.aparecer("#d-intuicion");
Anim.dibujar("#d-residuos");
Anim.aparecer("#d-residuos");
