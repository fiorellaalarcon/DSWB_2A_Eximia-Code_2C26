// ============================================================
// MIDDLEWARE DE ROLES / PERMISOS (NUEVO)
// ============================================================
// Principio de MINIMO PRIVILEGIO: cada ruta declara explicitamente
// que roles pueden usarla; todo lo demas se rechaza con 403.
//
//   router.post("/", permitirRoles(ROLES.ADMINISTRATIVO), ...)
// ============================================================
import { AppError } from "../utils/AppError.js";

export const permitirRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return next(
      new AppError(
        `El rol "${req.usuario.rol}" no tiene permiso para esta operacion.`,
        403
      )
    );
  }
  next();
};

// Lo contrario: deja pasar a todos MENOS a los roles indicados. Se usa para que el
// repartidor (chofer) no pueda consultar clientes, productos ni otros repartidores.
export const denegarRoles = (...rolesDenegados) => (req, res, next) => {
  if (rolesDenegados.includes(req.usuario.rol)) {
    return next(new AppError(`El rol "${req.usuario.rol}" no tiene permiso para este recurso.`, 403));
  }
  next();
};
