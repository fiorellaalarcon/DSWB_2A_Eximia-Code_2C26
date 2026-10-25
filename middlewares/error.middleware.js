// ============================================================
// MIDDLEWARE DE ERRORES CENTRALIZADO
// ============================================================
// CAMBIO vs 1ra entrega: antes todo error era 500. Ahora se traducen
// los errores conocidos a su codigo HTTP correcto.
// ============================================================
import { AppError } from "../utils/AppError.js";

export function errorHandler(error, req, res, next) {
  // 1) Errores propios de la aplicacion (404, 403, 409, 400...).
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(error.errores && { errores: error.errores }),
    });
  }

  // 2) Validacion del esquema de Mongoose (required, min, enum...).
  if (error.name === "ValidationError") {
    const errores = Object.values(error.errors).map((e) => ({
      campo: e.path,
      mensaje: e.message,
    }));
    return res.status(400).json({ error: "Datos invalidos.", errores });
  }

  // 3) Id con formato incorrecto.
  if (error.name === "CastError") {
    return res.status(400).json({ error: `Valor invalido para "${error.path}".` });
  }

  // 4) Clave duplicada (indice unique): email, usuario...
  if (error.code === 11000) {
    const campo = Object.keys(error.keyPattern || {})[0] || "campo";
    return res.status(409).json({ error: `Ya existe un registro con ese ${campo}.` });
  }

  // 5) JSON mal formado en el body.
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la solicitud no es un JSON valido." });
  }

  // 6) Cualquier otro: error interno (no se expone el detalle al cliente).
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor." });
}
