// ============================================================
// CONTROLADOR PRODUCTOS (usa la fabrica CRUD)
// ============================================================
import { Producto } from "../models/Producto.js";
import { crearControladorCrud } from "./crud.factory.js";

export const productosController = crearControladorCrud({
  Modelo: Producto,
  entidad: "Producto",
  campos: ["nombre", "descripcion", "precio"],
  // Consulta por query: GET /api/productos?nombre=tomate  (se conserva de la 1ra entrega)
  filtroExtra: (req) =>
    req.query.nombre
      ? { nombre: new RegExp(String(req.query.nombre).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }
      : {},
  // Dar de baja un producto es seguro: los pedidos viejos guardan su precioUnitario.
});