# Contraste WCAG — tokens de `shared.css`

Medido calculando luminancia relativa WCAG a partir de los valores de color
computados por el navegador (Chromium, vía `getComputedStyle` + `canvas`
para resolver `oklch()` a sRGB), no con el inspector interactivo. Script
efímero, no versionado — los valores de color se leyeron directo de
`muestra.html` renderizado en los dos temas.

| Par | Requisito | Medido claro | Medido oscuro |
|---|---|---|---|
| `--ink` sobre `--bg` | ≥ 7:1 | 18.43:1 | 18.43:1 |
| `--ink-mute` sobre `--bg` | ≥ 4.5:1 | 5.20:1 | 9.72:1 |
| `--ink` sobre `--accent-tint` (las 6 fases) | ≥ 4.5:1 | 15.42:1 – 16.31:1 | 11.66:1 – 12.71:1 |
| `--accent` sobre `--bg`, uso en títulos grandes | ≥ 3:1 | 5.85:1 | 8.25:1 |

Las cuatro filas pasan en ambos temas, con margen. Detalle por fase de
`--ink` sobre `--accent-tint`:

| Fase | Hue | Claro | Oscuro |
|---|---|---|---|
| 0 · Piso | 220 | 16.20:1 | 11.66:1 |
| 1 · Aprender de los datos | 285 | 15.71:1 | 12.58:1 |
| 2 · Regresión | 145 | 16.31:1 | 11.87:1 |
| 3 · Clasificación | 55 | 15.56:1 | 12.55:1 |
| 4 · Árboles y no supervisado | 350 | 15.42:1 | 12.71:1 |
| 5 · Redes neuronales | 330 | 15.74:1 | 12.66:1 |

No hizo falta ajustar ninguna `L` de token: `--ink` sobre `--bg`,
`--ink-mute` (`--s40` en claro, ya corregido en un commit anterior) y las
seis combinaciones de `--accent-tint` superan sus pisos exigidos en los
dos temas.
