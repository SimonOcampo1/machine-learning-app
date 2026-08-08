# Brief para escribir un tema

Leelo entero antes de escribir. Después leé **una sola vez**
`concept-01-python.html` y `python.js`: son la plantilla canónica. Reusá esa
lectura para todos los temas que te tocaron, no la releas por tema.

No leas los PDF de `assets/`: son de cientos de MB y no entran. Escribí de tu
propio conocimiento del tema.

## Qué creás

Por cada tema asignado, exactamente **dos archivos nuevos**:

- `concept-NN-slug.html`
- `slug.js`

`NN` y `slug` te los da tu asignación y tienen que coincidir con el nombre
exacto que se te indicó. `NN` va con dos dígitos.

## Qué NO tocás

Estos archivos son compartidos y los edita otro. Si los tocás, se pisan:

- `data/temario.json`
- `css/shared.css`, `js/nucleo/shared.js`, `js/nucleo/anim.js`, `js/nucleo/ejercicios.js`, `js/nucleo/progreso.js`
- `js/paginas/index.js`, `index.html`, `temas.html`, `js/paginas/temas.js`, `scripts/verificar.js`
- Cualquier `concept-*.html` que no sea tuyo

**No corras `npm run verificar`.** Va a marcar tus archivos como error hasta
que se agreguen al temario, cosa que hace otro al final. Corré `node --test`
solo si tocaste algo fuera de tus dos archivos, que no deberías.

## Clase de fase

El `<body>` lleva `class="fase-N"` con N la fase del tema. De ahí hereda el
color toda la página. Ningún componente elige su color, lo recibe.

| Fase | Temas | Nombre |
|---|---|---|
| 0 | 01–04 | Piso |
| 1 | 05–08 | Aprender de los datos |
| 2 | 09–11 | Regresión |
| 3 | 12–16 | Clasificación |
| 4 | 17–21 | Árboles y no supervisado |
| 5 | 22–24 | Redes neuronales |

## Estructura de la página

Copiá el esqueleto de `concept-01-python.html` tal cual y cambiá el contenido.
Las partes fijas son: `<head>`, el bloque `<svg class="svg-defs">`, la `<nav>`,
el `<footer class="pie">` y los `<script>` del final. Cambian:

- `<title>` → `Título del tema · ML`
- `<meta name="description">` → una línea real, no genérica
- El breadcrumb, que nombra la fase
- `<p class="eyebrow">{ Tema NN · Nombre de la fase }</p>`
- `<h1>` y `<p class="lede">`
- Las secciones
- El `<script src="slug.js">` del final

Entre **7 y 9 secciones**, numeradas `01`, `02`, … en `.sec-no`. Las últimas
tres son siempre, en este orden:

1. **Ejercicios** — solo un `<div id="ejercicios"></div>`.
2. **Errores frecuentes** — 2 o 3 `.callout`, ver abajo.
3. **Síntesis** — `<section class="section reveal" id="sintesis">`, un solo
   párrafo largo que recorre todo el tema y termina anticipando el siguiente.
   El `id="sintesis"` es obligatorio: es lo que marca el tema como leído.

Después de la última sección va `<nav class="concept-nav"></nav>` vacía. Se
llena sola.

Toda sección lleva `class="section reveal"` salvo las que tengan un diagrama
animado por scroll, que van sin `reveal` para no pelearse con la animación.

## Reglas de diseño que no se negocian

Salen de `DESIGN.md`, que deriva del sistema real de gsap.com. Romperlas hace
fallar el verificador o rompe la coherencia visual.

- **Todo `.eyebrow` va entre llaves**: `{ Así }`. El verificador lo exige. Es
  la firma tipográfica del sistema. Abrí cada sección con uno.
- **Ningún color hexadecimal dentro de un `<svg>`.** Todo por clase. El
  verificador lo rechaza.
- **Ni `border-left` de acento, ni `box-shadow`, ni `background-clip: text`.**
- **No inventes clases CSS ni escribas `<style>`.** Usá solo las que existen en
  `css/shared.css`. Si te falta un componente, resolvelo con los que hay.
- **Nada de emoji.**
- Usá `<code>` para nombres de función, variables y fragmentos de código.

### Clases disponibles para el contenido

- `.callout` — caja con borde y tinte de fase. Variantes: `.callout.warn`
  (naranja, "Cuidado"/"Trampa"), `.callout.err` (rosa, "Error clásico"),
  `.callout.ok` (verde, "Clave"), `.callout.formula` (centrado, monoespaciada).
  Adentro, `<span class="etiqueta">Rótulo</span>` como primer hijo.
- `.diagram` — `<figure>` con el `<svg>` y un `<figcaption>`.
- `.tabla-scroll` > `.tabla-calc` — tabla de cálculo paso a paso.
- `.pillars` > `.pilar` — comparación de 2-3 conceptos en paralelo.
- `.dist-grid` > `.dist` — pares que se confunden.

### Clases para el SVG

`.daxis` (ejes), `.dedge` (línea de acento, es lo que se anima al dibujar),
`.dedge-mute` (línea gris), `.dnode-bg` (forma con relleno tenue y borde),
`.dnode-solid` (forma sólida), `.dfill` (relleno con gradiente interno, para
las formas orgánicas: domos, píldoras, blobs), `.dtxt` (texto), `.dtxt-mute`
(texto secundario), `.dlabel` (rótulo en color de fase).

Todo `<svg>` lleva `viewBox`, `role="img"` y un `aria-label` que describa lo
que muestra, no lo que es. Dale `id="d-algo"` a cada `<figure class="diagram">`
para poder animarlo.

**Dos o tres diagramas por tema.** Que expliquen el mecanismo, no que decoren.

## El archivo JS

Copiá la estructura de `python.js`. Lleva, en este orden:

1. `const SLUG = "slug";`
2. `montarEjercicios()` con los 5 ejercicios.
3. `montarProgresoLectura()` — copiala tal cual, cambia solo el SLUG.
4. Las llamadas sueltas: `montarEjercicios(); montarProgresoLectura();`
5. Las animaciones al final: `Anim.dibujar("#d-x"); Anim.aparecer("#d-x");`

### Los 5 ejercicios

Siempre cinco, siempre en este orden y con estos tipos:

- **2 × `mcq`** — conceptuales. `{ tipo, id, q, opts: [4 strings], c: índice
  correcto, expl }`. Las tres opciones incorrectas tienen que ser errores
  plausibles y reales, no relleno obvio.
- **1 × `num`** — numérico. `{ tipo, id, q, resp, tol, trampas: [{val, msg}],
  expl }`. Las `trampas` son los valores que da un error de razonamiento
  concreto, con un mensaje que nombra ese error. Poné 2.
- **1 × `parsons`** — ordenar código. `{ tipo, id, q, lineas: [...],
  distractores: [1 línea], expl }`. `lineas` va en el orden correcto. El
  distractor tiene que ser una variante creíble y sutilmente mal.
- **1 × `python`** — código real, corre en el navegador con Pyodide.
  `{ tipo, id, q, inicial, paquetes: ["numpy"], esperado, expl }`.
  `inicial` es código con huecos marcados con comentarios `# Completá:`.
  `esperado` es la salida exacta que tiene que imprimir, comparada con
  `.trim()`. **Verificá tu propia aritmética**: si `esperado` no coincide con
  lo que el código produce, el ejercicio es imposible.

`id` con prefijo del tema, corto y único dentro del archivo. Ej. para KNN:
`knn-c1`, `knn-c2`, `knn-n1`, `knn-p1`, `knn-py1`.

`expl` explica **por qué**, no repite la respuesta.

## Voz

- Castellano rioplatense, voseo. "Fijate", "tenés", "mirá".
- Escribís para dos personas que arrancan de cero y no programan. No son
  tontas: no las trates como tales, pero no des por sabido nada que no se haya
  explicado en un tema anterior.
- Sin entusiasmo impostado. Nada de "¡es más fácil de lo que parece!". Si algo
  es difícil, decilo y seguí.
- Explicá el modo de falla, no solo el resultado. Qué se rompe, cómo se ve
  cuando se rompe, y por qué el error es silencioso si lo es.
- Cada tema da por sentado los anteriores y prepara el siguiente. La síntesis
  cierra nombrando el que viene.
- Sin em dashes (—) como separador de frase: usá comas, dos puntos o paréntesis.
  Sí podés usarlos dentro de una aclaración corta si ya venías usándolos.
- Ejemplos concretos con números, no abstracciones. Un solo hilo de ejemplo por
  tema, sostenido de punta a punta, funciona mejor que cinco sueltos.

## Errores frecuentes

La sección de errores es de las más valiosas del sitio. Dos o tres callouts,
cada uno con un error real que comete quien aprende, no una advertencia
genérica. Al menos uno tiene que ser un **error silencioso**: el código corre,
no hay excepción, y el resultado está mal.

## Antes de dar por terminado cada tema

- Los ids de ejercicio no se repiten dentro del archivo.
- Todo `.eyebrow` tiene sus llaves.
- Ningún hex adentro de un `<svg>`.
- Existe `id="sintesis"`.
- Cada `id="d-algo"` que animás en el JS existe en el HTML, y al revés.
- La cuenta del ejercicio `num` y la salida del `python` están bien hechas.
