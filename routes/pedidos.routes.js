// /api/pedidos
//  - Leer: todos los roles (el repartidor solo ve SUS pedidos asignados).
//  - Crear / editar (solo Pendiente): administrativo.
//  - Cambiar estado: deposito, planificador, administrativo o repartidor; el controlador
//    verifica ademas QUE paso puede hacer cada uno (tabla TRANSICIONES).
import { Router } from "express";
import * as controller from "../controllers/pedidos.controller.js";
import { permitirRoles } from "../middlewares/roles.middleware.js";
import { validarId, validarPedido, validarCambioEstado } from "../middlewares/validaciones.middleware.js";
import { ROLES } from "../models/Usuario.js";

const router = Router();
const { ADMINISTRATIVO, DEPOSITO, PLANIFICADOR, REPARTIDOR } = ROLES;

router.get("/", controller.listar); // ?cliente=<id>&estado=Pendiente
router.get("/:id", validarId, controller.obtener);
router.post("/", permitirRoles(ADMINISTRATIVO), validarPedido, controller.crear);
router.put("/:id", permitirRoles(ADMINISTRATIVO), validarId, validarPedido, controller.actualizar);
router.patch("/:id/estado", permitirRoles(DEPOSITO, PLANIFICADOR, ADMINISTRATIVO, REPARTIDOR), validarId, validarCambioEstado, controller.cambiarEstado);
// No hay DELETE: un pedido no se borra, se cancela (PATCH estado = Cancelado).

export default router;
