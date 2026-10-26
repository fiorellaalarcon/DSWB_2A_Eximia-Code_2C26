// ============================================================
// CONTROLADOR AUTH (NUEVO) - LOGIN
// ============================================================
// Valida usuario + contrasena contra MongoDB.
// Sin sesiones / cookies / JWT (aun no vistos): si es correcto
// devuelve los datos basicos del usuario y el frontend los guarda.
// Mensaje generico ("Credenciales invalidas") para no revelar si
// el usuario existe o no.
// ============================================================
import { Usuario } from "../models/Usuario.js";
import { AppError } from "../utils/AppError.js";
import { manejarAsync } from "../utils/manejarAsync.js";
import { registrarAuditoria } from "../services/auditoria.service.js";

export const login = manejarAsync(async (req, res) => {
  const { usuario, password } = req.body;

  // .select("+password"): la contrasena esta oculta por defecto en el esquema.
  const encontrado = await Usuario.findOne({
    usuario: String(usuario).trim().toLowerCase(),
    activo: true,
  }).select("+password");

  if (!encontrado || !encontrado.verificarPassword(password)) {
    await registrarAuditoria(encontrado, {
      accion: "LOGIN_FALLIDO", entidad: "Usuario",
      entidadId: encontrado?._id, detalle: `Intento fallido para "${usuario}".`,
    });
    throw new AppError("Credenciales invalidas.", 401);
  }

  await registrarAuditoria(encontrado, { accion: "LOGIN", entidad: "Usuario", entidadId: encontrado._id, detalle: "Inicio de sesion." });

  // Nunca se devuelve la contrasena.
  res.status(200).json({
    mensaje: "Inicio de sesion correcto.",
    usuario: { id: encontrado._id, nombre: encontrado.nombre, usuario: encontrado.usuario, rol: encontrado.rol },
  });
});
