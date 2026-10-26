// /api/usuarios - TODO el modulo es exclusivo del administrador.
import { Router } from "express";
import * as controller from "../controllers/usuarios.controller.js";
import { permitirRoles } from "../middlewares/roles.middleware.js";
import { validarId, validarUsuarioAlta, validarUsuarioEdicion } from "../middlewares/validaciones.middleware.js";
import { ROLES } from "../models/Usuario.js";

const router = Router();
router.use(permitirRoles(ROLES.ADMINISTRADOR)); // aplica a todas las rutas de este router

router.get("/", controller.listar);
router.get("/:id", validarId, controller.obtener);
router.post("/", validarUsuarioAlta, controller.crear);
router.put("/:id", validarId, validarUsuarioEdicion, controller.actualizar);
router.delete("/:id", validarId, controller.darDeBaja);
router.patch("/:id/reactivar", validarId, controller.reactivar);

export default router;
