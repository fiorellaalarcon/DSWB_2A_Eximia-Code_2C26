// ============================================================
// CONTROLADOR AUTH (CAMBIA en la 3ra entrega)
// ============================================================
// Login: valida credenciales contra el HASH, firma un JWT y lo guarda en una
// cookie httpOnly. Logout: borra la cookie. /yo: devuelve el usuario logueado.
// Mensaje generico ("Credenciales invalidas") para no revelar si el usuario existe.
//
// No hay registro publico a proposito: los usuarios y sus roles los da de alta el
// administrador (un chofer no puede auto-asignarse el rol "planificador").
// ============================================================
import { Usuario } from "../models/Usuario.js";
import { AppError } from "../utils/AppError.js";
import { manejarAsync } from "../utils/manejarAsync.js";
import { registrarAuditoria } from "../services/auditoria.service.js";
import { NOMBRE_COOKIE, firmarToken, opcionesCookie } from "../services/auth.service.js";

const datosPublicos = (u) => ({ id: u._id, nombre: u.nombre, usuario: u.usuario, rol: u.rol });

export const login = manejarAsync(async (req, res) => {
  const { usuario, password } = req.body;

  // Los campos del hash estan ocultos por defecto (select:false): se piden explicitamente.
  const encontrado = await Usuario.findOne({
    usuario: String(usuario).trim().toLowerCase(),
    activo: true,
  }).select("+passwordHash +salt");

  if (!encontrado || !(await encontrado.verificarPassword(password))) {
    await registrarAuditoria(encontrado, {
      accion: "LOGIN_FALLIDO", entidad: "Usuario",
      entidadId: encontrado?._id, detalle: `Intento fallido para "${usuario}".`,
    });
    throw new AppError("Credenciales invalidas.", 401);
  }

  await registrarAuditoria(encontrado, { accion: "LOGIN", entidad: "Usuario", entidadId: encontrado._id, detalle: "Inicio de sesion." });

  res.cookie(NOMBRE_COOKIE, firmarToken(encontrado), opcionesCookie()); // JWT en cookie httpOnly
  res.status(200).json({ mensaje: "Inicio de sesion correcto.", usuario: datosPublicos(encontrado) });
});

export const logout = manejarAsync(async (req, res) => {
  await registrarAuditoria(req.usuario, { accion: "LOGOUT", entidad: "Usuario", entidadId: req.usuario._id, detalle: "Cierre de sesion." });
  res.clearCookie(NOMBRE_COOKIE);
  res.status(200).json({ mensaje: "Sesion cerrada." });
});

export const yo = (req, res) => res.status(200).json({ usuario: datosPublicos(req.usuario) });
