// ============================================================
// RUTAS DE VISTAS (Pug)
// ============================================================
// Cada ruta solo renderiza la plantilla. Los datos NO se inyectan
// desde el servidor: el JavaScript del navegador los pide con fetch()
// a la API (/api/...) y arma la tabla en el DOM.
// ============================================================
import { Router } from "express";

const router = Router();

const paginas = [
  { ruta: "/panel", vista: "panel", titulo: "Panel" },
  { ruta: "/clientes", vista: "clientes", titulo: "Clientes" },
  { ruta: "/productos", vista: "productos", titulo: "Productos" },
  { ruta: "/repartidores", vista: "repartidores", titulo: "Repartidores" },
  { ruta: "/pedidos", vista: "pedidos", titulo: "Pedidos" },
  { ruta: "/usuarios", vista: "usuarios", titulo: "Usuarios" },
  { ruta: "/auditoria", vista: "auditoria", titulo: "Auditoria" },
];

router.get("/", (req, res) => res.redirect("/login"));
router.get("/login", (req, res) => res.render("login", { titulo: "Iniciar sesion", publica: true }));
paginas.forEach(({ ruta, vista, titulo }) => router.get(ruta, (req, res) => res.render(vista, { titulo })));

export default router;
