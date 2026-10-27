// /api/auditoria - solo directivo y administrador (supervision).
import { Router } from "express";
import { listar } from "../controllers/auditoria.controller.js";
import { permitirRoles } from "../middlewares/roles.middleware.js";
import { ROLES } from "../models/Usuario.js";

const router = Router();
router.get("/", permitirRoles(ROLES.DIRECTIVO, ROLES.ADMINISTRADOR), listar);
export default router;
