// Rutas de autenticacion. /api/auth/login es la unica ruta PUBLICA de la API.
import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { validarLogin } from "../middlewares/validaciones.middleware.js";

const router = Router();
router.post("/login", validarLogin, login);
export default router;
