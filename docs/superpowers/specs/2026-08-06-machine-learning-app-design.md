# Spec de diseño — App de estudio de Machine Learning

**Fecha:** 2026-08-06
**Estado:** aprobado para planificación
**Backbone:** skill `materia-study-site` · **UI:** skill `impeccable` · **Referencia estética:** gsap.com

---

## 1. Propósito

Sitio de estudio de machine learning, end-to-end e interactivo, que lleva a un principiante
absoluto desde "no sé programar" hasta entender y entrenar una red neuronal simple.

Cada tema combina teoría escrita, un diagrama SVG animado que muestra el mecanismo en
movimiento, y ejercicios auto-corregidos de dificultad creciente. El progreso se guarda por
usuario y sobrevive el cambio de dispositivo.

### Usuarios

David y Abel, dos amigos del autor. Punto de partida: **cero total** — no programan y no
tienen álgebra lineal ni probabilidad. Simon (el autor) es el tercer usuario y el que
construye el sitio.

Tres usuarios conocidos. Esto define casi todas las decisiones de escala: no hay
multi-tenancy, ni roles, ni panel de administración, ni analítica.

### Objetivos

1. Que un principiante absoluto pueda avanzar solo, sin instructor.
2. Que cada concepto se pueda *ver* moverse, no solo leer.
3. Que cada concepto se aplique en un ejercicio concreto antes de pasar al siguiente.
4. Que el progreso sea visible y persistente, para sostener la motivación.

### No-objetivos (YAGNI explícito)

- Cuentas para público general, registro abierto, recuperación de contraseña.
- Roles, permisos, panel de administración.
- Contenido generado por el usuario, foros, comentarios.
- Analítica, telemetría, A/B testing.
- App móvil nativa (el sitio es responsive y con eso alcanza).
- CMS o edición de contenido desde el navegador. El contenido son archivos HTML.
- Certificados, gamificación con puntos/insignias, rankings.

---

## 2. Arquitectura

### Stack

HTML, CSS y JavaScript estáticos. **Sin build step, sin framework, sin `node_modules`.**
Vercel sirve la carpeta tal cual y una única serverless function corre en `/api`.

Dependencias externas, todas por CDN, todas justificadas:

| Dependencia | Para qué | Por qué no se evita |
|---|---|---|
| GSAP + ScrollTrigger, DrawSVG, MorphSVG | Animación de diagramas y scroll | Es la referencia estética pedida. 100% gratis desde la adopción por Webflow. CSS scroll-driven animations no cubren pinning ni scrub de timelines y el soporte entre navegadores es desparejo. |
| Pyodide | Ejecutar Python real en el navegador | La alternativa es un backend con sandbox: mucho más código, más superficie de ataque y más costo. Se carga en demanda. |
| Google Identity Services | Login | Script oficial de Google, ~20 líneas. Evita Auth.js y con él Next.js. |
| Fuentes (Fontshare / Google Fonts) | Tipografía | — |

Todo lo demás se escribe a mano.

### Layout de archivos

```
machine-learning-app/
├── index.html                  Hero + roadmap de 6 fases + "cómo estudiar"
├── temas.html                  Índice completo, timeline, distinciones, aplicaciones
├── estudio.html                Flashcards + síntesis + MCQ transversal
├── practica.html               Laboratorio: ejercicios sueltos filtrables por tema y dificultad
├── concept-01-python.html      Una página por tema (24 en total)
├── concept-02-numpy.html
│   …
├── concept-24-cnn.html
├── shared.css                  Design system. Base del skill, re-tematizada a la paleta GSAP
├── shared.js                   Tema claro/oscuro, barra de progreso, reveal, sesión
├── anim.js                     Helpers de animación GSAP para diagramas
├── ejercicios.js               Motor de ejercicios (5 tipos)
├── progreso.js                 Cliente de progreso: localStorage + sync
├── verificar.js                Chequeos de integridad, se corre con node (ver §9)
├── progreso.test.js            Pruebas de la lógica de fusión (ver §9)
├── api/
│   └── progress.js             Serverless function: verifica JWT, lee/escribe Redis
├── data/
│   └── temario.json            Fuente de verdad del roadmap: fases, temas, slugs, colores
├── assets/                     Los 5 PDFs de referencia (no se despliegan)
└── docs/superpowers/specs/     Este documento
```

`parciales.html` del skill no aplica: no hay exámenes previos de esta materia. Su lugar lo
toma `practica.html`, que reutiliza el mismo patrón de revelar-respuesta.

### Flujo de datos

```
data/temario.json  ──▶  index.html  (roadmap se renderiza desde acá)
                   └─▶  temas.html
                   └─▶  practica.html  (filtros)

usuario resuelve ejercicio
   └─▶ ejercicios.js corrige localmente
        └─▶ progreso.js escribe en localStorage  (siempre, instantáneo)
             └─▶ si hay sesión: POST /api/progress  (debounce 2 s)
                  └─▶ api/progress.js verifica JWT de Google
                       └─▶ Redis: SET ml:progress:<sub>  <json>
```

El sitio **funciona completo sin login**. La sesión solo agrega persistencia entre
dispositivos. Esto mantiene el camino crítico libre de red: ningún ejercicio espera al
servidor para corregirse.

`data/temario.json` es la única fuente de verdad de la estructura. El roadmap, los filtros de
práctica y la navegación prev/next entre conceptos salen todos de ahí. Agregar un tema es
editar ese archivo y escribir una página.

---

## 3. Temario — 24 temas en 6 fases

Cada fase tiene un color asignado (ver §4). La progresión es estricta: ningún tema usa
maquinaria que no se haya presentado antes.

### Fase 0 · Piso — *azul*

Nadie toca un modelo antes de saber qué es un vector.

| # | Tema | Slug | Fuente |
|---|---|---|---|
| 01 | Python esencial: variables, listas, bucles, funciones | `python` | Géron, ap. A |
| 02 | NumPy y pensar en vectores | `numpy` | Géron, ap. A |
| 03 | Álgebra lineal mínima: vectores, matrices, producto punto | `algebra` | Goodfellow cap. 2 |
| 04 | Probabilidad y estadística mínima: media, varianza, Bayes | `probabilidad` | Goodfellow cap. 3, Bishop cap. 1.2 |

### Fase 1 · Aprender de los datos — *lila*

| # | Tema | Slug | Fuente |
|---|---|---|---|
| 05 | Qué es machine learning: supervisado, no supervisado, tipos de problema | `que-es-ml` | ISLR cap. 1–2, Géron cap. 1 |
| 06 | El flujo de trabajo: datos → modelo → evaluación | `flujo` | Géron cap. 2 |
| 07 | Train/test y validación cruzada | `validacion` | ISLR cap. 5 |
| 08 | Sesgo, varianza, overfitting y underfitting | `sesgo-varianza` | ISLR cap. 2.2, ESL cap. 7 |

### Fase 2 · Regresión — *verde*

| # | Tema | Slug | Fuente |
|---|---|---|---|
| 09 | **Regresión lineal simple** ← slice vertical | `regresion-lineal` | ISLR cap. 3.1, ESL cap. 3.2 |
| 10 | Regresión múltiple y descenso de gradiente | `gradiente` | ISLR cap. 3.2, Géron cap. 4 |
| 11 | Regularización: Ridge y Lasso | `regularizacion` | ISLR cap. 6.2, ESL cap. 3.4 |

### Fase 3 · Clasificación — *tangerina*

| # | Tema | Slug | Fuente |
|---|---|---|---|
| 12 | Clasificación y regresión logística | `logistica` | ISLR cap. 4, Bishop cap. 4.3 |
| 13 | Métricas: matriz de confusión, precisión, recall, ROC-AUC | `metricas` | Géron cap. 3 |
| 14 | K vecinos más cercanos | `knn` | ISLR cap. 2.2.3, ESL cap. 13.3 |
| 15 | Naïve Bayes | `naive-bayes` | Bishop cap. 4.2 |
| 16 | SVM y el truco del kernel | `svm` | ISLR cap. 9, Bishop cap. 7 |

### Fase 4 · Árboles y no supervisado — *rosa*

| # | Tema | Slug | Fuente |
|---|---|---|---|
| 17 | Árboles de decisión | `arboles` | ISLR cap. 8.1 |
| 18 | Random Forest y bagging | `random-forest` | ISLR cap. 8.2, ESL cap. 15 |
| 19 | Boosting y gradient boosting | `boosting` | ESL cap. 10, Géron cap. 7 |
| 20 | Clustering: K-means y jerárquico | `clustering` | ISLR cap. 12.4, Bishop cap. 9.1 |
| 21 | Reducción de dimensionalidad: PCA | `pca` | ISLR cap. 12.2, Bishop cap. 12.1 |

### Fase 5 · Redes neuronales — *magenta*

| # | Tema | Slug | Fuente |
|---|---|---|---|
| 22 | Del perceptrón a la red multicapa | `perceptron` | Géron cap. 10, Goodfellow cap. 6.1 |
| 23 | Backpropagation y entrenamiento | `backprop` | Goodfellow cap. 6.5, Bishop cap. 5.3 |
| 24 | CNNs conceptualmente y qué sigue | `cnn` | Géron cap. 14, Goodfellow cap. 9 |

El mapa se valida contra los índices reales de los 5 libros antes de escribir (§7). Puede
ajustarse, pero la cantidad de temas y las 6 fases se mantienen.

### Anatomía de una página de tema

Cada `concept-NN-*.html` sigue la misma estructura:

1. `<header class="hero-c">` — breadcrumb, número de fase, título, lede, regla.
2. **Intuición** — la idea en lenguaje llano, sin una sola fórmula, con un diagrama animado.
3. **Mecanismo** — 3 a 5 secciones numeradas con la teoría y la matemática, cada fórmula en
   un `.callout.formula` y explicada término por término.
4. **Diagrama principal** — SVG animado por scroll que muestra el algoritmo funcionando.
5. **Ejercicios** — progresión conceptual → numérico → Parsons → Python libre.
6. **Errores frecuentes** — `.callout.warn` por cada trampa conocida del tema.
7. **Síntesis** — 80 a 120 palabras, reutilizadas en `estudio.html`.
8. `.concept-nav` — anterior / siguiente.

---

## 4. Design system

Base conceptual del skill `materia-study-site` (jerarquía editorial, secciones numeradas,
mucho blanco, SVG a mano). Estética tomada de gsap.com. La invocación de `impeccable` durante
la implementación define el detalle fino; esto fija las restricciones.

### Paleta

Tomada literalmente de las custom properties de gsap.com, reexpresada en oklch para tener
paridad claro/oscuro como pide el skill.

```
Base
  --just-black      #0e100f    fondo oscuro
  --off-black       #191919    superficie elevada en oscuro
  --surface-white   #fffce1    fondo claro (crema cálido, no blanco puro)
  --surface-75/50/25  #bbbaa6 / #7c7c6f / #42433d    escala de grises cálidos

Hue por fase — el único número que cambia entre fases
  Fase 0  azul       H ≈ 220    referencia #00bae2
  Fase 1  lila       H ≈ 285    referencia #9d95ff
  Fase 2  verde      H ≈ 145    referencia #0ae448   (el verde firma de GSAP)
  Fase 3  tangerina  H ≈  55    referencia #ff8709
  Fase 4  rosa       H ≈ 350    referencia #fec5fb
  Fase 5  magenta    H ≈ 330    referencia #f100cb
```

**Cómo se derivan los acentos.** Los hex de gsap.com están calibrados para fondo casi negro:
son neones. Puestos como texto sobre la crema `#fffce1`, varios no llegan ni a 2:1 de
contraste. Así que el hex no se usa literal — se usa su **hue**, y cada tema deriva su propia
luminosidad en oklch:

```css
--accent:      oklch(72% 0.19 var(--fase-h));   /* tema oscuro: brillante  */
--accent:      oklch(48% 0.16 var(--fase-h));   /* tema claro:  oscurecido */
--accent-tint: oklch(94% 0.05 var(--fase-h));   /* relleno de diagramas    */
```

Un solo knob por fase (`--fase-h`), exactamente como pide el skill. Los tintes de superficie
de gsap.com (`#dfffd1`, `#d2ceff`, `#ffe3c7`, `#bef3fe`, `#ffd7fd`) son el objetivo visual de
`--accent-tint`.

**Regla dura de contraste:** el acento de fase se usa para trazos, rellenos, y títulos
grandes. **Nunca para texto de lectura.** El cuerpo es siempre `--just-black` sobre crema o
`--surface-white` sobre negro — 15:1 largos. Cualquier texto sobre `--accent-tint` va en
`--just-black`. Los pares que se verifican con una herramienta de contraste antes de cerrar
la etapa 2 son: acento sobre ambos fondos, y tinte con texto negro encima.

**Desvío deliberado del skill:** la regla del skill es un solo acento por proyecto. Acá hay
seis hues. La razón es que el color **codifica la fase**, no decora: una tarjeta verde en el
roadmap, en el filtro de práctica y en el breadcrumb de un tema significan siempre "Fase 2 ·
Regresión". Es el mismo patrón que usa gsap.com, donde cada familia de producto tiene su hue.
Dentro de una página de tema hay un solo acento activo — el de su fase. El color nunca es el
único portador de información: la fase siempre lleva además su número y su nombre.

### Tipografía

gsap.com usa **PP Mori** (Pangram Pangram, licencia comercial). No se puede usar. Sustituto:
**Satoshi** (Fontshare, gratis, CDN) — grotesca geométrica de proporciones y detalle muy
cercanos. Si el CDN de Fontshare resulta poco fiable, el reemplazo es Space Grotesk desde
Google Fonts.

| Rol | Fuente | Pesos |
|---|---|---|
| Display y títulos | Satoshi | 700, 900 |
| Cuerpo | Satoshi | 400, 500 |
| Código y fórmulas | JetBrains Mono | 400, 700 |

Escala fluida con `clamp()`. Títulos grandes y pesados, muy apretados (`letter-spacing`
negativo, `line-height` cerca de 0.95) — es la firma tipográfica de gsap.com. Cuerpo a 1.65
de interlineado y medida máxima de 68 caracteres, porque acá sí se lee texto largo.

### Movimiento

Cuatro usos, en orden de importancia:

1. **Diagramas didácticos** — el uso central. Un diagrama no es una imagen: se dibuja solo
   (DrawSVG), sus piezas se transforman (MorphSVG) y el usuario puede rebobinarlo. Muestran
   *flujo*: por dónde entran los datos, qué se calcula, hacia dónde sale el resultado.
2. **Scrollytelling en secciones clave** — sección fijada mientras el diagrama avanza paso a
   paso con el scroll (`ScrollTrigger` con `pin` y `scrub`). Se reserva para los momentos
   donde el proceso *es* el concepto: descenso de gradiente, backpropagation, construcción de
   un árbol, iteraciones de K-means.
3. **Reveal al entrar en viewport** — se queda con el `IntersectionObserver` que ya trae el
   `shared.js` del skill. No se rutea por GSAP: ya funciona y es más liviano.
4. **Microinteracciones** — hover en tarjetas de roadmap, flip de flashcards, feedback de
   ejercicio correcto/incorrecto. CSS puro.

**Regla dura:** toda animación respeta `prefers-reduced-motion`. Con la preferencia activada,
los diagramas muestran su estado final completo y legible, no una pantalla en blanco. Un
diagrama cuya única forma de entenderse es viéndolo animar está mal diseñado — la animación
aclara, no carga el significado.

### Lenguaje de diagramas

Minimalista, geométrico, de color plano. Círculos, rectángulos de esquinas redondeadas,
líneas rectas y arcos simples. Sin gradientes, sin sombras, sin skeumorfismo. Relleno plano
del tinte de la fase, trazo del acento, texto en JetBrains Mono. Todo SVG escrito a mano,
posicionado a mano, con clases del `shared.css` — sin mermaid, sin d3, sin ninguna librería
de generación de diagramas.

Todo color en el SVG referencia una custom property. Nunca un hex literal. Así el tema
claro/oscuro funciona sin tocar el markup.

---

## 5. Motor de ejercicios

Un archivo, `ejercicios.js`, ~250 líneas. Cinco tipos, todos auto-corregidos en el cliente,
todos declarados como datos en la página que los usa.

### 5.1 Conceptual (opción múltiple)

Patrón `.q` / `.q-opt.ok` / `.q-opt.no` que ya define el skill. Cuatro opciones, botón de
revelar, y explicación obligatoria de **por qué** las incorrectas son incorrectas — no solo
cuál era la correcta.

```js
{ tipo:"mcq", id:"rl-c1", q:"…", opts:["…","…","…","…"], c:2, expl:"…" }
```

### 5.2 Numérico

Input de número, comparación con tolerancia relativa. El feedback diagnostica: si el
resultado del usuario coincide con un error típico conocido (confundir pendiente con
intercepto, olvidar dividir por n), lo dice explícitamente.

```js
{ tipo:"num", id:"rl-n1", q:"…", resp:2.35, tol:0.01, unidad:"",
  trampas:[{val:3.35, msg:"Sumaste el intercepto de más…"}], expl:"…" }
```

### 5.3 Parsons (bloques de código)

Líneas de código desordenadas que se arrastran hasta formar el algoritmo. HTML5 drag & drop
nativo, más un modo de subir/bajar por botones para que funcione con teclado y en táctil.
Cero dependencias. Es la herramienta principal de programación en las fases 0 y 1: enseña a
leer y estructurar código sin castigar al principiante con errores de tipeo.

```js
{ tipo:"parsons", id:"rl-p1", q:"Armá el bucle de descenso de gradiente",
  lineas:["for i in range(n_iter):","    grad = …","    w -= lr * grad"],
  distractores:["    w += lr * grad"] }
```

La corrección compara el orden y la indentación.

### 5.4 Python vivo (Pyodide)

`<textarea>` con el código inicial, botón Ejecutar, panel de salida. Pyodide se carga en
demanda: la primera vez que la página necesita ejecutar, con indicador de progreso honesto
("descargando Python, ~10 MB, solo la primera vez"), y queda cacheado por el navegador.
NumPy y scikit-learn se cargan solo en las páginas de fase 2 en adelante.

Se activa a partir de la fase 2. Las fases 0 y 1 usan Parsons.

La validación compara la salida del usuario contra la esperada, no el código: hay muchas
formas correctas de escribir lo mismo.

### 5.5 Simulador SVG

Un slider o un conjunto de puntos arrastrables conectados a un diagrama que responde en
tiempo real. No se corrige — se explora. Ejemplos: mover el learning rate y ver la
convergencia oscilar o divergir; mover k y ver la frontera de decisión deformarse; arrastrar
un punto y ver la recta de regresión reajustarse.

Es el tipo más caro de construir y el que más enseña. Se hace uno por tema, solo donde el
concepto tiene un parámetro que valga la pena manipular.

### Progresión de dificultad

Dentro de cada tema: conceptual → numérico → Parsons/Python → simulador libre. La página no
bloquea el avance; la progresión es una sugerencia visual, no una reja. Trabar contenido
frustra más de lo que motiva cuando el usuario es un adulto estudiando por gusto.

---

## 6. Progreso, sesión y persistencia

### Modelo de datos

Un JSON por usuario. Plano, sin normalizar, sin migraciones.

```json
{
  "v": 1,
  "actualizado": "2026-08-06T14:22:00Z",
  "temas": {
    "regresion-lineal": {
      "leido": true,
      "ejercicios": { "rl-c1": 100, "rl-n1": 100, "rl-p1": 60 },
      "quiz": true
    }
  }
}
```

Un tema cuenta como **completado** cuando se cumplen las tres: `leido` es verdadero, `quiz` es
verdadero, y todos los ejercicios corregibles del tema tienen puntaje mayor a cero. Los
simuladores SVG (§5.5) **no** entran en el conteo: no se corrigen, así que no llevan id de
progreso ni aparecen en `ejercicios`. El roadmap del home pinta cada tarjeta en tres estados:
sin empezar, en progreso, completada. La barra global del `shared.js` muestra el porcentaje
sobre los 24.

El campo `v` existe para poder cambiar el formato más adelante sin romper los datos guardados.

### Autenticación

Botón oficial de Google Identity Services. Devuelve un ID token (JWT) en el cliente. No hay
cookies de sesión propias, ni refresh tokens, ni base de usuarios: el `sub` del token *es* el
identificador.

### Contrato de la API

Una sola función. `Authorization: Bearer <id_token>` en ambos verbos.

```
GET  /api/progress   →  200 {…json…}  |  204 (sin datos aún)  |  401
POST /api/progress   →  200 {ok:true} |  401  |  413 (cuerpo > 64 KB)
```

`api/progress.js` debe, en este orden:

1. Verificar la firma del JWT contra las claves públicas de Google (`https://www.googleapis.com/oauth2/v3/certs`, cacheadas según su `max-age`).
2. Verificar `aud` contra el client ID propio, `iss` contra `accounts.google.com`, y `exp`.
3. Verificar que el `email` esté en la allowlist de tres direcciones (variable de entorno).
4. Leer o escribir la clave `ml:progress:<sub>` en Redis.

Los pasos 1 a 3 no son opcionales. Un endpoint que acepte un JWT sin verificar la firma deja
que cualquiera escriba en el almacenamiento con un token fabricado. La allowlist evita que un
tercero con una cuenta de Google cualquiera consuma la cuota.

### Estrategia de sincronización

`localStorage` es la fuente primaria: toda escritura va ahí primero, sincrónica y sin red. El
POST al servidor se hace con debounce de 2 segundos.

Al iniciar sesión se **fusiona** el estado local con el remoto en vez de elegir uno: por cada
tema, gana el que tenga más ejercicios resueltos; por cada ejercicio, gana el puntaje más
alto. Con tres usuarios que no comparten cuenta, el conflicto real es "estudié sin loguearme
y no quiero perderlo", y la fusión monótona lo resuelve sin preguntar nada.

Si la red falla, la escritura local ya ocurrió y el sitio no muestra error: reintenta en la
próxima escritura. El progreso de estudio no justifica una cola de reintentos.

---

## 7. Pipeline de investigación

No se convierten 3500 páginas a markdown. El material se extrae en dos momentos:

**Antes de escribir nada** — extraer los índices de los 5 PDFs con
`convert-documents-to-markdown` y contrastarlos con el temario de §3. Salida: `docs/temario-validado.md`, con el mapa de capítulos confirmado, corregido donde el canon
lo indique.

**Al escribir cada tema** — extracción dirigida de los capítulos que le corresponden a ese
tema, más búsqueda web para ejemplos, datasets y notación actual. El material extraído vive
en `docs/fuentes/<slug>.md` y no se despliega.

Así el contenido de cada página sale del libro adecuado sin gastar contexto en material que
no se usa.

**Jerarquía de fuentes:** ISLR para la explicación accesible, Géron para la práctica y el
código, ESL y Bishop para el rigor matemático, Goodfellow para redes. Cuando dos libros
difieren en notación, gana ISLR — es el más cercano al nivel de los usuarios.

---

## 8. Orden de construcción

Slice vertical primero. **El plan de implementación que sigue a este spec cubre las etapas 1
a 4** — hasta tener el sitio desplegado y usable con un tema. La etapa 5 (producción de los
23 temas restantes) es repetición de una plantilla ya validada y recibe su propio plan, más
corto, una vez que el checkpoint de la etapa 3 haya corregido lo que haya que corregir.

### Etapa 1 — Validación del temario
Extraer índices, contrastar, escribir `docs/temario-validado.md` y `data/temario.json`.

### Etapa 2 — Design system
`shared.css` re-tematizado con la paleta y tipografía de §4. `anim.js` con los helpers GSAP.
Una página de muestra que ejercite cada token y componente. Acá se invoca `impeccable`.

### Etapa 3 — Slice vertical: `concept-09-regresion-lineal.html`
El tema completo, con las 8 secciones de §3, un diagrama animado por scroll, y los cinco
tipos de ejercicio. Es el único tema que valida *toda* la maquinaria de una vez: tiene
matemática que se calcula a mano, un algoritmo iterativo que se arma por bloques, y un
equivalente en tres líneas de scikit-learn para comparar.

**Checkpoint:** David y Abel usan esta página antes de que se escriba ninguna otra. Lo que
salga de ahí corrige el patrón mientras corregirlo todavía es barato.

### Etapa 4 — Cáscara y persistencia
`index.html` con el roadmap, `temas.html`, login, `api/progress.js`, deploy a Vercel.
Al terminar esta etapa el sitio ya es usable con un solo tema.

### Etapa 5 — Producción de contenido
Los 23 temas restantes, en orden de fase. Fase 0 primero: es lo que David y Abel necesitan
para empezar.

### Etapa 6 — Páginas transversales
`estudio.html` y `practica.html`, que agregan contenido ya escrito en las páginas de tema.
Van al final por eso mismo: agregan, no crean.

---

## 9. Verificación

Sin framework de tests. El sitio es estático y el criterio es que funcione en el navegador.

**Comprobación automatizada** — un `verificar.js` que se corre con `node verificar.js` y falla
si encuentra:

- un slug en `data/temario.json` sin su archivo HTML, o al revés;
- un `href` interno roto;
- una página sin el bloque de navegación o con la marca `on` en el link equivocado;
- un color hexadecimal literal dentro de un `<svg>` (rompe el tema claro/oscuro);
- un id de ejercicio duplicado dentro de una misma página (pisa el progreso guardado).

**Comprobación de la lógica de progreso** — la función de fusión es la única lógica con
suficientes casos borde como para justificar una prueba. Un `progreso.test.js` con
`assert`, corrido con `node --test`, cubre: local vacío, remoto vacío, ambos con datos, y
conflicto de puntajes en el mismo ejercicio.

**Comprobación manual, por página** — tema claro y oscuro; con y sin `prefers-reduced-motion`;
en un ancho de teléfono; y los ejercicios respondidos mal a propósito para verificar que el
feedback diagnostica en lugar de solo negar.

---

## 10. Riesgos y decisiones abiertas

| Riesgo | Mitigación |
|---|---|
| Pyodide con NumPy y scikit-learn pesa ~30 MB | Carga en demanda, solo en páginas que lo usan, cacheado por el navegador. Si en la etapa 3 resulta intolerable, el plan B es reducir a NumPy y escribir los modelos a mano — pedagógicamente incluso mejor. |
| 24 temas es mucho contenido y el cansancio hace bajar la calidad | El slice vertical fija la plantilla. Producción por fases, con las fases 0 y 1 primero porque son las que se usan primero. |
| El scrollytelling con `pin` es frágil en móvil | Se usa solo en 4 o 5 momentos elegidos. En anchos de teléfono degrada a un diagrama con controles de reproducción. |
| Satoshi desde Fontshare podría no ser fiable | Fallback declarado a Space Grotesk en Google Fonts. La pila de `font-family` lo cubre sin cambiar nada más. |
| El temario de §3 no sobrevive el contraste con los libros | Por eso la etapa 1 va antes que todo lo demás. |

**Abierto:** el nombre y la marca del sitio (va en la navegación y el pie). Se decide antes de
la etapa 2.

---

## 11. Resumen de simplificaciones deliberadas

- Sin framework ni build step — el sitio es 30 archivos estáticos.
- Sin base de datos de usuarios — el `sub` del JWT de Google es el identificador.
- Sin sesiones propias, cookies ni refresh tokens.
- Sin backend para Python — corre en el navegador con WASM.
- Sin librería de diagramas — SVG escrito a mano.
- Sin Blockly para los bloques de código — arrastre nativo de HTML5.
- Sin resolución de conflictos de sincronización — fusión monótona, siempre gana el mayor.
- Una sola serverless function en todo el proyecto.

Cada una se revisa si el uso real demuestra que hace falta más.
