# Índices de los 5 libros de referencia

Extraído con `convert-documents-to-markdown` (anydoc), **solo de las páginas de
Tabla de Contenidos** de cada PDF (rango de páginas indicado por libro, numeración de
archivo PDF, no numeración impresa). No se convirtió ningún libro completo.

Este archivo es la base contra la que se validó `docs/temario-validado.md`.

---

## ISLR

**An Introduction to Statistical Learning with Applications in R** — Gareth James,
Daniela Witten, Trevor Hastie, Robert Tibshirani. Springer Texts in Statistics.

**Edición detectada: 1ª edición** (2013, 436 páginas totales). *No* es la 2ª edición
(2021, ~600 páginas, que agrega caps. 10 Deep Learning, 11 Survival Analysis, 13
Multiple Testing y renumera Unsupervised Learning como cap. 12). Esto importa: el spec
cita `ISLR cap. 12.2` y `cap. 12.4` para PCA y clustering, números que corresponden a la
2ª edición. En esta 1ª edición, PCA y clustering están dentro del cap. 10 (Unsupervised
Learning) — ver `docs/temario-validado.md` para la corrección aplicada.

Páginas PDF extraídas: 10–15 (Contents).

```
Contents
Preface vii
1 Introduction 1
2 Statistical Learning 15
  2.1 What Is Statistical Learning? 15
    2.1.1 Why Estimate f? 17
    2.1.2 How Do We Estimate f? 21
    2.1.3 The Trade-Off Between Prediction Accuracy and Model Interpretability 24
    2.1.4 Supervised Versus Unsupervised Learning 26
    2.1.5 Regression Versus Classification Problems 28
  2.2 Assessing Model Accuracy 29
    2.2.1 Measuring the Quality of Fit 29
    2.2.2 The Bias-Variance Trade-Off 33
    2.2.3 The Classification Setting 37
  2.3 Lab: Introduction to R 42
  2.4 Exercises 52
3 Linear Regression 59
  3.1 Simple Linear Regression 61
  3.2 Multiple Linear Regression 71
  3.3 Other Considerations in the Regression Model 82
  3.4 The Marketing Plan 102
  3.5 Comparison of Linear Regression with K-Nearest Neighbors 104
  3.6 Lab: Linear Regression 109
  3.7 Exercises 120
4 Classification 127
  4.1 An Overview of Classification 128
  4.2 Why Not Linear Regression? 129
  4.3 Logistic Regression 130
  4.4 Linear Discriminant Analysis 138
  4.5 A Comparison of Classification Methods 151
  4.6 Lab: Logistic Regression, LDA, QDA, and KNN 154
    4.6.5 K-Nearest Neighbors 163
  4.7 Exercises 168
5 Resampling Methods 175
  5.1 Cross-Validation 176
  5.2 The Bootstrap 187
  5.3 Lab: Cross-Validation and the Bootstrap 190
  5.4 Exercises 197
6 Linear Model Selection and Regularization 203
  6.1 Subset Selection 205
  6.2 Shrinkage Methods 214
    6.2.1 Ridge Regression 215
    6.2.2 The Lasso 219
  6.3 Dimension Reduction Methods 228
  6.4 Considerations in High Dimensions 238
  6.5–6.7 Labs 244
  6.8 Exercises 259
7 Moving Beyond Linearity 265
  7.1 Polynomial Regression 266
  7.2 Step Functions 268
  ...
  7.9 Exercises 297
8 Tree-Based Methods 303
  8.1 The Basics of Decision Trees 303
    8.1.1 Regression Trees 304
    8.1.2 Classification Trees 311
  8.2 Bagging, Random Forests, Boosting 316
    8.2.1 Bagging 316
    8.2.2 Random Forests 319
    8.2.3 Boosting 321
  8.3 Lab: Decision Trees 323
  8.4 Exercises 332
9 Support Vector Machines 337
  9.1 Maximal Margin Classifier 338
  9.2 Support Vector Classifiers 344
  9.3 Support Vector Machines 349
  9.4 SVMs with More than Two Classes 355
  9.5 Relationship to Logistic Regression 356
  9.6 Lab: Support Vector Machines 359
  9.7 Exercises 368
10 Unsupervised Learning 373
  10.1 The Challenge of Unsupervised Learning 373
  10.2 Principal Components Analysis 374
    10.2.1 What Are Principal Components? 375
    10.2.2 Another Interpretation of Principal Components 379
    10.2.3 More on PCA 380
    10.2.4 Other Uses for Principal Components 385
  10.3 Clustering Methods 385
    10.3.1 K-Means Clustering 386
    10.3.2 Hierarchical Clustering 390
    10.3.3 Practical Issues in Clustering 399
  10.4–10.6 Labs 401
  10.7 Exercises 413
Index 419
```

---

## ESL

**The Elements of Statistical Learning: Data Mining, Inference, and Prediction** —
Trevor Hastie, Robert Tibshirani, Jerome Friedman. Springer Series in Statistics.

**Edición detectada: 2ª edición** (764 páginas totales, "Preface to the Second
Edition"). Es la edición esperada por el spec.

Páginas PDF extraídas: 10–19 (Contents).

```
Contents
1 Introduction 1
2 Overview of Supervised Learning 9
  2.3 Two Simple Approaches to Prediction: Least Squares and Nearest Neighbors 11
  2.9 Model Selection and the Bias–Variance Tradeoff 37
3 Linear Methods for Regression 43
  3.2 Linear Regression Models and Least Squares 44
  3.4 Shrinkage Methods 61
    3.4.1 Ridge Regression 61
    3.4.2 The Lasso 68
4 Linear Methods for Classification 101
  4.3 Linear Discriminant Analysis 106
  4.4 Logistic Regression 119
  4.5 Separating Hyperplanes 129
    4.5.1 Rosenblatt's Perceptron Learning Algorithm 130
5 Basis Expansions and Regularization 139
6 Kernel Smoothing Methods 191
  6.6 Kernel Density Estimation and Classification 208
    6.6.3 The Naive Bayes Classifier 210
7 Model Assessment and Selection 219
  7.2 Bias, Variance and Model Complexity 219
  7.3 The Bias–Variance Decomposition 223
  7.10 Cross-Validation 241
  7.11 Bootstrap Methods 249
8 Model Inference and Averaging 261
  8.2 The Bootstrap and Maximum Likelihood Methods 261
  8.7 Bagging 282
9 Additive Models, Trees, and Related Methods 295
  9.2 Tree-Based Methods 305
10 Boosting and Additive Trees 337
  10.1 Boosting Methods 337
  10.2 Boosting Fits an Additive Model 341
  10.10 Numerical Optimization via Gradient Boosting 358
11 Neural Networks 389
12 Support Vector Machines and Flexible Discriminants 417
  12.2 The Support Vector Classifier 417
  12.3 Support Vector Machines and Kernels 423
13 Prototype Methods and Nearest-Neighbors 459
  13.2.1 K-means Clustering 460
  13.3 k-Nearest-Neighbor Classifiers 463
14 Unsupervised Learning 485
  14.3 Cluster Analysis 501
    14.3.12 Hierarchical Clustering 520
  14.5 Principal Components, Curves and Surfaces 534
15 Random Forests 587
16 Ensemble Learning 605
17 Undirected Graphical Models 625
18 High-Dimensional Problems: p >> N 649
References 699
Index 737
```

---

## Bishop

**Pattern Recognition and Machine Learning** — Christopher M. Bishop. Information
Science and Statistics, Springer, 2006. 749 páginas totales. Edición única, sin
ambigüedad.

Páginas PDF extraídas: 12–19 (Contents).

```
Contents
1 Introduction 1
  1.2 Probability Theory 12
    1.2.1 Probability densities 17
    1.2.2 Expectations and covariances 19
    1.2.3 Bayesian probabilities 21
    1.2.4 The Gaussian distribution 24
    1.2.5 Curve fitting re-visited 28
    1.2.6 Bayesian curve fitting 30
2 Probability Distributions 67
3 Linear Models for Regression 137
4 Linear Models for Classification 179
  4.1 Discriminant Functions 181
    4.1.7 The perceptron algorithm 192
  4.2 Probabilistic Generative Models 196
    4.2.3 Discrete features 202
  4.3 Probabilistic Discriminative Models 203
    4.3.2 Logistic regression 205
5 Neural Networks 225
  5.3 Error Backpropagation 241
6 Kernel Methods 291
7 Sparse Kernel Machines 325
  7.1 Maximum Margin Classifiers 326
8 Graphical Models 359
9 Mixture Models and EM 423
  9.1 K-means Clustering 424
10 Approximate Inference 461
11 Sampling Methods 523
12 Continuous Latent Variables 559
  12.1 Principal Component Analysis 561
  12.2 Probabilistic PCA 570
13 Sequential Data 605
14 Combining Models 653
  14.3 Boosting 657
Appendix D Calculus of Variations 703
Appendix E Lagrange Multipliers 707
References 711
Index 729
```

---

## Géron

**Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow** — Aurélien
Géron. O'Reilly.

**Edición detectada: 3ª edición** (2023, "THIRD EDITION" en portada, 864 páginas
totales). La numeración de capítulos 1–19 es idéntica a la 2ª edición (2019); lo que
cambia entre ediciones es contenido dentro de los capítulos (p. ej. cap. 17 suma
Diffusion Models en la 3ª), no los números. **Hallazgo relevante:** ninguna de las dos
ediciones tiene un apéndice de Python o NumPy — los apéndices de esta 3ª edición son
A. Machine Learning Project Checklist, B. Autodiff, C. Special Data Structures, D.
TensorFlow Graphs. El material de Python/NumPy que el libro asume como previo vive en
notebooks complementarios del repo de GitHub del autor, no en el libro impreso. Esto
afecta los temas 01 y 02 — ver `docs/temario-validado.md`.

Páginas PDF extraídas: 5–16 (Table of Contents).

```
Table of Contents
Preface xv
Part I. The Fundamentals of Machine Learning
1. The Machine Learning Landscape 3
2. End-to-End Machine Learning Project 39
3. Classification 103
  Measuring Accuracy Using Cross-Validation 107
  Confusion Matrices 108
  Precision and Recall 110
  The ROC Curve 115
4. Training Models 131
  Linear Regression 132
  Gradient Descent 138
  Regularized Linear Models 155 (Ridge 156, Lasso 158, Elastic Net 161)
  Logistic Regression 164
5. Support Vector Machines 175
6. Decision Trees 195
7. Ensemble Learning and Random Forests 211
  Boosting 222 (AdaBoost 223, Gradient Boosting 226)
8. Dimensionality Reduction 237
  PCA 243
9. Unsupervised Learning Techniques 259
  Clustering Algorithms: k-means and DBSCAN 260
Part II. Neural Networks and Deep Learning
10. Introduction to Artificial Neural Networks with Keras 299
  The Perceptron 304
  The Multilayer Perceptron and Backpropagation 309
11. Training Deep Neural Networks 357
12. Custom Models and Training with TensorFlow 403
13. Loading and Preprocessing Data with TensorFlow 441
14. Deep Computer Vision Using Convolutional Neural Networks 479
15. Processing Sequences Using RNNs and CNNs 537
16. Natural Language Processing with RNNs and Attention 577
17. Autoencoders, GANs, and Diffusion Models 635
18. Reinforcement Learning 683
19. Training and Deploying TensorFlow Models at Scale 721
A. Machine Learning Project Checklist 779
B. Autodiff 785
C. Special Data Structures 793
D. TensorFlow Graphs 801
Index 811
```

---

## Goodfellow

**Deep Learning** — Ian Goodfellow, Yoshua Bengio, Aaron Courville (con Francis Bach).
Adaptive Computation and Machine Learning Series, MIT Press, 2017. 800 páginas totales.
Edición única.

Páginas PDF extraídas: 2–7 (Contents).

```
Contents
1 Introduction 1
Part I Applied Math and Machine Learning Basics 29
2 Linear Algebra 31
3 Probability and Information Theory 53
4 Numerical Computation 80
5 Machine Learning Basics 98
  5.9 Stochastic Gradient Descent 151
Part II Deep Networks: Modern Practices 166
6 Deep Feedforward Networks 168
  6.1 Example: Learning XOR 171
  6.5 Back-Propagation and Other Differentiation Algorithms 204
7 Regularization for Deep Learning 228
8 Optimization for Training Deep Models 274
9 Convolutional Networks 330
  9.10 The Neuroscientific Basis for Convolutional Networks
  9.11 Convolutional Networks and the History of Deep Learning
10 Sequence Modeling: Recurrent and Recursive Nets 373
11 Practical Methodology 421
12 Applications 443
Part III Deep Learning Research 486
13 Linear Factor Models 489
14 Autoencoders 502
...
Bibliography 721
Index 777
```
