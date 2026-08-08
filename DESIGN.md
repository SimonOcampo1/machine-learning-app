# Machine Learning · Estudio — Design

> Una pizarra animada en un estudio de diseño. Pared casi negra, tiza crema
> cálida, y seis marcadores de color: uno por fase del temario.

**Theme:** dark (único)

Derivado de `DESIGN-gsap.md`, la referencia de estilo de gsap.com. Ese archivo es
la fuente; este es la adaptación al proyecto. Donde los dos difieran, este manda,
y la diferencia está anotada abajo con su razón.

## Desvíos deliberados respecto de gsap.com

| Punto | gsap.com | Acá | Por qué |
|---|---|---|---|
| Familia | Mori (de pago) | **Inter Tight** | Sustituto que el propio `DESIGN-gsap.md` nombra primero. Sale más frío y apretado que Mori; asumido. |
| Taxonomía | 5 disciplinas | **6 fases** | El temario tiene seis. El sexto color sale de `Category Color Label`, que ya nombra un sexto: `Other #abff84`. No se inventa ninguno. |
| Display | 224px fijo | `clamp()` fluido | 224px en un móvil no entra. El techo es 224px en viewport ancho. |
| Escala tipo | px fijos | `clamp()` fluido | Mismo motivo. Los valores GSAP son los extremos superiores. |
| Tema claro | no existe | **no existe** | Se borró el que había. El doc prohíbe romper el par crema-sobre-negro. |
| Formas 3D | render orgánico decorativo | **SVG con gradiente, portando datos** | Acá el diagrama explica un algoritmo. Hereda el lenguaje visual (gradiente interno, sin sombra, desborde suelto) pero cada forma significa algo. |

## Tokens — Colors

Crudos de GSAP. Nunca se usan directo fuera del bloque `:root`.

| Nombre | Valor | Token | Rol |
|---|---|---|---|
| Just Black | `#0e100f` | `--just-black` | Canvas de la página, único fondo |
| Off Black | `#191919` | `--off-black` | Panel anidado: pie, bloques de código, tarjetas |
| Surface Cream | `#fffce1` | `--cream` | Texto primario, bordes de botones ghost, títulos |
| Surface 75 | `#bbbaa6` | `--s75` | **Todo el texto secundario.** Ver la nota de abajo |
| Surface 50 | `#7c7c6f` | `--s50` | **Nunca texto.** Trazos de eje en SVG, rellenos de ícono en reposo |
| Surface 25 | `#42433d` | `--s25` | Filetes de 1px, divisores, contornos de bajo contraste |

**Por qué hay dos grises.** GSAP usa `#7c7c6f` como su apagado de texto, y sobre
su canvas da 4.52:1 — pasa AA raspando. Pero acá el texto secundario también vive
dentro de las tarjetas (`#191919`), y ahí cae a **4.16:1**: no llega. En vez de
bajar el piso, el token de texto pasa a ser `--s75` (9.72:1 y 8.95:1) y `--s50`
queda para lo no-textual, donde el piso es 3. Medido por `npm run contraste`, que
falla con código 1 si alguna fila baja.

### Taxonomía de fase

Seis colores fijos. Un color = una fase, siempre. No rotan, no se derivan, no se
calculan: son los hex de GSAP. La variable `--fase` es el único knob.

| Fase | Nombre | Valor | Origen en GSAP | Contraste sobre canvas |
|---|---|---|---|---|
| 0 | Piso | `#00bae2` | Blue (UI) | 8.29:1 |
| 1 | Aprender de los datos | `#9d95ff` | Lilac (Text) | 7.44:1 |
| 2 | Regresión | `#0ae448` | Shockingly Green (marca) | 11.10:1 |
| 3 | Clasificación | `#ff8709` | Orangey (SVG) | 7.93:1 |
| 4 | Árboles y no supervisado | `#fec5fb` | Pink (Scroll) | 13.27:1 |
| 5 | Redes neuronales | `#abff84` | Light Green (Other) | 15.79:1 |

Los seis pasan AAA sobre `#0e100f`. Valores medidos, no estimados: `npm run contraste`.

### Colores de estado

No son fases. Salen de la misma paleta para no ampliarla:

| Estado | Valor | Uso |
|---|---|---|
| ok | `#0ae448` | Ejercicio correcto, tema completo |
| error | `#ff8709` | Ejercicio incorrecto, aviso |

`#f100cb` (Lipstick Pink) queda reservado a gradientes decorativos en SVG.
Prohibido en texto y en UI, igual que en GSAP.

### Tinte de fase

`--fase-tint: color-mix(in oklab, var(--fase) 10%, var(--just-black))`.

El 10% es estético: apenas tiñe. `--cream` encima queda entre 15.56:1 y 16.43:1
en las seis fases, muy holgado sobre el piso AAA de 7 — el límite no está cerca,
así que subirlo es una decisión de gusto, no de contraste. Lo que sí es
obligatorio: si se toca el porcentaje acá, se toca la constante `TINTE` de
`scripts/contraste.js` y se vuelve a correr.

## Tokens — Typography

### Inter Tight — familia única

Un solo tipo en dos pesos. El contraste lo hace la escala, no la mezcla de
familias. Es lo que hace GSAP y es lo que sostiene el tono.

- **Pesos:** 400 (todo el cuerpo, labels, nav) y 600 (display y títulos)
- **Fallback:** `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- **Punto de reemplazo:** si algún día se compran los `.woff2` de PP Mori, se
  cambia `--font` y nada más. El resto del sistema no la nombra.

Sin monoespaciada decorativa. `--font-mono` se usa **solo donde el contenido ES
código**: el editor de Python, la terminal, los bloques `.callout.codigo` y las
líneas del Parsons. Mono como disfraz de "técnico" está prohibido.

Para alinear cifras en columna **no se usa mono**, se usa
`font-variant-numeric: tabular-nums`. Inter Tight tiene cifras de ancho fijo y
las usa cuando se le pide: se conserva la alineación y se pierde la textura
cuadrada, que en una tabla de cuentas no comunicaba nada. Aplica a
`.tabla-calc`, los `output` del simulador, los inputs numéricos y las etiquetas
de valor de los diagramas.

### Matemática: KaTeX

Toda fórmula y toda notación inline se compone con **KaTeX**, por CDN. La mono
quedó prohibida ahí: la notación tipeada a mano en Unicode
(`β₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²`) dejaba los subíndices fuera de la línea
de base y la división como un slash suelto.

El contrato es **`data-tex`**, y es al revés de lo que hace todo el mundo:

```html
<span class="mate" data-tex="R^2">R²</span>
<div class="callout formula" data-tex="\sigma(z) = \frac{1}{1 + e^{-z}}">σ(z) = 1 / (1 + e⁻ᶻ)</div>
```

El LaTeX va en el atributo y el **Unicode de siempre queda como contenido**. Con
delimitadores (`$$…$$` y un auto-render), si el CDN no responde el lector se come
`$$\beta_1 = \frac{\sum...}{}$$` crudo en la pantalla: la fórmula deja de ser
legible justo cuando ya no hay nada que la arregle. Con `data-tex`, esa misma
falla deja exactamente lo que la página mostraba antes de existir KaTeX. El
principio 4 de PRODUCT.md pide que todo camino de falla vuelva a legible, y una
fórmula ilegible es la peor manera de romperlo en un sitio de matemática.

Dos reglas que no son opcionales:

- **`.katex { position: relative }`.** KaTeX emite un MathML paralelo
  (`.katex-mathml`) que es lo que leen los lectores de pantalla, y va
  `position: absolute`. Sin un ancestro posicionado su bloque contenedor pasa a
  ser el documento y se escapa de cualquier contenedor con `overflow`: la
  anotación de la tabla de cálculo hacía scrollear la página entera 70px de lado
  en un teléfono.
- **Las unidades no son notación.** `m²` es metros cuadrados y va en Unicode, no
  en LaTeX: en LaTeX una unidad va en redonda, no en itálica matemática.

### Escala

Fluida. El extremo superior de cada `clamp()` es el valor exacto de GSAP.

| Rol | Token | Mín (400px) | Máx (1440px) | GSAP | lh | tracking |
|---|---|---|---|---|---|---|
| caption | `--t-caption` | 14px | 14px | 14 | 1.4 | -0.01em |
| body-sm | `--t-body-sm` | 15px | 17px | 16 | 1.35 | -0.01em |
| body | `--t-body` | 17px | **21px** | 19 | 1.55 | -0.01em |
| body-lg | `--t-body-lg` | 19px | 23px | 23 | 1.45 | -0.01em |
| subheading | `--t-sub` | 20px | 26px | 34 | 1.2 | -0.011em |
| heading-sm | `--t-h3` | 22px | 32px | 44 | 1.2 | -0.011em |
| heading | `--t-h2` | 26px | 42px | 66 | 1.1 | -0.011em |
| heading-lg | `--t-h1` | 30px | 64px | 101 | 1.0 | -0.011em |
| display | `--t-display` | 44px | 132px | 224 | 0.9 | -0.02em |

**Los títulos bajan un 35% respecto de GSAP y el cuerpo sube.** Son las dos
mitades del mismo arreglo y no se tocan por separado:

- Los techos de gsap.com son de una home de marketing con títulos de tres
  palabras. Acá los títulos son frases de tema ("Sesgo y varianza: el compromiso
  central") y a 101px un `h1` se partía en tres renglones en una notebook de
  1440px; los `h2` a 63px competían con el `h1` de su propia página.
- El cuerpo sube de 19 a 21px porque es la única forma honesta de llenar el
  ancho. La medida de lectura no puede pasar de 68ch, así que para que la
  columna ocupe más píxeles cada caracter tiene que medir más. A 19px la prosa
  medía 747px y sobraban ~430px muertos; a 21px mide 826px.
- La jerarquía no se pierde: `h1`/cuerpo pasa de 5.3× a 3.0×, que sigue siendo
  un salto grande.

La interpolación va de 400px a 1440px de viewport, no hasta 1920: ese es el
rango donde vive el lector real, teléfono ↔ notebook.

Nota sobre `lh` de cuerpo: GSAP usa 1.15, que sirve para párrafos cortos de
marketing. Acá el cuerpo son bloques largos de teoría sobre fondo oscuro, y el
texto claro sobre oscuro necesita más aire. Se sube a 1.55. Es un desvío
consciente del doc, por legibilidad.

## Tokens — Spacing & Shapes

**Base:** 4px. **Densidad:** cómoda.

`--e2: 8px` · `--e3: 12px` · `--e4: 16px` · `--e5: 20px` · `--e6: 24px` ·
`--e8: 32px` · `--e19: 76px` · `--e24: 96px` · `--e27: 108px`

### Radios

| Elemento | Valor |
|---|---|
| tarjetas, tags | 8px |
| pills y botones | 100px |
| filetes | 0 |

### Layout

- Ancho máximo de página: **1280px**
- Separación entre secciones: **80px**, hasta 108px en los cortes fuertes
- Padding de tarjeta: **24px**
- Gap entre elementos: **16px**
- Medida de lectura: **68ch** (`--medida`)
- Columna de notas al margen: **`clamp(14rem, 22vw, 20rem)`** (`--margen`)

### Grilla editorial de tres columnas

Toda página de tema es `[riel del número 4rem] [prosa 68ch] [margen anotado]`.
El margen no es aire sobrante: es donde viven las notas.

| Qué | Dónde va |
|---|---|
| Párrafos | Columna de prosa, capados en 68ch, justificados |
| Callout que **interrumpe** prosa | Flota al margen, a la altura del párrafo que lo dispara |
| Callout que **cierra** una sección, o tira de varios | Prosa + margen, en dos columnas de ≥30rem |
| Leyenda de diagrama (`figcaption`) | Margen, al lado de la figura |
| Diagramas, tablas, ejercicios | Prosa + margen |

**Las notas al margen van con `float`, no con grid.** Un grid de dos columnas le
da una FILA propia a cada hijo: el callout en la columna 2 empuja al párrafo
siguiente por debajo suyo y deja un hueco de su alto en la columna de prosa. El
float no consume fila, se cuelga al costado del flujo. Es además la técnica
original de Tufte, no un rodeo.

Por debajo de 1100px el margen colapsa y todo vuelve al flujo, en el orden del
HTML.

### Justificado

La prosa va **justificada con `hyphens: auto`**, nunca sin. Justificar en
castellano sin partición de palabras abre "ríos": el idioma tiene palabras
largas y el navegador, para llegar al margen sin poder cortarlas, estira los
espacios hasta que aparecen canales blancos verticales. No se justifican los
textos cortos (leyendas, lede, pies, notas de paso): una sola línea justificada
queda llena de agujeros.

## Components

### Anotación entre llaves

`{ Así }`. La firma del sistema. Abre toda sección, todo hero, todo bloque de
fase. Crema o color de fase, 14–19px, peso 400, sin fondo ni borde. Las llaves
son parte del texto, no un pseudo-elemento decorativo: se leen en voz alta.

Reemplaza al `.eyebrow` en versalitas mono del diseño anterior.

### Pill ghost

El único control del sistema. Fondo transparente, borde 1px crema, texto crema
600 a 18px, radio 100px, padding 15px/24px. **Nunca relleno.** En hover el borde
baja a 0.8 de opacidad; no cambia de fondo.

Escalación cromática máxima permitida: borde de 1.5px con el gradiente
`#0ae448 → #abff84` a 114.41deg, reservado a la acción principal de la página
(enviar un ejercicio, empezar un tema). Una por vista.

### Filete

`1px solid #42433d`, ancho completo de la sección, sin padding alrededor. Es el
único separador. No hay sombras en ningún lado del sistema: la profundidad la dan
el salto de superficie (`#0e100f` → `#191919`) y el gradiente interno.

### Tarjeta de tema

Superficie `#191919`, radio 8px, padding 24px, sin borde visible en reposo. El
número de tema en `--s50`, el título en crema 600. En hover sube 2px y aparece un
borde de 1px del color de la fase. Completo: el borde queda fijo y el fondo pasa
a `--fase-tint`.

Grilla `repeat(auto-fit, minmax(280px, 1fr))`, gap 24px.

### Diagrama

`<figure>` sobre `#191919`, radio 8px, padding 32px. El SVG hereda el vocabulario
de formas de GSAP: domos, píldoras, blobs con gradiente lineal interno de dos
paradas (color de fase → variante clara), **sin `drop-shadow`**, con desborde
suelto respecto del marco.

Ningún color literal dentro del `<svg>`: todo por variable. `scripts/verificar.js` lo
exige y falla el build si aparece un hex.

### Bloque de ejercicio

Superficie `#191919`, radio 8px. Opciones como pills ghost apiladas. El feedback
va en un bloque con **borde completo** de 1px del color de estado y fondo
`--fase-tint` del mismo. Nunca `border-left`: el side-stripe está prohibido por
el doc de GSAP y por `impeccable`.

### Terminal de Python

Editor y terminal **lado a lado**, del mismo alto, cada uno en su panel con
barra de título (`ejercicio.py` / `terminal`). La salida se escribe **en vivo**,
línea por línea, mientras el código corre: `py.setStdout({ batched })`, no un
buffer que se vuelca al final.

Tres colores en la salida, y cada uno significa una cosa distinta:
`--s50` para lo que dice el runtime (el prompt, "Descargando Python"), `--ink`
para el stdout del programa, `--err` para stderr y para el traceback. Un cursor
de bloque parpadeante mientras corre es la única señal de que el proceso sigue
vivo durante los 20s que tarda Pyodide la primera vez.

stdout y stderr se capturan **por separado**: la corrección compara solo stdout.
Juntos, un warning de scikit-learn —que no es culpa de quien resuelve— daba el
ejercicio por incorrecto aunque el `print` fuera exacto.

Bajo 900px se apilan: dos consolas de 300px no son dos consolas.

### Flujo de ejecución del Parsons

Al lado de los bloques arrastrables, un diagrama que **espeja su orden en vivo**:
un nodo por bloque, encadenados por un conector acodado. La sangría de la línea
se traduce en desplazamiento lateral del nodo, así que el acodado dibuja el
entrar y salir de un bloque: la indentación deja de ser un detalle tipográfico y
pasa a ser una forma.

Al comprobar, un token recorre el camino y se frena en el primer bloque
equivocado, que pasa a `--err` y tiembla una sola vez. Los bloques descartados se
saltean sin correr la numeración. El hover sobre un bloque resalta su nodo y al
revés: es lo que enseña que las dos columnas son la misma cosa.

El SVG va `aria-hidden`: es un espejo de la lista, que ya es navegable y
anunciable. Que un lector de pantalla lo lea de nuevo sería repetir el ejercicio
entero.

### Diagrama paso a paso

`js/nucleo/diagramas.js`. Para procesos con etapas —una pasada hacia adelante,
un reparto de error, una partición de árbol—, un diagrama que se dibuja solo al
entrar en viewport cuenta su historia una vez y a la velocidad del scroll. Este
agrega una barra: `◀ ▶`, reproducir/pausar, reiniciar, y una regleta de marcas
que es a la vez indicador y navegación.

El contrato es chico a propósito: el diagrama entrega una lista de pasos y una
función `pintar(i)` que deja el SVG en el estado del paso `i` **entero y sin
depender del paso anterior**. Eso es lo que hace que ir para atrás, saltar y
arrancar en el último con movimiento reducido sean el mismo código.

Con `prefers-reduced-motion` arranca en el **último** paso, no en el primero: el
estado final es el que contiene toda la información, y quien no quiere
movimiento igual quiere el contenido.

### Nav

Barra superior única, pegajosa, fondo canvas al 88% con blur de 12px, filete
inferior. Wordmark a la izquierda en 600; links crema 400 a 16px con gap
apretado. El link activo va en el color de la fase de esa página, no subrayado.

### Pie

`#191919`, filete superior de 1px, padding vertical de 76px. Un paso de
superficie más claro que el canvas: eso es el terminador.

## Motion

El sitio es sobre GSAP y usa GSAP. La animación es la prueba, no el adorno.

- **Scroll:** Lenis (`lerp 0.08`) conducido por `gsap.ticker`, nunca por su propio
  `requestAnimationFrame`. `ScrollTrigger.update` colgado de `lenis.on("scroll")`.
  Sin esto los diagramas disparan en el punto equivocado.
- **Easing:** `expo.out` para entradas, `power2.out` para trazos, `power2.inOut`
  para lo reversible. **Sin `back`, sin `elastic`, sin `bounce`.** Prohibido por
  `impeccable` y ajeno al tono.
- **Duración:** 0.4–0.6s en microtransiciones, 1.0–1.4s en trazos de diagrama.
- **Escalonado:** 0.06–0.12s. Un stagger legible es la microtransición firma.
- **Hover:** solo `opacity`, `transform` y `border-color`. Nunca propiedades de
  layout.
- **Reducido:** con `prefers-reduced-motion`, Lenis no se instancia, no hay
  `scrub` ni `pin`, y todo diagrama arranca en su estado final. Es un camino de
  primera clase, no un apagado.

## Do's and Don'ts

### Do

- Abrir cada sección con `{ llaves }`.
- Dejar que el display sangre hasta el borde del viewport, sin contenedor.
- Un color por fase, siempre el mismo, número y nombre siempre presentes al lado.
- Separar con filetes de 1px `#42433d` a ancho completo.
- Profundidad por salto de superficie y gradiente interno.

### Don't

- Botones rellenos. El sistema es outlined-only.
- `#ffffff` o `#000000` en ningún lado.
- `box-shadow` ni `drop-shadow`.
- Cuerpo por debajo de 14px o por encima de 23px.
- Un séptimo color.
- `border-left` de acento en cualquier cosa.
- `background-clip: text` con gradiente.
- Mono donde el contenido no sea código. Para cifras, `tabular-nums`.
- Notación matemática sin su respaldo en Unicode dentro del elemento.
- `1fr` en una pista de grilla que pueda contener código, tablas o fórmulas:
  arranca en `min-width: auto` y se estira hasta el contenido más ancho que no
  puede partirse. Siempre `minmax(0, 1fr)`.
- Justificar sin `hyphens: auto`.
- Controles nativos sin estilar: barras de scroll, flechas de `input[number]` y
  sliders traen el diseño del sistema operativo y sobre este canvas se ven
  prestados.
