import { Router } from "express";
import { repartidoresController } from "../controllers/repartidores.controller.js";
import { permitirRoles } from "../middlewares/roles.middleware.js";
import {
  validarId,
  validarRepartidor,
} from "../middlewares/validaciones.middleware.js";
import { ROLES } from "../models/Usuario.js";

const router = Router();

// Consultas
router.get("/", repartidoresController.listar);
router.get("/:id", validarId, repartidoresController.obtener);

// El planificador gestiona repartidores
router.post(
  "/",
  permitirRoles(ROLES.PLANIFICADOR),
  validarRepartidor,
  repartidoresController.crear
);

router.put(
  "/:id",
  permitirRoles(ROLES.PLANIFICADOR),
  validarId,
  validarRepartidor,
  repartidoresController.actualizar
);

router.delete(
  "/:id",
  permitirRoles(ROLES.PLANIFICADOR),
  validarId,
  repartidoresController.darDeBaja
);

// Solo el administrador puede reactivar registros
router.patch(
  "/:id/reactivar",
  permitirRoles(ROLES.ADMINISTRADOR),
  validarId,
  repartidoresController.reactivar
);

export default router;