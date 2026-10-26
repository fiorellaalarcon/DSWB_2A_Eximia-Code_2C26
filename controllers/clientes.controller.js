// ============================================================
// CONTROLADOR CLIENTES
// ============================================================
// CAMBIO: antes ~200 lineas leyendo/escribiendo JSON. Ahora usa la
// fabrica CRUD + Mongoose. Solo se declara lo propio de Clientes.
// ============================================================
import { Cliente } from "../models/Cliente.js";
import { Pedido } from "../models/Pedido.js";
import { AppError } from "../utils/AppError.js";
import { crearControladorCrud } from "./crud.factory.js";

export const clientesController = crearControladorCrud({
  Modelo: Cliente,
  entidad: "Cliente",
  campos: ["nombre", "email", "direccion", "telefono"],
  // Consulta por query: GET /api/clientes?nombre=central
  filtroExtra: (req) =>
    req.query.nombre ? { nombre: new RegExp(escapar(req.query.nombre), "i") } : {},
  // Regla de negocio: no se da de baja un cliente con pedidos en curso.
  verificarBaja: async (cliente) => {
    const enCurso = await Pedido.countDocuments({
      cliente: cliente._id,
      estado: { $in: ["Pendiente", "Preparado", "En camino"] },
    });
    if (enCurso > 0)
      throw new AppError("El cliente tiene pedidos en curso; no se puede dar de baja.", 409);
  },
});

// Escapa caracteres especiales de regex en lo que escribe el usuario.
function escapar(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
