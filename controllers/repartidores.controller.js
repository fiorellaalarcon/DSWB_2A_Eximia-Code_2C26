// ============================================================
// CONTROLADOR REPARTIDORES (NUEVO)
// ============================================================
import { Repartidor } from "../models/Repartidor.js";
import { AppError } from "../utils/AppError.js";
import { crearControladorCrud } from "./crud.factory.js";

export const repartidoresController = crearControladorCrud({
  Modelo: Repartidor,
  entidad: "Repartidor",
  campos: ["nombre", "telefono", "patente"],
  // GET /api/repartidores?disponible=true  -> solo los que pueden recibir un pedido
  filtroExtra: (req) =>
    req.query.disponible === undefined ? {} : { disponible: req.query.disponible === "true" },
  // Un repartidor con una entrega en curso no se puede dar de baja.
  verificarBaja: async (repartidor) => {
    if (!repartidor.disponible)
      throw new AppError("El repartidor tiene una entrega en curso; no se puede dar de baja.", 409);
  },
});