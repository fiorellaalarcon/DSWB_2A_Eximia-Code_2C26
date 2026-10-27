// ============================================================
// Arma el Router de un modulo CRUD con baja logica.
// Aqui se ve el MINIMO PRIVILEGIO: cada verbo declara que roles lo usan.
//   lectura   -> cualquier usuario identificado (activos; inactivos solo directivo/admin)
//   escritura -> el rol que corresponde al modulo (se pasa por parametro)
//   reactivar -> administrador
// El orden importa: identificar -> permisos -> validar -> controlador.
// ============================================================
import { Router } from "express";
import { permitirRoles } from "../middlewares/roles.middleware.js";
import { validarId } from "../middlewares/validaciones.middleware.js";
import { ROLES } from "../models/Usuario.js";

export function crearRouterCrud(controller, validarBody, rolEscritura) {
  const router = Router();
  const { ADMINISTRADOR } = ROLES;

  router.get("/", controller.listar);
  router.get("/:id", validarId, controller.obtener);
  router.post("/", permitirRoles(rolEscritura), validarBody, controller.crear);
  router.put("/:id", permitirRoles(rolEscritura), validarId, validarBody, controller.actualizar);
  router.delete("/:id", permitirRoles(rolEscritura), validarId, controller.darDeBaja);
  router.patch("/:id/reactivar", permitirRoles(ADMINISTRADOR), validarId, controller.reactivar);
  return router;
}