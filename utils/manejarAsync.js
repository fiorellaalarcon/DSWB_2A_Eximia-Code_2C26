// Envuelve un controlador async: si algo falla (throw / promesa
// rechazada) el error se envia a next() y llega al middleware de
// errores. Evita repetir try/catch en cada controlador.
export const manejarAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
