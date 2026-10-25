// Error "esperado" de la aplicacion (404, 403, 409, ...).
// El middleware de errores lo convierte en una respuesta JSON clara
// usando el statusCode. Lo inesperado se responde como 500.
export class AppError extends Error {
  constructor(mensaje, statusCode = 500, errores = undefined) {
    super(mensaje);
    this.statusCode = statusCode;
    this.errores = errores; // lista opcional [{campo, mensaje}]
  }
}
