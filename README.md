# Machine Learning · Estudio

Sitio de estudio de machine learning para dos amigos que arrancan de cero: David y Abel. Veinticuatro temas, seis fases, desde "qué es una variable" hasta redes neuronales. Cada tema combina teoría, diagramas animados y ejercicios interactivos corregidos en el momento.

No es un producto para terceros ni un proyecto open source con audiencia externa: es material de estudio hecho a medida, con el nombre de los dos destinatarios en el pie de página.

## Estructura

En la raíz vive solo lo que **es una ruta del sitio** y la configuración del
proyecto. Los 27 HTML se quedan arriba a propósito: sin build step, la ruta del
archivo es la URL, y bajarlos a una carpeta cambiaría las 27 direcciones sin
ganar nada.

```
.
├── index.html  temas.html  muestra.html      páginas sueltas
├── concept-01…24-<slug>.html                 un archivo por tema
├── css/
│   └── shared.css                            el sistema visual entero
├── js/
│   ├── nucleo/                               compartido por todas las páginas
│   │   ├── shared.js      reveal, barra de progreso, nav entre temas, KaTeX
│   │   ├── anim.js        GSAP + Lenis: scroll, trazado de diagramas
│   │   ├── ejercicios.js  los cinco tipos de ejercicio y su corrección
│   │   ├── progreso.js    estado por tema, fusión local ↔ servidor
│   │   └── diagramas.js   mecanismo de diagramas paso a paso
│   ├── paginas/           index.js, temas.js
│   └── temas/             los 24 pegamentos, uno por tema
├── api/progress.js                           única serverless function
├── data/temario.json                         fuente de verdad del temario
├── scripts/               verificar.js, contraste.js
├── tests/                 *.test.js (node:test, sin dependencias)
└── docs/                  notas de trabajo, tabla de contraste
```

Agregar un tema toca cuatro lugares: el HTML en la raíz, su pegamento en
`js/temas/`, la entrada en `data/temario.json` y nada más. `npm run verificar`
falla si alguno de los cuatro quedó a medias.

## Cómo correrlo local

El sitio es estático — HTML, CSS y JS planos, sin build step — pero **no se puede abrir con doble clic** (`file://`). El home hace `fetch("data/temario.json")`, y `fetch` sobre `file://` falla por CORS. Hace falta un servidor HTTP mínimo:

```bash
npx serve
```

Y abrir la URL que imprime (por defecto `http://localhost:3000`).

## Tests

```bash
npm test
```

Corre todos los archivos `*.test.js` del repo (usa el test runner nativo de Node, sin dependencias). Cubre la lógica pura de:
- `js/nucleo/progreso.js` — fusión de progreso, cálculo de estado por tema, porcentaje global.
- `js/nucleo/ejercicios.js` — corrección de los distintos tipos de ejercicio.
- `api/progress.js` — verificación del JWT de Google, validación del cuerpo del request.
- `scripts/verificar.js` — cada uno de los chequeos del verificador (ver abajo), probado sobre datos rotos a propósito.

## Verificador

```bash
npm run verificar
```

Barre todo el repo y chequea invariantes que ningún test unitario cubre porque dependen de que los 24 archivos de tema sean consistentes entre sí:
- Slugs y números de tema únicos en `data/temario.json`, y que el nombre de archivo (`concept-NN-slug.html`) tenga el `NN` que corresponde.
- Ningún color hexadecimal literal dentro de un `<svg>` (tiene que ser `var(--fase)` u otra variable del design system).
- Ningún archivo `concept-*.html` huérfano: si existe en disco, tiene que estar declarado en el temario.
- Cada página tiene su bloque de navegación, y el link marcado `on` es el que corresponde a esa página (a lo sumo uno).
- Ningún enlace roto: un `href` a un `.html` que no existe en disco ni está declarado como tema pendiente en el temario.
- Ningún id de ejercicio duplicado dentro de un mismo archivo JS.
- Todo tema con `escrito: true` declara su `ejercicios: <entero>`. Sin el campo, el tema nunca llega a "completo" aunque se resuelvan todos, y no avisa.
- Toda anotación `.eyebrow` lleva las llaves `{ }` de la firma tipográfica.

Correrlo antes de cada commit que toque un tema. Sale con código 1 y lista los problemas si encuentra alguno.

## Contraste

```bash
npm run contraste            # tabla en consola, sale 1 si alguna fila no llega
npm run contraste -- --markdown # regenera la tabla de docs/contraste.md
```

Mide el contraste WCAG real de cada par de tokens, incluidos los seis tintes de fase, que se calculan en OKLab con la misma fórmula que `color-mix(in oklab, …)`. Correrlo después de tocar cualquier color de `css/shared.css`.

## Diseño

Tres archivos, en orden de abstracción:

| Archivo | Qué contesta |
|---|---|
| `PRODUCT.md` | Quién usa esto, para qué, con qué voz. Register, usuarios, anti-referencias, principios. |
| `DESIGN.md` | Cómo se ve. Tokens, escala, componentes, motion. Es la fuente para cualquier página nueva. |
| `DESIGN-gsap.md` | La referencia de estilo de gsap.com, de la que deriva todo lo anterior. Solo lectura. |

`DESIGN.md` lista los desvíos deliberados respecto de gsap.com con su razón. Si algo del sitio contradice a `DESIGN.md`, es un bug del sitio.

`muestra.html` es el kitchen sink: todos los componentes en las seis fases, en una sola página. No se enlaza desde la nav.

## Variables de entorno

Ver `.env.example` para la plantilla. Sin estas cuatro, el sitio sigue funcionando completo contra `localStorage` — solo se pierde la sincronización entre dispositivos:

| Variable | De dónde sale |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credenciales → ID de cliente de OAuth (app web). Es el mismo valor que va hardcodeado en la constante `CLIENT_ID` de `js/paginas/index.js`. |
| `EMAILS_PERMITIDOS` | Los correos de David, Abel y Simón, separados por coma. Es la allowlist: cualquier otra cuenta de Google puede loguearse pero el guardado le devuelve 401. |
| `KV_REST_API_URL` | Lo inyecta solo la integración de Upstash for Redis al conectarla desde el Marketplace de Vercel. |
| `KV_REST_API_TOKEN` | Idem. `api/progress.js` también acepta `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` por si el marketplace inyecta esos nombres en vez de los de Vercel KV. |

## Cómo agregar un tema nuevo

Este es el procedimiento que se repite 23 veces (uno por cada tema pendiente de la Etapa 5). En orden:

1. **Escribir el HTML del tema.** Copiar `concept-09-regresion-lineal.html` como punto de partida — ya tiene la estructura correcta: nav, hero, secciones de teoría con diagramas SVG, quiz y ejercicios — y adaptar el contenido al tema nuevo. Guardarlo como `concept-NN-slug.html`, con `NN` el número de dos dígitos que le corresponde en `data/temario.json`. Poner en `<body>` la clase `fase-N` de la fase a la que pertenece: es lo que elige el color de toda la página.
2. **Marcarlo como escrito en `data/temario.json`:** agregar `"escrito": true` y `"ejercicios": N` a la entrada del tema, con `N` la cantidad de ejercicios corregibles. Sin `escrito` el roadmap lo sigue mostrando atenuado; sin `ejercicios` el tema nunca llega a "completo". El verificador exige los dos.
3. **Correr el verificador y el contraste:** `npm run check`. Atrapan los errores más comunes al agregar un tema — color hexadecimal suelto en un SVG, nav sin marcar, enlace roto, eyebrow sin llaves, `ejercicios` olvidado — antes de que lleguen a producción.

Dos cosas que **ya no** hay que hacer a mano, porque se automatizaron: registrar el conteo de ejercicios en `js/paginas/index.js` (ahora sale del temario) y llamar a `montarConceptNav("slug")` desde el JS del tema (ahora `js/nucleo/shared.js` deduce el tema del nombre del archivo).

## Arquitectura en pocas líneas

Sitio estático sin build step, cero dependencias de runtime instaladas (todo lo del navegador entra por CDN: GSAP + ScrollTrigger + DrawSVGPlugin para las animaciones, Lenis para el scroll suave, Google Identity Services para la sesión; en el servidor, solo stdlib de Node). Una única serverless function (`api/progress.js`) que verifica el JWT de Google a mano (sin librería de OAuth) y guarda/lee el progreso en Redis (Upstash, vía REST, sin cliente). El progreso vive primero en `localStorage`; la sincronización con el servidor es opcional y aditiva — fusiona sin nunca perder datos (`Progreso.fusionar` en `js/nucleo/progreso.js`), así que un usuario sin sesión puede seguir progresando y no pierde nada al loguearse después.

## Deploy — lo que falta y requiere cuentas ajenas

Todo lo de acá abajo necesita las cuentas del dueño del proyecto (Google Cloud Console, Vercel) y no se puede automatizar desde el repo.

1. **Crear la credencial OAuth en Google Cloud Console.**
   - Crear un proyecto.
   - APIs y servicios → Pantalla de consentimiento de OAuth → Externo → completar nombre y correo de soporte.
   - Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web.
   - Orígenes de JavaScript autorizados: `http://localhost:3000` y la URL de producción de Vercel.
   - Copiar el ID de cliente.
2. **Provisionar Redis.** En el panel de Vercel: Storage → Marketplace → Upstash for Redis → crear una base en el plan gratuito y conectarla al proyecto. Inyecta `KV_REST_API_URL` y `KV_REST_API_TOKEN` (o sus equivalentes `UPSTASH_REDIS_REST_*`, según cómo nombre las variables la integración — conviene confirmarlo después de conectarla).
3. **Cargar las variables de entorno.** En Vercel → Settings → Environment Variables, para Production y Preview: `GOOGLE_CLIENT_ID` y `EMAILS_PERMITIDOS` (los tres correos separados por coma).
4. **Reemplazar el placeholder en `js/paginas/index.js`.** Pegar el mismo `GOOGLE_CLIENT_ID` del paso 1 en la constante `CLIENT_ID` al principio de `js/paginas/index.js`.
5. **Desplegar:** `npx vercel --prod`.

Después de desplegar, conviene verificar en producción: que el home carga y el roadmap se pinta, que un ejercicio resuelto sin sesión se guarda, que iniciar sesión con Google fusiona ese progreso sin perderlo, que el mismo progreso aparece en otro dispositivo con la misma cuenta, que una cuenta fuera de la allowlist puede seguir usando el sitio contra `localStorage` aunque el guardado remoto le falle, y que un POST a `/api/progress` sin header de autorización devuelve 401.
