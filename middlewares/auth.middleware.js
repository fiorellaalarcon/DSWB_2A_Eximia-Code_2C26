// ============================================================
// MIDDLEWARES DE AUTENTICACION (CAMBIA en la 3ra entrega)
// ============================================================
// 2da entrega: el navegador enviaba "x-usuario-id" (se podia falsificar).
// 3ra entrega: el login entrega un JWT FIRMADO dentro de una cookie httpOnly.
// Para falsificarlo habria que conocer JWT_SECRET (solo existe en el servidor).
//
// Siguen igual: el ROL se lee de MongoDB y se verifica que el usuario este activo,
// y los controladores reciben el mismo req.usuario (por eso no hubo que tocarlos).
// ============================================================
import { Usuario } from "../models/Usuario.js";
import { AppError } from "../utils/AppError.js";
import { manejarAsync } from "../utils/manejarAsync.js";
import { NOMBRE_COOKIE, verificarToken } from "../services/auth.service.js";
import { menuParaRol } from "../config/menu.js";

// Devuelve el usuario dueño de la cookie o lanza AppError 401.
export async function usuarioDesdeToken(token) {
  if (!token) throw new AppError("Debe iniciar sesion para realizar esta operacion.", 401);
  const { id } = verificarToken(token);
  const usuario = await Usuario.findById(id);
  if (!usuario || !usuario.activo) throw new AppError("Usuario inexistente o dado de baja.", 401);
  return usuario;
}

// Para la API (/api/...): responde 401 en JSON.
export const identificarUsuario = manejarAsync(async (req, res, next) => {
  req.usuario = await usuarioDesdeToken(req.cookies?.[NOMBRE_COOKIE]);
  next();
});

// Para las PAGINAS (Pug): si no hay sesion valida redirige al login (como protegerRuta de la clase).
// Si el rol no corresponde a la pagina, vuelve al panel. Deja el usuario y el menu para la vista.
export const protegerVista = (...rolesPermitidos) => async (req, res, next) => {
  try {
    const usuario = await usuarioDesdeToken(req.cookies?.[NOMBRE_COOKIE]);
    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) return res.redirect("/panel");
    req.usuario = usuario;
    res.locals.usuario = usuario; // disponible en todas las plantillas Pug
    res.locals.menu = menuParaRol(usuario.rol);
    res.locals.rutaActual = req.path;
    next();
  } catch {
    res.clearCookie(NOMBRE_COOKIE);
    res.redirect("/login");
  }
};
