# Product

## Register

brand

## Users

David y Abel, dos amigos que arrancan de cero: saben usar una computadora y nada
más. No son programadores, no vienen de matemática, no tienen un plazo ni un
examen. Estudian por gusto, de noche, en su casa, en una pantalla grande, sin
nadie a quien preguntarle cuando algo no se entiende.

El trabajo a resolver es entender un concepto de machine learning lo bastante
bien como para que el siguiente tenga sentido. El orden importa: cada tema da
por sentado el anterior. El fracaso no es abandonar el sitio, es leer los
veinticuatro temas y no poder explicar ninguno.

Simón, el autor, es el tercer usuario: escribe los temas y necesita que agregar
uno sea mecánico.

## Product Purpose

Veinticuatro temas, seis fases, de "qué es un vector" a redes neuronales. Cada
tema es teoría, un diagrama que se mueve, y ejercicios corregidos en el momento.

El sitio existe porque leer sobre un algoritmo y ver el algoritmo moverse son dos
cosas distintas, y solo la segunda se queda. El éxito es que alguien que terminó
la fase 2 pueda dibujar de memoria por qué se elevan al cuadrado los errores.

No es un producto para terceros ni un proyecto open source. Es material de
estudio a medida, con el nombre de los dos destinatarios en el pie.

## Brand Personality

Nítido, cinético, sin condescendencia.

Habla como alguien que sabe del tema y no necesita demostrarlo: sin entusiasmo
impostado, sin "¡es más fácil de lo que parece!", sin emojis. Explica el modo de
falla, no solo el resultado. Cuando algo es difícil, lo dice y sigue.

El sitio debería sentirse como una pizarra en un estudio de diseño: fondo casi
negro, tiza crema, y un color por disciplina. Nada decorativo que no esté
comunicando algo.

## Anti-references

- **La estética editorial-tipográfica.** Serif de display, itálicas, capitulares,
  etiquetas mono en versalitas, columnas separadas por filetes. Es de donde viene
  este proyecto y es exactamente lo que hay que abandonar. `impeccable` la marca
  como carril saturado; el usuario la rechazó explícitamente.
- **Landing de SaaS.** Número gigante con etiqueta chica, tres tarjetas idénticas
  con ícono redondeado arriba, botón relleno con gradiente, testimonios.
- **Material educativo infantilizado.** Mascotas, globos de diálogo, barras de
  progreso con confeti, colores pastel de "curso online".
- **Blanco puro y negro puro.** El crema `#fffce1` sobre `#0e100f` es la firma;
  `#fff` sobre `#000` la mata.

## Design Principles

1. **Mostrar el movimiento, no describirlo.** El sitio enseña un tema cuyo valor
   es dinámico. Todo concepto que tenga una forma en movimiento se anima; el
   texto describe lo que la animación no puede.
2. **El color es taxonomía, no decoración.** Seis fases, seis colores fijos. Un
   color nunca significa dos cosas. Si algo no pertenece a una fase, es crema.
3. **Practicar lo que se predica.** Un sitio sobre GSAP que usa GSAP. Las
   animaciones son la prueba, no el adorno.
4. **Todo camino de falla vuelve a legible.** Nada se oculta confiando en que
   otro componente lo revele. Si el JS no carga, si un plugin falta, si el
   usuario pidió menos movimiento: el contenido se lee igual.
5. **Agregar un tema es mecánico.** Veintitrés páginas más van a nacer de la
   plantilla. Cualquier decisión que haya que repetir a mano veintitrés veces es
   una decisión mal puesta.

## Accessibility & Inclusion

- Contraste WCAG AAA para texto sobre fondo (`#fffce1` sobre `#0e100f`), AA como
  piso para todo lo demás, incluidos los seis acentos de fase. Medido, no
  estimado: ver `docs/contraste.md`.
- `prefers-reduced-motion` es un camino de primera clase, no un apagado: sin
  Lenis, sin scroll suave, sin `ScrollTrigger` con scrub, y los diagramas
  arrancan en su estado final legible.
- El color nunca es el único portador de significado. Cada fase tiene número y
  nombre además de su color.
- Navegación completa por teclado con foco visible. Sin trampas de hover: lo que
  se revela al pasar el mouse tiene que ser accesible sin mouse.
