// ============================================================
// SERVICIO DE AUDITORIA (NUEVO)
// ============================================================
// Un unico lugar para registrar "quien hizo que y cuando".
// Los controladores lo llaman despues de cada accion importante.
// Si fallara el registro NO debe romper la operacion principal.
// ============================================================
import { Auditoria } from "../models/Auditoria.js";

export async function registrarAuditoria(usuario, { accion, entidad, entidadId = "", detalle = "" }) {
  try {
    await Auditoria.create({
      usuario: usuario?._id,
      usuarioNombre: usuario?.nombre,
      rol: usuario?.rol,
      accion,
      entidad,
      entidadId: String(entidadId),
      detalle,
    });
  } catch (error) {
    console.error("No se pudo registrar la auditoria:", error.message);
  }
}
