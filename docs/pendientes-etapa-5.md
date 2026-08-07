# Pendientes y notas para la Etapa 5

Lo que queda abierto para quien escriba los 23 temas restantes. Nada de esto
bloquea el deploy.

## Antes de desplegar (requiere cuentas)

1. Crear el ID de cliente OAuth en Google Cloud Console y poner los orígenes
   autorizados (`http://localhost:3000` y la URL de producción).
2. Reemplazar el placeholder `CLIENT_ID` en `index.js`.
3. Provisionar Redis desde el Marketplace de Vercel (Upstash).
4. Cargar `GOOGLE_CLIENT_ID` y `EMAILS_PERMITIDOS` como variables de entorno.
5. `npx vercel --prod`.

El `README.md` tiene el detalle de cada paso.

## Cerrado en el rediseño a GSAP

Queda anotado para no volver a abrirlo por error.

- **El tema claro se eliminó.** `DESIGN-gsap.md` prohíbe romper el par crema
  sobre negro, y gsap.com es de un solo canvas. Se fue el toggle, se fueron
  `temaInicial`/`aplicarTema`/`toggleTheme` de `shared.js`, y `docs/contraste.md`
  perdió la columna por tema. Si alguna vez vuelve, vuelve con sus filas en
  `contraste.js`.
- **Las seis fases ya no comparten familia cromática.** Antes eran hues
  rotando en `oklch()` y las fases 4 y 5 (350 y 330) eran indistinguibles.
  Ahora son seis hex fijos de la paleta de gsap.com. El par más cercano pasó a
  ser 2 (`#0ae448`) y 5 (`#abff84`), que son verde saturado contra verde
  pastel: se distinguen.
- **`EJERCICIOS_POR_TEMA` no existe más.** El conteo vive en
  `data/temario.json`, campo `ejercicios`, y `verificar.js` lo exige en todo
  tema con `escrito: true`. Era el paso más fácil de olvidar de los cuatro que
  pedía agregar un tema, y fallaba en silencio.
- **`montarConceptNav` se monta solo.** `shared.js` deduce el tema del nombre
  del archivo contra `temario.json`. Ya no hay slug hardcodeado en el JS de
  cada tema, ni bloque vacío de 6rem si alguien se lo olvida.
- **`index.js` y `temas.js` no usan `innerHTML`.** Todo se arma con nodos. Un
  `&` o un `<` en el título de un tema futuro ya no rompe el markup.
- **`Anim.controles` se borró.** Estaba definido, exportado y nunca llamado.
  Con él se fue la regla `.diag-ctrl` del CSS.
- **`.ej-fb` pasó a borde completo.** El `border-left` de acento está prohibido
  por `DESIGN-gsap.md` y por la skill `impeccable`. Ahora es el mismo
  componente que `.callout`.
- **Las reglas muertas de `shared.css` se fueron** en la reescritura completa:
  `--sombra`, `--e32`, `.estrecho`.

## Deuda técnica que sigue abierta

1. **El test de JSON ilegible corrompe `data/temario.json` real** y lo restaura
   en un `finally`. Un Ctrl-C a mitad deja el archivo roto (recuperable con
   `git checkout`). Se arregla haciendo que `verificar()` acepte una ruta
   opcional.
2. **Faltan tests** que fijen el rechazo de `alg: HS256`, `rs256` en minúscula y
   `alg` ausente en la verificación de JWT. El código los rechaza correctamente
   (comparación estricta con `RS256`), pero nada impediría que una futura
   "mejora" con `.toUpperCase()` pase desapercibida.
3. **`--s50` quedó restringido a lo no textual** y nada lo hace cumplir salvo el
   comentario en `shared.css`. Si alguien lo usa para texto sobre `--off-black`,
   quedan 4.16:1 y `contraste.js` no lo ve, porque mide tokens, no usos.
4. **El borde de gradiente del CTA depende de `mask-composite`.** Hay un
   `@supports` que deja el borde crema liso como fallback, así que el botón
   nunca queda invisible, pero en un navegador viejo se pierde la única
   escalación cromática del sistema.

## Decisiones abiertas

- **El nombre del sitio.** Hoy la marca dice "ML · Estudio". Aparece en la nav
  de todas las páginas y en el pie.
- **Mori de verdad.** El sitio usa Inter Tight, que es el sustituto que nombra
  `DESIGN-gsap.md`, pero el doc avisa que la calidez humanista de Mori es
  load-bearing y que un grotesco geométrico enfría el tono. Si algún día se
  compran los `.woff2` de PP Mori, el cambio es una línea: `--font` en
  `shared.css`. Nada más del sistema nombra la familia.

## Notas de contenido

- **ISLR: 1ª vs 2ª edición.** El PDF en `assets/` es de la 1ª edición. Los temas
  20 (clustering) y 21 (PCA) citan capítulo 10, que en la 2ª edición es el 12.
  Nadie pudo verificar que el contenido sea idéntico. Chequearlo al escribir
  esos dos.
- **Los temas 01 y 02** (Python, NumPy) no tienen respaldo en ninguno de los
  cinco libros: todos asumen que ya sabés programar. Son los únicos dos que hay
  que escribir con fuente web.
- **La sección 02 del tema de regresión** explica por qué se elevan al cuadrado
  los errores, pero no nombra el valor absoluto como alternativa descartada.
  Vale la pena agregarlo si se retoma esa página.

## Qué replicar del tema 09 sin cambiarlo

Patrones que hay que mantener al escribir los 23 restantes:

- **`Progreso.registrar` siempre antes de `pintarResultado`.** El evento del
  quiz es síncrono; invertirlo hace que ningún tema llegue nunca a "completo".
- **Nada se oculta por defecto confiando en que otro componente lo revele.**
  Este proyecto tuvo cuatro bugs de esa forma. Todo camino de falla vuelve a
  visible: por eso el hero no se oculta desde el CSS, y por eso `.reveal` vive
  detrás de la clase `.js`.
- **Los comentarios explican el modo de falla, no el código.** Cada uno
  documenta un bug real que costó una ronda de arreglo.
- **El color de la página lo pone `class="fase-N"` en el `<body>`,** y de ahí
  hereda todo. Ningún componente elige su color; lo recibe.
