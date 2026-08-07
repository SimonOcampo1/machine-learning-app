const HITOS = [
  { anio: "1805", t: "Mínimos cuadrados", d: "Legendre publica el método que todavía hoy es la base de la regresión lineal." },
  { anio: "1957", t: "Perceptrón", d: "Rosenblatt construye la primera neurona artificial que aprende de sus errores." },
  { anio: "1986", t: "Backpropagation", d: "Rumelhart, Hinton y Williams lo popularizan: por fin se pueden entrenar redes de varias capas." },
  { anio: "1995", t: "Support Vector Machines", d: "Cortes y Vapnik. Dominan la clasificación durante quince años." },
  { anio: "2001", t: "Random Forest", d: "Breiman: muchos árboles mediocres votando le ganan a un árbol muy bueno." },
  { anio: "2012", t: "AlexNet", d: "Una red convolucional gana ImageNet por paliza y arranca la era del deep learning." },
  { anio: "2017", t: "Transformers", d: "«Attention is all you need». Es la arquitectura detrás de todo lo que vino después." }
];

const DISTINCIONES = [
  { a: "Regresión", b: "Clasificación",
    trampa: "Las dos predicen, pero una devuelve un número continuo y la otra una categoría.",
    truco: "¿La respuesta admite un punto y medio? Si sí, es regresión." },
  { a: "Overfitting", b: "Underfitting",
    trampa: "Overfitting se memorizó los datos de entrenamiento; underfitting ni siquiera los aprendió.",
    truco: "Mirá los dos errores: si el de train es bajo y el de test alto, es overfitting. Si los dos son altos, underfitting." },
  { a: "Paramétrico", b: "No paramétrico",
    trampa: "No paramétrico no significa «sin parámetros», sino que la cantidad crece con los datos.",
    truco: "Regresión lineal siempre tiene los mismos coeficientes. KNN guarda el dataset entero." },
  { a: "Bagging", b: "Boosting",
    trampa: "Los dos combinan modelos débiles, pero bagging los entrena en paralelo y boosting en cadena.",
    truco: "Bagging vota en asamblea. Boosting es una fila donde cada uno corrige al anterior." },
  { a: "Supervisado", b: "No supervisado",
    trampa: "La diferencia no es el algoritmo, es si los datos vienen con la respuesta.",
    truco: "¿Hay una columna «y»? Supervisado." }
];

function pintarTimeline() {
  const ol = document.getElementById("timeline");
  for (const h of HITOS) {
    const li = document.createElement("li");
    li.className = "tl-item";
    li.innerHTML = `<span class="tl-anio">${h.anio}</span>
                    <div><h3>${h.t}</h3><p>${h.d}</p></div>`;
    ol.append(li);
  }
}

function pintarDistinciones() {
  const cont = document.getElementById("distinciones");
  for (const d of DISTINCIONES) {
    const art = document.createElement("article");
    art.className = "dist";
    art.innerHTML = `<h3>${d.a} <span class="dist-vs">vs</span> ${d.b}</h3>
                     <p class="dist-trampa">${d.trampa}</p>
                     <p class="dist-truco"><strong>Truco:</strong> ${d.truco}</p>`;
    cont.append(art);
  }
}

async function pintarListaTemas() {
  let temario;
  try {
    temario = await fetch("data/temario.json").then(r => r.json());
  } catch {
    // Una pagina vacia sin explicacion es el peor fallo posible: los usuarios
    // del sitio no programan y no tienen como saber que paso.
    const cont = document.getElementById("lista-temas");
    if (cont) {
      const aviso = document.createElement("p");
      aviso.className = "aviso-error";
      aviso.textContent = "No se pudo cargar el temario. Si abriste el archivo directamente, probá servirlo con `npx serve` — el navegador bloquea la lectura de datos con file://.";
      cont.replaceChildren(aviso);
    }
    return;
  }
  const cont = document.getElementById("lista-temas");
  for (const fase of temario.fases) {
    const bloque = document.createElement("div");
    bloque.className = `fase-bloque fase-${fase.n}`;
    const ol = document.createElement("ol");
    ol.className = "concept-list";
    for (const tema of fase.temas) {
      const li = document.createElement("li");
      li.className = "ci";
      const existe = tema.escrito === true;
      li.innerHTML = `<span class="ci-n">${String(tema.n).padStart(2, "0")}</span>
                      <span class="ci-t">${tema.titulo}</span>
                      ${existe ? `<a class="ci-ver" href="${tema.archivo}">Ver concepto →</a>`
                               : `<span class="ci-ver ci-pronto">próximamente</span>`}`;
      ol.append(li);
    }
    bloque.innerHTML = `<h3 class="fase-tit">Fase ${fase.n} · ${fase.nombre}</h3>`;
    bloque.append(ol);
    cont.append(bloque);
  }
}

addEventListener("DOMContentLoaded", () => {
  pintarTimeline();
  pintarDistinciones();
  pintarListaTemas();
});
