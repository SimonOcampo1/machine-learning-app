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

Sin monoespaciada decorativa. Se usa `--font-mono` solo donde el contenido *es*
código o una cifra que tiene que alinearse en columna (tablas de cálculo,
editor de Python, salida). Mono como disfraz de "técnico" está prohibido.

### Escala

Fluida. El extremo superior de cada `clamp()` es el valor exacto de GSAP.

| Rol | Token | Mín | Máx GSAP | lh | tracking |
|---|---|---|---|---|---|
| caption | `--t-caption` | 14px | 14px | 1.4 | -0.01em |
| body-sm | `--t-body-sm` | 15px | 16px | 1.35 | -0.01em |
| body | `--t-body` | 17px | 19px | 1.55 | -0.01em |
| body-lg | `--t-body-lg` | 19px | 23px | 1.45 | -0.01em |
| subheading | `--t-sub` | 24px | 34px | 1.2 | -0.011em |
| heading-sm | `--t-h3` | 26px | 44px | 1.2 | -0.011em |
| heading | `--t-h2` | 34px | 66px | 1.1 | -0.011em |
| heading-lg | `--t-h1` | 44px | 101px | 1.0 | -0.011em |
| display | `--t-display` | 60px | 224px | 0.9 | -0.02em |

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
- Medida de lectura: **68ch**

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
- Mono donde el contenido no sea código o cifra tabulada.
