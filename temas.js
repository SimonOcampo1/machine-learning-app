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

/* Todo se arma con nodos, no con `innerHTML`. Estos textos son del repo, pero
   uno solo con un `&` o un `<` rompía el markup sin avisar. */
function elem(tag, clase, texto) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function pintarTimeline() {
  const ol = document.getElementById("timeline");
  if (!ol) return;
  for (const h of HITOS) {
    const li = elem("li", "tl-item");
    const caja = elem("div");
    caja.append(elem("h3", null, h.t), elem("p", null, h.d));
    li.append(elem("span", "tl-anio", h.anio), caja);
    ol.append(li);
  }
}

function pintarDistinciones() {
  const cont = document.getElementById("distinciones");
  if (!cont) return;
  for (const d of DISTINCIONES) {
    const art = elem("article", "dist");
    const h3 = elem("h3");
    h3.append(`${d.a} `, elem("span", "dist-vs", "vs"), ` ${d.b}`);
    const truco = elem("p", "dist-truco");
    truco.append(elem("strong", null, "Truco:"), ` ${d.truco}`);
    art.append(h3, elem("p", "dist-trampa", d.trampa), truco);
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
      cont.replaceChildren(elem("p", "aviso-error",
        "No se pudo cargar el temario. Si abriste el archivo directamente, probá servirlo con `npx serve` — el navegador bloquea la lectura de datos con file://."));
    }
    return;
  }
  const cont = document.getElementById("lista-temas");
  if (!cont) return;
  for (const fase of temario.fases) {
    const bloque = elem("div", `fase-bloque fase-${fase.n}`);
    bloque.append(elem("h3", "fase-tit", `Fase ${fase.n} · ${fase.nombre}`));

    const ol = elem("ol", "concept-list");
    for (const tema of fase.temas) {
      const li = elem("li", "ci");
      const existe = tema.escrito === true;
      let ver;
      if (existe) {
        ver = elem("a", "ci-ver", "Ver concepto →");
        ver.href = tema.archivo;
      } else {
        ver = elem("span", "ci-ver ci-pronto", "próximamente");
      }
      li.append(
        elem("span", "ci-n", String(tema.n).padStart(2, "0")),
        elem("span", "ci-t", tema.titulo),
        ver
      );
      ol.append(li);
    }
    bloque.append(ol);
    cont.append(bloque);
  }
}

addEventListener("DOMContentLoaded", () => {
  pintarTimeline();
  pintarDistinciones();
  pintarListaTemas();
});
