/* Pegamento del tema 10. Solo toca `document`, no se testea con node --test. */

const SLUG = "gradiente";

function montarEjercicios() {
  if (!document.getElementById("ejercicios")) return;
  Ejercicios.montar("#ejercicios", [
    { tipo: "mcq", id: "gr-c1",
      q: "El tema 09 dio una fórmula cerrada que calcula la recta de una. ¿Por qué hace falta el descenso de gradiente?",
      opts: [
        "Porque la fórmula cerrada solo funciona con datos que siguen una distribución normal",
        "Porque la fórmula cerrada exige invertir una matriz, que con muchas características es carísimo o imposible, y porque casi ningún otro modelo tiene fórmula cerrada",
        "Porque el descenso de gradiente siempre encuentra una recta mejor que la fórmula",
        "Porque la fórmula cerrada da un resultado aproximado y el gradiente uno exacto"
      ],
      c: 1,
      expl: "Sobre estos datos los dos llegan al mismo lugar, y la fórmula llega más rápido. El punto es que la fórmula solo existe para este modelo: la regresión logística, las SVM y las redes neuronales no la tienen. El descenso de gradiente sirve para todos." },

    { tipo: "mcq", id: "gr-c2",
      q: "Entrenás y el error, en vez de bajar, crece hasta dar infinito. ¿Cuál es la causa más probable?",
      opts: [
        "El learning rate es demasiado grande y cada paso se pasa del mínimo, cada vez más lejos",
        "El learning rate es demasiado chico y no llegó a converger",
        "Faltan datos de entrenamiento",
        "El modelo se sobreajustó a los datos"
      ],
      c: 0,
      expl: "Con un paso demasiado grande, en vez de bajar la colina la saltás y caés más arriba del otro lado. Repetido, el error se dispara. Es el síntoma inconfundible: no es que converge mal, es que diverge. Bajá el learning rate por factores de 10 hasta que deje de pasar." },

    { tipo: "num", id: "gr-n1",
      q: "Tenés una función de error con forma de U cuyo mínimo está en b = 3. En b = 0, su gradiente vale 2(b − 3) = −6. Con un learning rate de 0.1, ¿en qué valor de b quedás después de un paso?",
      resp: 0.6, tol: 0.01,
      trampas: [
        { val: -0.6, msg: "Sumaste el gradiente en vez de restarlo. El gradiente apunta hacia donde el error SUBE, así que para bajar hay que ir en contra: b − lr × gradiente. Sumándolo te alejás del mínimo." },
        { val: 3, msg: "Ese es el mínimo, adonde querés llegar, pero no de un solo paso. El descenso de gradiente avanza de a poco: por eso hace falta iterar cientos o miles de veces." }
      ],
      expl: "b − lr × gradiente = 0 − 0.1 × (−6) = 0.6. Te moviste 0.6 hacia el 3. El paso siguiente arranca desde ahí, con un gradiente más chico, así que avanza menos: cerca del mínimo los pasos se achican solos." },

    { tipo: "parsons", id: "gr-p1",
      q: "Armá el bucle de descenso de gradiente para una recta. Sobra una línea: descartala con ×.",
      lineas: [
        "def descenso(x, y, lr, pasos):",
        "    b0, b1 = 0.0, 0.0",
        "    for _ in range(pasos):",
        "        error = (b0 + b1 * x) - y",
        "        b0 = b0 - lr * 2 * error.mean()",
        "        b1 = b1 - lr * 2 * (error * x).mean()",
        "    return b0, b1"
      ],
      distractores: ["        b0 = b0 + lr * 2 * error.mean()"],
      expl: "Se resta, no se suma: el gradiente señala la dirección en la que el error crece. La línea con el signo cambiado no da error, corre perfecto y hace que el error suba en cada vuelta hasta desbordar. Es el mismo bug que el ejercicio numérico de arriba, escrito en código." },

    { tipo: "python", id: "gr-py1",
      q: "Corré el descenso de gradiente sobre los mismos cinco puntos del tema 09 y comprobá que llega adonde llegó la fórmula cerrada. Imprimí los dos coeficientes redondeados a un decimal: print(round(b0, 1), round(b1, 1)).",
      inicial: `import numpy as np

x = np.array([1, 2, 3, 4, 5], dtype=float)
y = np.array([2, 4, 5, 4, 5], dtype=float)

b0, b1 = 0.0, 0.0
lr = 0.01

for _ in range(5000):
    error = (b0 + b1 * x) - y
    # Completá: actualizá b0 y b1 restando el gradiente por el learning rate.
    # El gradiente de b0 es 2 * error.mean()
    # El gradiente de b1 es 2 * (error * x).mean()
    pass

# Completá: imprimí round(b0, 1) y round(b1, 1)
`,
      paquetes: ["numpy"],
      esperado: "2.2 0.6",
      expl: "Llegaste a 2.2 y 0.6, exactamente los mismos números que dio la fórmula cerrada en el tema 09, pero sin despejar nada: solo bajando la colina cinco mil veces. Probá con lr = 0.1 y vas a ver el error desbordar; con lr = 0.0001, que cinco mil pasos no alcanzan para llegar." }
  ], SLUG);
}

function montarProgresoLectura() {
  const sintesis = document.getElementById("sintesis");
  if (!sintesis) return;
  if (typeof IntersectionObserver === "undefined") {
    Progreso.marcarLeido(SLUG);
    return;
  }
  new IntersectionObserver((es, obs) => {
    if (es[0].isIntersecting) {
      Progreso.marcarLeido(SLUG);
      obs.disconnect();
    }
  }, { threshold: 0.6 }).observe(sintesis);
}

montarEjercicios();
montarProgresoLectura();

/* Animaciones: decorativas, van al final. */
Anim.dibujar("#d-diseno");
Anim.aparecer("#d-diseno");
Anim.dibujar("#d-colina");
Anim.aparecer("#d-colina");
Anim.dibujar("#d-lr");
Anim.aparecer("#d-lr");
