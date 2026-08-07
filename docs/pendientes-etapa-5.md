# Pendientes y notas para la Etapa 5

Lo que quedó abierto al terminar las etapas 1 a 4, para quien escriba los 23 temas
restantes. Nada de esto bloquea el deploy.

## Antes de desplegar (requiere cuentas)

1. Crear el ID de cliente OAuth en Google Cloud Console y poner los orígenes
   autorizados (`http://localhost:3000` y la URL de producción).
2. Reemplazar el placeholder `CLIENT_ID` en `index.js`.
3. Provisionar Redis desde el Marketplace de Vercel (Upstash).
4. Cargar `GOOGLE_CLIENT_ID` y `EMAILS_PERMITIDOS` como variables de entorno.
5. `npx vercel --prod`.

El `README.md` tiene el detalle de cada paso.

## Decisiones abiertas

- **El nombre del sitio.** Hoy la marca dice "ML · Estudio". Aparece en la nav de
  todas las páginas y en el pie.
- **Fases 4 y 5 comparten familia cromática** (hue 350 y 330). Se distinguen por
  número y nombre, que es lo que el spec exige, pero es el par más débil de los
  seis. Si molesta al ver el roadmap completo, separar los hues es un cambio de
  una línea en `shared.css`.

## Deuda técnica anotada

Ninguna urgente. Ordenadas por lo que más rinde si se toca:

1. **`EJERCICIOS_POR_TEMA` en `index.js` es un registro manual.** Olvidarlo hace
   que el tema nunca llegue a "completo", en silencio. Lo ideal es mover el conteo
   a `data/temario.json` y que desaparezca el paso; alternativa: que
   `verificar.js` exija una entrada por cada tema con `escrito: true`.
2. **`montarConceptNav` se llama a mano** desde el JS de cada tema, con el slug
   hardcodeado. Si un tema lo olvida, queda un bloque vacío de ~6rem con una línea
   arriba y ningún error. `shared.js` podría derivar el slug de `location.pathname`
   y montarlo solo.
3. **`index.js` y `temas.js` usan `innerHTML`** con datos de `temario.json`. No es
   XSS (el JSON es del repo), pero un `&` o un `<` en el título de un tema futuro
   rompe el markup sin avisar. Si se escriben títulos con esos caracteres, pasarlos
   a `textContent`.
4. **`Anim.controles` es código muerto**: definido y exportado, nunca llamado. Si la
   Etapa 6 no lo usa, borrarlo.
5. **`.ej-fb` sigue con `border-left`** mientras `.callout` pasó a borde completo.
   Son los dos componentes de "mensaje enmarcado" y se ven distintos.
6. **El test de JSON ilegible corrompe `data/temario.json` real** y lo restaura en
   un `finally`. Un Ctrl-C a mitad deja el archivo roto (recuperable con
   `git checkout`). Se arregla haciendo que `verificar()` acepte una ruta opcional.
7. **Reglas muertas en `shared.css`**: `--sombra` declarado dos veces y sin uso,
   `--e32`, `--s50` y `.estrecho` sin referencias.
8. **Faltan tests** que fijen el rechazo de `alg: HS256`, `rs256` en minúscula y
   `alg` ausente en la verificación de JWT. El código los rechaza correctamente
   (comparación estricta con `RS256`), pero nada impediría que una futura
   "mejora" con `.toUpperCase()` pase desapercibida.

## Notas de contenido

- **ISLR: 1ª vs 2ª edición.** El PDF en `assets/` es de la 1ª edición. Los temas 20
  (clustering) y 21 (PCA) citan capítulo 10, que en la 2ª edición es el 12. Nadie
  pudo verificar que el contenido sea idéntico. Chequearlo al escribir esos dos.
- **Los temas 01 y 02** (Python, NumPy) no tienen respaldo en ninguno de los cinco
  libros: todos asumen que ya sabés programar. Son los únicos dos que hay que
  escribir con fuente web.
- **La sección 02 del tema de regresión** explica por qué se elevan al cuadrado los
  errores, pero no nombra el valor absoluto como alternativa descartada. Vale la
  pena agregarlo si se retoma esa página.

## Qué replicar del tema 09 sin cambiarlo

La revisión final marcó estos patrones como los que hay que mantener:

- **El acento por elemento**: `--accent` se declara en `*, *::before, *::after`, no
  en `:root`. Es la única forma de que `oklch()` se recalcule donde `--fase-h`
  cambia. El comentario en `shared.css` explica el porqué.
- **`Progreso.registrar` siempre antes de `pintarResultado`.** El evento del quiz es
  síncrono; invertirlo hace que ningún tema llegue nunca a "completo".
- **Nada se oculta por defecto confiando en que otro componente lo revele.** Este
  proyecto tuvo cuatro bugs de esa forma. Todo camino de falla vuelve a visible.
- **Los comentarios explican el modo de falla, no el código.** Cada uno de ellos
  documenta un bug real que costó una ronda de arreglo.
