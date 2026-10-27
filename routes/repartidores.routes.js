import { repartidoresController } from "../controllers/repartidores.controller.js";
import { validarRepartidor } from "../middlewares/validaciones.middleware.js";
import { crearRouterCrud } from "./crud.routes.js";
import { ROLES } from "../models/Usuario.js";

// /api/repartidores  (GET ?disponible=true, ...)
export default crearRouterCrud(repartidoresController, validarRepartidor, ROLES.PLANIFICADOR); // quien planifica rutas gestiona repartidores
