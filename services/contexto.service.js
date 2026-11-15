// ============================================================
// SERVICES / CONTEXTO.SERVICE.JS  (NUEVO)
// ============================================================
// Arma el bloque "Datos operativos" que se le entrega al asistente de IA para
// que responda con datos reales de FreshRoute (mejora sobre el ejemplo de clase,
// donde el prompt era estatico). Solo se envian CANTIDADES agregadas, nunca
// nombres, direcciones ni datos personales (privacidad hacia un servicio externo).
// ============================================================
import { Pedido, ESTADOS_PEDIDO } from "../models/Pedido.js";

export async function resumenOperativo(usuario) {
  // El repartidor solo "ve" sus propios pedidos, tambien a traves del asistente.
  const filtro = usuario.rol === "repartidor" ? { repartidor: usuario.repartidor ?? null } : {};
  const grupos = await Pedido.aggregate([{ $match: filtro }, { $group: { _id: "$estado", cantidad: { $sum: 1 } } }]);
  const cantidades = Object.fromEntries(grupos.map((g) => [g._id, g.cantidad]));
  const lineas = ESTADOS_PEDIDO.map((e) => `- ${e}: ${cantidades[e] ?? 0}`);
  const alcance = usuario.rol === "repartidor" ? "Pedidos asignados al usuario" : "Pedidos de toda la empresa";
  return `${alcance} por estado:\n${lineas.join("\n")}\nRol del usuario que consulta: ${usuario.rol}`;
}
