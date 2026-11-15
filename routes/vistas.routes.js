// ============================================================
// RUTAS DE VISTAS (Pug)  (CAMBIA en la 3ra entrega)
// ============================================================
// Cada pagina esta PROTEGIDA EN EL SERVIDOR con protegerVista(roles): sin sesion
// valida redirige a /login; con un rol no autorizado vuelve al panel.
// (En la 2da entrega las paginas se podian abrir sin sesion.)
// Los datos de cada tabla siguen llegando por fetch() a la API.
// ============================================================
import { Router } from "express";
import { protegerVista, usuarioDesdeToken } from "../middlewares/auth.middleware.js";
import { NOMBRE_COOKIE } from "../services/auth.service.js";

const router = Router();
const SIN_REPARTIDOR = ["administrador", "administrativo", "deposito", "planificador", "directivo"];

const paginas = [
  { ruta: "/panel", vista: "panel", titulo: "Panel", roles: [] }, // [] = cualquier rol autenticado
  { ruta: "/clientes", vista: "clientes", titulo: "Clientes", roles: SIN_REPARTIDOR },
  { ruta: "/productos", vista: "productos", titulo: "Productos", roles: SIN_REPARTIDOR },
  { ruta: "/repartidores", vista: "repartidores", titulo: "Repartidores", roles: SIN_REPARTIDOR },
  { ruta: "/pedidos", vista: "pedidos", titulo: "Pedidos", roles: [] },
  { ruta: "/chat", vista: "chat", titulo: "Chat de operaciones", roles: [] },
  { ruta: "/usuarios", vista: "usuarios", titulo: "Usuarios", roles: ["administrador"] },
  { ruta: "/auditoria", vista: "auditoria", titulo: "Auditoria", roles: ["administrador", "directivo"] },
];

router.get("/", (req, res) => res.redirect("/panel")); // si no hay sesion, /panel redirige a /login

// Si ya hay sesion valida, el login redirige al panel.
router.get("/login", async (req, res) => {
  try {
    await usuarioDesdeToken(req.cookies?.[NOMBRE_COOKIE]);
    return res.redirect("/panel");
  } catch {
    res.render("login", { titulo: "Iniciar sesion" });
  }
});

paginas.forEach(({ ruta, vista, titulo, roles }) =>
  router.get(ruta, protegerVista(...roles), (req, res) => res.render(vista, { titulo }))
);

export default router;
