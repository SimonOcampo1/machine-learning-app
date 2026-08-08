/* Pegamento del tema 24, el último. Solo toca `document`. */

const SLUG = "cnn";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "cn-c1",
      q: "¿Cuál es la idea central que hace que una convolución tenga tan pocos parámetros comparada con una capa densa?",
      opts: [
        "Que usa números de menor precisión para ahorrar memoria",
        "Que los mismos pesos del filtro se aplican en todas las posiciones de la imagen",
        "Que descarta los píxeles menos informativos antes de procesar",
        "Que procesa la imagen en blanco y negro en vez de en color"
      ],
      c: 1,
      expl: "Compartir parámetros es la idea del tema. Una capa densa aprende un peso por cada píxel y cada neurona; una convolucional aprende nueve pesos por filtro y los reutiliza en toda la imagen. De ahí sale, además, que un patrón aprendido se detecte en cualquier posición." },

    { tipo: "mcq", id: "cn-c2",
      q: "Tenés 800 fotos etiquetadas para clasificar dos tipos de pieza en una fábrica. ¿Cuál es el mejor enfoque?",
      opts: [
        "Entrenar una CNN desde cero, ajustando la arquitectura a tu problema",
        "Transfer learning: tomar una red preentrenada y reemplazar solo las últimas capas",
        "Usar una red densa, porque con 800 imágenes una CNN sobreajusta",
        "Usar gradient boosting sobre los píxeles aplanados"
      ],
      c: 1,
      expl: "Con 800 imágenes, entrenar desde cero sobreajusta sin remedio. Las primeras capas de una red preentrenada ya saben detectar bordes y texturas, que sirven para cualquier imagen: solo hace falta enseñarle a decidir. Se logran resultados excelentes en minutos y en una máquina común." },

    { tipo: "num", id: "cn-n1",
      q: "Una capa convolucional tiene 32 filtros de 3×3 sobre una imagen en color (3 canales), más un sesgo por filtro. ¿Cuántos parámetros entrenables tiene?",
      resp: 896, tol: 0.5,
      trampas: [
        { val: 864, msg: "Contaste solo los pesos (3×3×3×32) y te olvidaste de los sesgos: hay uno por filtro, o sea 32 más." },
        { val: 288, msg: "Te olvidaste de multiplicar por los 3 canales de color. Cada filtro de 3×3 se aplica a los tres canales, así que tiene 27 pesos, no 9." }
      ],
      expl: "3×3×3 = 27 pesos por filtro, por 32 filtros son 864, más 32 sesgos: 896. Compará con la capa densa del texto, que tenía 120 millones. Esa diferencia de cinco órdenes de magnitud es lo que hace viable el problema." },

    { tipo: "parsons", id: "cn-p1",
      q: "Armá un transfer learning: congelar la base preentrenada y entrenar solo la cabeza nueva. Sobra una línea: descartala con ×.",
      lineas: [
        "base = ResNet50(weights='imagenet', include_top=False)",
        "base.trainable = False",
        "modelo = Sequential([base, GlobalAveragePooling2D(), Dense(1, activation='sigmoid')])",
        "modelo.compile(optimizer='adam', loss='binary_crossentropy')",
        "modelo.fit(train, epochs=10)"
      ],
      distractores: ["base = ResNet50(weights=None, include_top=False)"],
      expl: "weights='imagenet' es lo que trae los pesos ya entrenados sobre millones de fotos, que es todo el punto del transfer learning; con weights=None arrancás desde cero y perdés la ventaja. include_top=False descarta la cabeza original, y trainable=False congela la base para que solo se entrene lo nuevo." },

    { tipo: "python", id: "cn-py1",
      q: "Compará los parámetros de una capa densa y una convolucional sobre la misma imagen. Imprimí los dos y cuántas veces más grande es la densa: print(densa, conv, round(razon)).",
      inicial: `alto, ancho, canales = 200, 200, 3
neuronas_densa = 1000
filtros, k = 32, 3

# Completá: parámetros de una capa densa que conecta TODOS los píxeles
# con todas sus neuronas, más un sesgo por neurona.
densa = None

# Completá: parámetros de una capa convolucional: cada filtro tiene
# k*k*canales pesos, más un sesgo por filtro.
conv = None

# Completá: cuántas veces más grande es la densa.
razon = None

# Completá: imprimí densa, conv y round(razon)
`,
      esperado: "120001000 896 133930",
      expl: "Ciento veinte millones contra ochocientos noventa y seis: la densa tiene ciento treinta y tres mil veces más parámetros, y encima ninguno de ellos sabe que dos píxeles vecinos están relacionados. Con esta cuenta cierra el sitio, y es un buen resumen de todo: la arquitectura correcta no es la más grande, es la que aprovecha la estructura que los datos ya tienen." }
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
Anim.dibujar("#d-conv");
Anim.aparecer("#d-conv");
