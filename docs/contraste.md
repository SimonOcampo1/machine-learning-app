# Contraste WCAG — tokens de `shared.css`

Generado por `node contraste.js`. **No editar a mano**: para actualizar la tabla,
correr `node contraste.js --markdown` y pegar la salida.

El script sale con código 1 si alguna fila baja de su piso, así que sirve como
chequeo antes de commitear un cambio de color. Los tintes de fase se calculan en
OKLab con la misma fórmula que `color-mix(in oklab, …)`, así que el número de acá
es el que pinta el navegador. La versión anterior de este archivo medía con un
script efímero de Chromium que no quedó versionado; esto lo reemplaza.

## Pisos

| Uso | Piso | Por qué |
|---|---|---|
| Texto principal sobre su fondo | 7:1 | AAA. Son bloques largos de teoría. |
| Texto secundario y acentos de fase | 4.5:1 | AA para texto normal. |
| `--s50` | 3:1 | Nunca pinta texto: solo trazos de eje y rellenos de ícono. |

## Medición

| Par | Piso | Medido | |
|---|---|---|---|
| `--cream sobre canvas` | 7:1 | 18.43:1 | ✅ |
| `--cream sobre panel` | 7:1 | 16.97:1 | ✅ |
| `--ink-mute (s75) sobre canvas` | 4.5:1 | 9.72:1 | ✅ |
| `--ink-mute (s75) sobre panel` | 4.5:1 | 8.95:1 | ✅ |
| `--s50 (no-texto) sobre canvas` | 3:1 | 4.52:1 | ✅ |
| `--s50 (no-texto) sobre panel` | 3:1 | 4.16:1 | ✅ |
| `fase 0 · Piso` | 4.5:1 | 8.29:1 | ✅ |
| `fase 1 · Aprender de los datos` | 4.5:1 | 7.44:1 | ✅ |
| `fase 2 · Regresión` | 4.5:1 | 11.10:1 | ✅ |
| `fase 3 · Clasificación` | 4.5:1 | 7.93:1 | ✅ |
| `fase 4 · Árboles y no supervisado` | 4.5:1 | 13.27:1 | ✅ |
| `fase 5 · Redes neuronales` | 4.5:1 | 15.79:1 | ✅ |
| `--cream sobre tinte de fase 0 (#141e20)` | 7:1 | 16.39:1 | ✅ |
| `--cream sobre tinte de fase 1 (#1a1c22)` | 7:1 | 16.43:1 | ✅ |
| `--cream sobre tinte de fase 2 (#152116)` | 7:1 | 16.07:1 | ✅ |
| `--cream sobre tinte de fase 3 (#221b14)` | 7:1 | 16.41:1 | ✅ |
| `--cream sobre tinte de fase 4 (#211f22)` | 7:1 | 15.78:1 | ✅ |
| `--cream sobre tinte de fase 5 (#1b231a)` | 7:1 | 15.56:1 | ✅ |

## El único hallazgo que obligó a cambiar un token

`--s50` (`#7c7c6f`, el gris apagado que usa gsap.com para texto secundario) da
**4.16:1 sobre el panel** `#191919`. No llega a AA. Sobre el canvas pasa raspando
con 4.52:1, que es lo que hace que funcione en gsap.com, donde casi todo vive
sobre el canvas.

Acá no: el texto secundario también vive dentro de las tarjetas de tema, que son
panel. En vez de bajar el piso, el token de texto pasó a ser `--s75` (`#bbbaa6`,
también de gsap.com) y `--s50` quedó restringido a lo no-textual.

El tema claro se eliminó en el rediseño, así que este archivo ya no tiene columna
por tema: hay un solo canvas.
