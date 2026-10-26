// Registra en consola metodo y URL de cada solicitud (se conserva de la 1ra entrega,
// ahora como modulo ES: "export" en lugar de "module.exports").
export function logger(req, res, next) {
  // En los tests se silencia para no ensuciar la salida.
  if (process.env.NODE_ENV !== "test") console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}
