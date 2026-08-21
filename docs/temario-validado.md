# Temario validado — 24 temas en 6 fases

Contraste del temario de §3 del spec (`docs/superpowers/specs/2026-08-06-machine-learning-app-design.md`)
contra los índices reales de los 5 libros de referencia. Los índices se extrajeron
en un archivo de trabajo local que no se versiona: son tablas de contenido de obras con
copyright y no corresponde publicarlas. Cantidad de temas (24) y fases (6) sin cambios, tal como fija
el spec. Detalle completo de cada discrepancia y su resolución en
`.superpowers/sdd/2026-08-06-etapas-1-4/task-1-report.md`.

Ediciones confirmadas de las fuentes: ISLR **1ª edición** (2013), ESL 2ª edición, Bishop
edición única (2006), Géron **3ª edición** (2023), Goodfellow edición única (2017). Las
dos ediciones en negrita son las que generaron discrepancias — ver columna `nota`.

| n | titulo | slug | fase | fuente_principal | fuentes_apoyo | nota |
|---|---|---|---|---|---|---|
| 01 | Python esencial: variables, listas, bucles, funciones | `python` | 0 | Web: documentación oficial de Python (docs.python.org/es/3/tutorial) | Géron cap. 2 (uso práctico de Python en el proyecto end-to-end) | Corregido. El spec citaba "Géron, ap. A", pero ningún apéndice de Géron (ni 2ª ni 3ª ed.) enseña Python — los 4 apéndices de la 3ª ed. son Project Checklist, Autodiff, Special Data Structures, TensorFlow Graphs. Ninguno de los 5 libros cubre Python desde cero: son textos de ML/estadística que asumen el lenguaje como dado. Se resuelve con fuente web, tal como anticipa el propio §7 del spec ("búsqueda web para ejemplos, datasets y notación actual"). |
| 02 | NumPy y pensar en vectores | `numpy` | 0 | Web: NumPy — guía para principiantes (numpy.org/doc/stable/user/absolute_beginners.html) | Géron (NumPy usado en ejemplos a lo largo del libro) | Corregido, mismo motivo que 01: no existe apéndice de NumPy en Géron. |
| 03 | Álgebra lineal mínima: vectores, matrices, producto punto | `algebra` | 0 | Goodfellow cap. 2 | — | Verificado. Goodfellow cap. 2 es "Linear Algebra", cubre escalares/vectores/matrices/producto punto. Sin cambios. |
| 04 | Probabilidad y estadística mínima: media, varianza, Bayes | `probabilidad` | 0 | Goodfellow cap. 3 | Bishop cap. 1.2 | Verificado. Goodfellow cap. 3 "Probability and Information Theory"; Bishop 1.2 "Probability Theory" cubre Bayes explícitamente. Sin cambios. |
| 05 | Qué es machine learning: supervisado, no supervisado, tipos de problema | `que-es-ml` | 1 | ISLR cap. 1–2 | Géron cap. 1 | Verificado. ISLR 2.1.4/2.1.5 tratan supervisado/no supervisado y regresión/clasificación; Géron cap. 1 "The Machine Learning Landscape" cubre lo mismo con más ejemplos. Sin cambios. |
| 06 | El flujo de trabajo: datos → modelo → evaluación | `flujo` | 1 | Géron cap. 2 | — | Verificado. "End-to-End Machine Learning Project", coincide exactamente. Sin cambios. |
| 07 | Train/test y validación cruzada | `validacion` | 1 | ISLR cap. 5 | — | Verificado. "Resampling Methods": 5.1 Cross-Validation, 5.2 The Bootstrap. Sin cambios. |
| 08 | Sesgo, varianza, overfitting y underfitting | `sesgo-varianza` | 1 | ISLR cap. 2.2 | ESL cap. 7 | Verificado. ISLR 2.2.2 "The Bias-Variance Trade-Off"; ESL cap. 7 "Model Assessment and Selection" (7.2–7.3 bias/variance). Sin cambios. |
| 09 | **Regresión lineal simple** ← slice vertical | `regresion-lineal` | 2 | ISLR cap. 3.1 | ESL cap. 3.2 | Verificado. ISLR 3.1 "Simple Linear Regression"; ESL 3.2 "Linear Regression Models and Least Squares". Sin cambios. |
| 10 | Regresión múltiple y descenso de gradiente | `gradiente` | 2 | ISLR cap. 3.2 | Géron cap. 4 | Verificado. ISLR 3.2 "Multiple Linear Regression" (no cubre descenso de gradiente, ISLR no lo trata); Géron cap. 4 "Training Models" sí cubre Gradient Descent explícitamente — la combinación es correcta y necesaria tal como está. Sin cambios. |
| 11 | Regularización: Ridge y Lasso | `regularizacion` | 2 | ISLR cap. 6.2 | ESL cap. 3.4 | Verificado. ISLR 6.2 "Shrinkage Methods" (Ridge 6.2.1, Lasso 6.2.2); ESL 3.4 "Shrinkage Methods" (mismo nombre, mismo contenido). Sin cambios. |
| 12 | Clasificación y regresión logística | `logistica` | 3 | ISLR cap. 4 | Bishop cap. 4.3 | Verificado. ISLR cap. 4 "Classification" (4.3 Logistic Regression); Bishop 4.3.2 "Logistic regression". Sin cambios. |
| 13 | Métricas: matriz de confusión, precisión, recall, ROC-AUC | `metricas` | 3 | Géron cap. 3 | — | Verificado. "Classification": Confusion Matrices, Precision/Recall, ROC Curve — los tres puntos exactos del temario. Sin cambios. |
| 14 | K vecinos más cercanos | `knn` | 3 | ISLR cap. 2.2.3 | ESL cap. 13.3 | Verificado. ISLR 2.2.3 "The Classification Setting" introduce KNN como aproximación al clasificador de Bayes; ESL 13.3 "k-Nearest-Neighbor Classifiers" es el desarrollo completo. Sin cambios. |
| 15 | Naïve Bayes | `naive-bayes` | 3 | ESL cap. 6.6.3 | Bishop cap. 4.2 | Corregido: fuente principal cambiada de Bishop a ESL. El spec citaba solo "Bishop cap. 4.2", pero esa sección ("Probabilistic Generative Models" → 4.2.3 "Discrete features") nunca nombra "Naive Bayes" — trata clasificadores generativos en general. ESL 6.6.3 se titula literalmente "The Naive Bayes Classifier" y es la fuente más precisa. Bishop 4.2 queda como apoyo conceptual (el marco generativo bayesiano del que Naive Bayes es un caso particular). |
| 16 | SVM y el truco del kernel | `svm` | 3 | ISLR cap. 9 | Bishop cap. 7 | Verificado. ISLR cap. 9 "Support Vector Machines"; Bishop cap. 7 "Sparse Kernel Machines" (7.1 Maximum Margin Classifiers). Sin cambios. |
| 17 | Árboles de decisión | `arboles` | 4 | ISLR cap. 8.1 | — | Verificado. "The Basics of Decision Trees". Sin cambios. |
| 18 | Random Forest y bagging | `random-forest` | 4 | ISLR cap. 8.2 | ESL cap. 15 | Verificado. ISLR 8.2 "Bagging, Random Forests, Boosting"; ESL cap. 15 "Random Forests" dedicado. Sin cambios. |
| 19 | Boosting y gradient boosting | `boosting` | 4 | ESL cap. 10 | Géron cap. 7 | Verificado. ESL cap. 10 "Boosting and Additive Trees"; Géron cap. 7 "Ensemble Learning and Random Forests" (sección Boosting: AdaBoost, Gradient Boosting). Sin cambios. |
| 20 | Clustering: K-means y jerárquico | `clustering` | 4 | ISLR cap. 10.3 | Bishop cap. 9.1 | Corregido: ISLR cap. 12.4 → **cap. 10.3**. El spec asume la 2ª edición de ISLR, donde Unsupervised Learning es el cap. 12. El PDF disponible es la 1ª edición (436 pp., sin caps. 10–13 de la 2ª ed.), donde Unsupervised Learning es el cap. 10 y "10.3 Clustering Methods" cubre K-means (10.3.1) y jerárquico (10.3.2). Bishop 9.1 "K-means Clustering" sin cambios. |
| 21 | Reducción de dimensionalidad: PCA | `pca` | 4 | ISLR cap. 10.2 | Bishop cap. 12.1 | Corregido: ISLR cap. 12.2 → **cap. 10.2**, mismo motivo que el tema 20 (edición 1ª vs 2ª). "10.2 Principal Components Analysis" en la edición disponible. Bishop 12.1 "Principal Component Analysis" sin cambios. |
| 22 | Del perceptrón a la red multicapa | `perceptron` | 5 | Géron cap. 10 | Goodfellow cap. 6.1 | Verificado. Géron cap. 10 "Introduction to Artificial Neural Networks with Keras" (The Perceptron, The Multilayer Perceptron and Backpropagation); Goodfellow 6.1 "Example: Learning XOR" — el ejemplo canónico que muestra por qué un perceptrón simple no alcanza y motiva la red multicapa. Sin cambios. |
| 23 | Backpropagation y entrenamiento | `backprop` | 5 | Goodfellow cap. 6.5 | Bishop cap. 5.3 | Verificado. Goodfellow 6.5 "Back-Propagation and Other Differentiation Algorithms"; Bishop 5.3 "Error Backpropagation". Sin cambios. |
| 24 | CNNs conceptualmente y qué sigue | `cnn` | 5 | Géron cap. 14 | Goodfellow cap. 9 | Verificado. Géron cap. 14 "Deep Computer Vision Using Convolutional Neural Networks"; Goodfellow cap. 9 "Convolutional Networks". Sin cambios. |

## Resumen de discrepancias

5 discrepancias encontradas y corregidas, todas dentro de la fase original del tema
(ningún tema se reemplazó por otro):

1. **Tema 01 (`python`)** — Géron no tiene apéndice de Python en ninguna edición. Fuente
   pasa a web.
2. **Tema 02 (`numpy`)** — mismo motivo que 01. Fuente pasa a web.
3. **Tema 15 (`naive-bayes`)** — fuente principal cambiada de Bishop cap. 4.2 (no nombra
   "Naive Bayes") a ESL cap. 6.6.3 (título explícito).
4. **Tema 20 (`clustering`)** — ISLR cap. 12.4 → cap. 10.3 (edición 1ª vs 2ª de ISLR).
5. **Tema 21 (`pca`)** — ISLR cap. 12.2 → cap. 10.2 (mismo motivo que 20).

Ningún tema del spec resultó completamente inválido ni necesitó reemplazo por otro
dentro de su fase. Los 19 temas restantes se verificaron contra el índice real y
coinciden con el capítulo citado.
