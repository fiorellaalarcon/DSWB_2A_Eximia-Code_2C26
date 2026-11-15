// ============================================================
// APP.JS - CONFIGURACION DE EXPRESS (sin levantar el servidor)
// ============================================================
// 3ra entrega: se agrega cookie-parser (para leer el JWT de la cookie), las
// vistas pasan a estar PROTEGIDAS en el servidor, y un endpoint /health para
// el despliegue. El servidor HTTP + Socket.IO se arman en config/servidor.js
// y se inician en index.js.
// ============================================================
import express from "express";
import cookieParser from "cookie-parser";
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

app.set("trust proxy", 1); // Render (y otros) estan detras de un proxy HTTPS
app.disable("x-powered-by"); // no anunciar "Express" en cada respuesta

// ---- Middlewares generales ----
app.use(express.json({ limit: "100kb" })); // body JSON (lo que envia fetch); tope de tamano
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // llena req.cookies (ahi viaja el JWT)
app.use(express.static(path.join(__dirname, "public"))); // css, js e imagenes
app.use(logger);

// ---- Pug ----
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// ---- Chequeo de salud (lo usa Render para saber si la app esta viva) ----
app.get("/health", (req, res) => res.status(200).json({ estado: "ok" }));

// ---- Vistas (paginas HTML, protegidas por rol en el servidor) ----
app.use("/", vistasRoutes);

// ---- API ----
app.use("/api/auth", authRoutes); // login publico; logout y /yo exigen sesion

// Desde aqui TODA la API exige sesion valida (JWT en cookie): 401 si no.
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
