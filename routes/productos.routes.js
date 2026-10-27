import { productosController } from "../controllers/productos.controller.js";
import { validarProducto } from "../middlewares/validaciones.middleware.js";
import { crearRouterCrud } from "./crud.routes.js";
import { ROLES } from "../models/Usuario.js";

// /api/productos  (GET ?nombre=tomate, ...)
export default crearRouterCrud(productosController, validarProducto, ROLES.ADMINISTRATIVO); // la oficina administra el catalogo
