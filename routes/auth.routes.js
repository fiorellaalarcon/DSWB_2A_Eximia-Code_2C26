// Rutas de autenticacion. Solo POST /login es publica; logout y yo exigen sesion.
import { Router } from "express";
import { login, logout, yo } from "../controllers/auth.controller.js";
import { validarLogin } from "../middlewares/validaciones.middleware.js";
import { identificarUsuario } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/login", validarLogin, login);
router.post("/logout", identificarUsuario, logout);
router.get("/yo", identificarUsuario, yo);
export default router;
