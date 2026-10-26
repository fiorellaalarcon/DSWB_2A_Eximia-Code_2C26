// ============================================================
// UTILS / CONSULTAS.JS - Reglas comunes de consulta
// ============================================================
import { AppError } from "./AppError.js";
import { ROLES } from "../models/Usuario.js";

// Solo directivo y administrador pueden ver registros inactivos
// (historial). Los roles operativos (administrativo, deposito, planificador) solo operan sobre registros activos.
const ROLES_HISTORIAL = [ROLES.DIRECTIVO, ROLES.ADMINISTRADOR];

// Devuelve el filtro de Mongo para "activo".
//  - Consulta habitual:            { activo: true }
//  - ?incluirInactivos=true:       {} (todos)  -> requiere permiso
//  - ?soloInactivos=true:          { activo: false } -> requiere permiso
export function filtroActivo(req) {
  const { incluirInactivos, soloInactivos } = req.query;
  if (incluirInactivos !== "true" && soloInactivos !== "true") {
    return { activo: true };
  }
  if (!ROLES_HISTORIAL.includes(req.usuario.rol)) {
    throw new AppError(
      "No tiene permiso para consultar registros inactivos.",
      403
    );
  }
  return soloInactivos === "true" ? { activo: false } : {};
}
