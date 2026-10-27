// ============================================================
// CONTROLADOR AUDITORIA (NUEVO) - solo lectura
// ============================================================
// GET /api/auditoria?entidad=Pedido&accion=CAMBIO_ESTADO&limite=50
// ============================================================
import { Auditoria } from "../models/Auditoria.js";
import { manejarAsync } from "../utils/manejarAsync.js";

export const listar = manejarAsync(async (req, res) => {
  const { entidad, accion, usuarioNombre } = req.query;
  const filtro = {};
  if (entidad) filtro.entidad = entidad;
  if (accion) filtro.accion = accion;
  if (usuarioNombre) filtro.usuarioNombre = usuarioNombre;

  const limite = Math.min(Number(req.query.limite) || 50, 200); // tope para no traer todo
  res.status(200).json(await Auditoria.find(filtro).sort({ fecha: -1 }).limit(limite));
});
