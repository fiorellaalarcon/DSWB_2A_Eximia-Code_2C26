// ============================================================
// APP.JS - CONFIGURACION DE EXPRESS (sin levantar el servidor)
// ============================================================
// CAMBIOS vs 1ra entrega:
//  - ES Modules (import/export) en vez de require/module.exports
//    ("type": "module" en package.json). __dirname ya no existe, se
//    reconstruye con import.meta.url.
//  - app.js solo CONFIGURA; server.js conecta a Mongo y escucha.
//    Asi los tests pueden importar la app sin abrir un puerto.
//  - Se agregan: login, identificacion por usuario, roles, usuarios,
//    repartidores, auditoria y las vistas Pug con fetch.
// ============================================================
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { logger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { identificarUsuario } from "./middlewares/auth.middleware.js";
import { denegarRoles } from "./middlewares/roles.middleware.js";
import { ROLES } from "./models/Usuario.js";

import vistasRoutes from "./routes/vistas.routes.js";
import authRoutes from "./routes/auth.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import repartidoresRoutes from "./routes/repartidores.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import auditoriaRoutes from "./routes/auditoria.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ---- Middlewares generales ----
app.use(express.json()); // body JSON (lo que envia fetch)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // css y js del navegador
app.use(logger);

// ---- Pug ----
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// ---- Vistas (paginas HTML) ----
app.use("/", vistasRoutes);

// ---- API ----
app.use("/api/auth", authRoutes); // publica (login)

// Desde aqui TODA la API exige usuario identificado (401 si no).
app.use("/api", identificarUsuario);
// El repartidor (chofer) solo usa /api/pedidos: se le niega el resto (minimo privilegio).
const sinRepartidor = denegarRoles(ROLES.REPARTIDOR);
app.use("/api/clientes", sinRepartidor, clientesRoutes);
app.use("/api/productos", sinRepartidor, productosRoutes);
app.use("/api/repartidores", sinRepartidor, repartidoresRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/auditoria", auditoriaRoutes);

// ---- 404 y errores ----
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada", ruta: req.originalUrl }));
app.use(errorHandler);

export default app;
