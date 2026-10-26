import { clientesController } from "../controllers/clientes.controller.js";
import { validarCliente } from "../middlewares/validaciones.middleware.js";
import { crearRouterCrud } from "./crud.routes.js";
import { ROLES } from "../models/Usuario.js";

// /api/clientes  (GET ?nombre=, GET /:id, POST, PUT /:id, DELETE /:id [baja], PATCH /:id/reactivar)
export default crearRouterCrud(clientesController, validarCliente, ROLES.ADMINISTRATIVO); // la oficina administra clientes
