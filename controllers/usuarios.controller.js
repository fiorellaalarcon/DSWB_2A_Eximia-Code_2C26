// ============================================================
// CONTROLADOR USUARIOS (NUEVO) - solo rol administrador
// ============================================================
import { Usuario, ROLES } from "../models/Usuario.js";
import { Repartidor } from "../models/Repartidor.js";
import { AppError } from "../utils/AppError.js";
import { manejarAsync } from "../utils/manejarAsync.js";
import { filtroActivo } from "../utils/consultas.js";
import { registrarAuditoria } from "../services/auditoria.service.js";

const buscarOError = async (id) => {
  const u = await Usuario.findById(id);
  if (!u) throw new AppError("Usuario no encontrado.", 404);
  return u;
};

// Define a que repartidor queda vinculado el usuario (solo si su rol es "repartidor").
// Reglas: el repartidor debe existir y estar activo, y no puede estar vinculado a
// OTRO usuario (un chofer = una cuenta).
async function resolverRepartidor(rol, repartidorId, usuarioActualId) {
  if (rol !== ROLES.REPARTIDOR) return undefined; // otros roles: sin vinculo
  const rep = await Repartidor.findById(repartidorId);
  if (!rep) throw new AppError("El repartidor indicado no existe.", 404);
  if (!rep.activo) throw new AppError("El repartidor indicado esta inactivo.", 409);
  const yaVinculado = await Usuario.findOne({ repartidor: rep._id, activo: true, _id: { $ne: usuarioActualId } });
  if (yaVinculado) throw new AppError("Ese repartidor ya tiene un usuario asignado.", 409);
  return rep._id;
}

export const listar = manejarAsync(async (req, res) => {
  res.status(200).json(await Usuario.find(filtroActivo(req)).sort({ createdAt: -1 }));
});

export const obtener = manejarAsync(async (req, res) => {
  res.status(200).json(await buscarOError(req.params.id));
});

export const crear = manejarAsync(async (req, res) => {
  const { nombre, usuario, password, rol, repartidor } = req.body;
  const vinculo = await resolverRepartidor(rol, repartidor);
  const nuevo = await Usuario.create({ nombre, usuario, password, rol, repartidor: vinculo });
  await registrarAuditoria(req.usuario, { accion: "CREAR", entidad: "Usuario", entidadId: nuevo._id, detalle: `Alta de usuario "${nuevo.usuario}" con rol ${nuevo.rol}.` });
  res.status(201).json(nuevo); // password no se incluye (select:false)
});

export const actualizar = manejarAsync(async (req, res) => {
  const u = await buscarOError(req.params.id);
  if (!u.activo) throw new AppError("No se puede editar un usuario inactivo.", 409);
  const { nombre, usuario, password, rol, repartidor } = req.body;

  // Un administrador no puede quitarse a si mismo el rol (evita quedarse sin admins).
  if (String(u._id) === String(req.usuario._id) && rol !== u.rol)
    throw new AppError("No puede cambiar su propio rol.", 409);

  u.set({ nombre, usuario, rol, repartidor: await resolverRepartidor(rol, repartidor, u._id) });
  if (password) u.password = password; // la contrasena solo cambia si se envia
  await u.save();
  await registrarAuditoria(req.usuario, { accion: "MODIFICAR", entidad: "Usuario", entidadId: u._id, detalle: `Usuario "${u.usuario}" modificado${password ? " (incluye cambio de contrasena)" : ""}.` });
  res.status(200).json(u);
});

export const darDeBaja = manejarAsync(async (req, res) => {
  const u = await buscarOError(req.params.id);
  if (String(u._id) === String(req.usuario._id))
    throw new AppError("No puede darse de baja a si mismo.", 409);
  if (!u.activo) throw new AppError("El usuario ya esta inactivo.", 409);
  u.activo = false;
  await u.save();
  await registrarAuditoria(req.usuario, { accion: "BAJA", entidad: "Usuario", entidadId: u._id, detalle: `Usuario "${u.usuario}" dado de baja.` });
  res.status(200).json({ mensaje: "Usuario dado de baja correctamente.", usuario: u });
});

export const reactivar = manejarAsync(async (req, res) => {
  const u = await buscarOError(req.params.id);
  if (u.activo) throw new AppError("El usuario ya esta activo.", 409);
  u.activo = true;
  await u.save();
  await registrarAuditoria(req.usuario, { accion: "REACTIVAR", entidad: "Usuario", entidadId: u._id, detalle: `Usuario "${u.usuario}" reactivado.` });
  res.status(200).json({ mensaje: "Usuario reactivado correctamente.", usuario: u });
});
