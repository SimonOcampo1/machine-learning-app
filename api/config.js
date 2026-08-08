/* Configuración pública del cliente.

   El client id de Google NO es un secreto: viaja al navegador en cada carga,
   aparece en el HTML, en la URL del iframe del botón y en las herramientas de
   desarrollo. Google lo documenta así, y por eso este archivo no usa el
   `client_secret` —el flujo de Identity Services con ID token no lo necesita—.
   O sea que tenerlo escrito en el JS del front no sería un agujero.

   El problema no es de secreto, es de DUPLICACIÓN. El mismo valor lo necesitan
   dos lados: el navegador, para dibujar el botón, y `api/progress.js`, para
   validar el `aud` del token. Con el valor escrito a mano en el front y además
   cargado como variable de entorno, son dos copias que pueden separarse — y el
   modo de falla es de los peores: el botón se dibuja bien, el usuario inicia
   sesión bien, y recién al guardar aparece un 401 genérico que a propósito no
   dice qué chequeo falló. Media hora de depurar algo que fue un error de tipeo.

   Con este endpoint, la única fuente es la variable de entorno de Vercel.
   El front la pide y no la conoce de antemano.

   Devuelve `{}` y no un 500 si falta: el sitio funciona completo contra
   `localStorage` sin sesión, así que "no hay login configurado" es un estado
   válido y no un error. */
function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "método no permitido" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "";

  // Cache corta: el valor no cambia entre despliegues, pero un cambio de
  // variable de entorno tiene que llegar sin esperar un día.
  res.setHeader("Cache-Control", "public, max-age=300");
  return res.status(200).json(clientId ? { clientId } : {});
}

module.exports = handler;
